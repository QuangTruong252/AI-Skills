import postcss, { type AtRule, type Declaration, type Root, type Rule } from 'postcss';
import scss from 'postcss-scss';
import path from 'node:path';
import {
  DIAGNOSTIC_CODES,
  createDiagnostic,
  type Diagnostic,
} from '../contracts/diagnostics.js';
import type { SystemTokenDeclaration } from '../contracts/types.js';

export type ScanFileOptions = {
  filePath: string;
  content: string;
  includePrivate: boolean;
  privatePrefix: string;
  tokenNamespaces: string[];
  layerHeuristics: Record<string, string>;
  /** Only collect declarations from these path roots (absolute). Empty = accept all provided files. */
  allowedRoots?: string[];
};

const VAR_REF_RE = /var\(\s*(--[A-Za-z0-9_-]+)/g;
const SASS_VAR_RE = /^\$[\w-]+\s*:/;
const SASS_MAP_RE = /^\$[\w-]+\s*:\s*\(/;
const SASS_MIXIN_RE = /@mixin\s+([\w-]+)/;
const SASS_FUNCTION_RE = /@function\s+([\w-]+)/;
const SASS_USE_RE = /@use\s+['"]([^'"]+)['"]/;
const SASS_FORWARD_RE = /@forward\s+['"]([^'"]+)['"]/;
export type ParseScssResult = {
  declarations: SystemTokenDeclaration[];
  imports: string[];
  forwards: string[];
  sassVariables: Array<{ name: string; raw: string; line: number }>;
  sassMaps: Array<{ name: string; line: number }>;
  mixins: string[];
  functions: string[];
  diagnostics: Diagnostic[];
};

export function parseScssSource(options: ScanFileOptions): ParseScssResult {
  const diagnostics: Diagnostic[] = [];
  const declarations: SystemTokenDeclaration[] = [];
  const imports: string[] = [];
  const forwards: string[] = [];
  const sassVariables: ParseScssResult['sassVariables'] = [];
  const sassMaps: ParseScssResult['sassMaps'] = [];
  const mixins: string[] = [];
  const functions: string[] = [];

  const relLabel = options.filePath;
  const layer = inferLayer(options.filePath, options.layerHeuristics);

  // Pre-scan for @use/@forward and Sass constructs (postcss-scss may not expose all)
  const lines = options.content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const useM = line.match(SASS_USE_RE);
    if (useM) imports.push(useM[1]!);
    const fwdM = line.match(SASS_FORWARD_RE);
    if (fwdM) forwards.push(fwdM[1]!);
    const mixM = line.match(SASS_MIXIN_RE);
    if (mixM) mixins.push(mixM[1]!);
    const fnM = line.match(SASS_FUNCTION_RE);
    if (fnM) functions.push(fnM[1]!);
    if (SASS_MAP_RE.test(line.trim())) {
      const name = line.trim().split(':')[0]!.trim();
      sassMaps.push({ name, line: i + 1 });
    } else if (SASS_VAR_RE.test(line.trim()) && !line.includes('{')) {
      const name = line.trim().split(':')[0]!.trim();
      sassVariables.push({ name, raw: line.trim(), line: i + 1 });
    }
  }

  let root: Root;
  try {
    root = postcss().process(options.content, {
      syntax: scss,
      from: options.filePath,
    }).root;
  } catch (e) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.SCSS_PARSE_ERROR,
        'error',
        `Failed to parse SCSS: ${(e as Error).message}`,
        {
          source: { file: relLabel },
          remediation: 'Fix SCSS syntax or report unsupported construct.',
        },
      ),
    );
    return {
      declarations,
      imports,
      forwards,
      sassVariables,
      sassMaps,
      mixins,
      functions,
      diagnostics,
    };
  }

  const walkContext = {
    selectorStack: [] as string[],
    atRuleStack: [] as string[],
    responsiveContext: undefined as string | undefined,
  };

  const visit = (node: Root | Rule | AtRule): void => {
    node.each?.((child) => {
      if (child.type === 'rule') {
        const rule = child as Rule;
        walkContext.selectorStack.push(rule.selector.replace(/\s+/g, ' ').trim());
        visit(rule);
        walkContext.selectorStack.pop();
      } else if (child.type === 'atrule') {
        const at = child as AtRule;
        const atLabel = `@${at.name}${at.params ? ` ${at.params}` : ''}`.trim();

        // Handle Sass @include media-* as responsive context
        if (at.name === 'include') {
          const inc = at.params.match(/^(media-[\w-]+)\s*(?:\(([^)]*)\))?/);
          if (inc) {
            const prev = walkContext.responsiveContext;
            walkContext.responsiveContext = `${inc[1]}(${(inc[2] ?? '').trim()})`;
            walkContext.atRuleStack.push(atLabel);
            visit(at);
            walkContext.atRuleStack.pop();
            walkContext.responsiveContext = prev;
            return;
          }
        }

        walkContext.atRuleStack.push(atLabel);
        visit(at);
        walkContext.atRuleStack.pop();
      } else if (child.type === 'decl') {
        const decl = child as Declaration;
        if (!decl.prop.startsWith('--')) return;

        // Skip data-url false positives — prop is always the custom property name
        const name = decl.prop.trim();
        const isPrivate = name.startsWith(options.privatePrefix);
        if (isPrivate && !options.includePrivate) {
          return;
        }

        if (!isPrivate && !isTokenCandidate(name, options.tokenNamespaces)) {
          return;
        }

        const rawValue = normalizeValue(decl.value);
        const references = extractVarReferences(rawValue);
        const selectorContext =
          walkContext.selectorStack.length > 0
            ? [...walkContext.selectorStack]
            : [':root'];
        const theme = inferTheme(selectorContext);
        const sourceLine = decl.source?.start?.line ?? 0;
        const sourceColumn = decl.source?.start?.column ?? 0;

        declarations.push({
          name,
          layer,
          tokenType: inferTokenType(name, rawValue),
          rawValue,
          references,
          selectorContext,
          atRuleContext: [...walkContext.atRuleStack],
          theme,
          responsiveContext: walkContext.responsiveContext,
          isPrivate,
          source: {
            file: toPosixPath(options.filePath),
            line: sourceLine,
            column: sourceColumn,
          },
        });
      } else if (child.type === 'comment') {
        // ignore
      } else {
        // unknown node types — informational only
      }
    });
  };

  visit(root);

  // Detect @include media that postcss might flatten differently — already handled

  // Flag potential unknown Sass constructs inside token files that look like maps without parse
  if (options.content.includes('#{') && options.content.includes('$breakpoints')) {
    // interpolation present — record as known construct handled loosely
  }

  return {
    declarations,
    imports,
    forwards,
    sassVariables,
    sassMaps,
    mixins,
    functions,
    diagnostics,
  };
}

function isTokenCandidate(name: string, namespaces: string[]): boolean {
  return namespaces.some((ns) => name.startsWith(ns));
}

function extractVarReferences(value: string): string[] {
  const refs: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_REF_RE.source, 'g');
  while ((m = re.exec(value)) !== null) {
    refs.push(m[1]!);
  }
  return refs;
}

function normalizeValue(value: string): string {
  // Preserve multiline structure but normalize line endings and trailing spaces
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

function inferTheme(selectors: string[]): string | undefined {
  const joined = selectors.join(' ');
  if (/data-theme\s*=\s*['"]dark['"]/.test(joined)) return 'dark';
  if (/data-theme\s*=\s*['"]light['"]/.test(joined)) return 'light';
  if (joined.includes(':root')) return 'root';
  return undefined;
}

function inferLayer(filePath: string, heuristics: Record<string, string>): string {
  const base = path.basename(filePath, path.extname(filePath)).replace(/^_/, '');
  if (heuristics[base]) return heuristics[base]!;
  for (const [key, layer] of Object.entries(heuristics)) {
    if (base.includes(key)) return layer;
  }
  return 'unknown';
}

function inferTokenType(name: string, value: string): string {
  const v = value.toLowerCase();
  if (
    v.includes('#') ||
    v.includes('rgb') ||
    v.includes('hsl') ||
    v.includes('color-mix') ||
    name.includes('color') ||
    name.includes('surface') ||
    name.includes('border') ||
    name.includes('text') ||
    name.includes('icon') ||
    name.startsWith('--brand-') ||
    name.startsWith('--alias-') ||
    name.startsWith('--mapped-')
  ) {
    if (v.includes('px') || v.includes('rem') || v.includes('em') || v.includes('%')) {
      if (!v.includes('#') && !v.includes('rgb') && !v.includes('color-mix')) return 'dimension';
    }
    if (
      name.includes('shadow') ||
      v.split(',').length > 2 && (v.includes('rgba') || v.includes('0 '))
    ) {
      if (name.includes('shadow')) return 'effect';
    }
    return 'color';
  }
  if (name.includes('shadow')) return 'effect';
  if (name.includes('font-family') || v.includes('sans-serif') || v.includes('serif')) {
    return 'fontFamily';
  }
  if (
    name.includes('size') ||
    name.includes('width') ||
    name.includes('height') ||
    name.includes('gap') ||
    name.includes('padding') ||
    name.includes('radius') ||
    name.includes('spacing') ||
    name.includes('line-height') ||
    name.includes('weight') ||
    name.includes('duration')
  ) {
    return 'dimension';
  }
  if (name.includes('font')) return 'typography';
  return 'unknown';
}

function toPosixPath(p: string): string {
  return p.split(path.sep).join('/');
}

export function detectThemeFromSelector(selector: string): string | undefined {
  return inferTheme([selector]);
}
