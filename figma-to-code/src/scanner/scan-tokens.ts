import fs from 'node:fs';
import path from 'node:path';
import {
  DIAGNOSTIC_CODES,
  createDiagnostic,
  sortDiagnostics,
  type Diagnostic,
} from '../contracts/diagnostics.js';
import type { SystemTokenDeclaration, SystemTokenRegistry } from '../contracts/types.js';
import { SCHEMA_VERSION } from '../contracts/types.js';
import { pathExists, toPosix, walkFiles } from '../shared/fs-utils.js';
import { parseScssSource } from './parse-scss.js';

export type ScanOptions = {
  tokenPaths: string[];
  includePrivate?: boolean;
  privatePrefix?: string;
  tokenNamespaces?: string[];
  layerHeuristics?: Record<string, string>;
  /** Absolute paths that are allowed; files outside are skipped */
  packageRoot?: string;
};

export function scanTokenPaths(options: ScanOptions): SystemTokenRegistry {
  const includePrivate = options.includePrivate ?? false;
  const privatePrefix = options.privatePrefix ?? '--_';
  const tokenNamespaces = options.tokenNamespaces ?? [
    '--brand-',
    '--alias-',
    '--mapped-',
    '--state-',
    '--app-',
    '--calendar-',
  ];
  const layerHeuristics = options.layerHeuristics ?? {};
  const diagnostics: Diagnostic[] = [];
  const declarations: SystemTokenDeclaration[] = [];
  const importGraph: Record<string, string[]> = {};

  const files = collectScssFiles(options.tokenPaths, diagnostics);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const result = parseScssSource({
      filePath: file,
      content,
      includePrivate,
      privatePrefix,
      tokenNamespaces,
      layerHeuristics,
    });
    diagnostics.push(...result.diagnostics);
    declarations.push(...result.declarations);
    const key = toPosix(file);
    importGraph[key] = [...result.imports, ...result.forwards].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  // Duplicate detection: same name + same selector context + same at-rule + same responsive
  const seen = new Map<string, SystemTokenDeclaration>();
  for (const decl of declarations) {
    if (decl.isPrivate) continue;
    const identity = declarationIdentity(decl);
    const prev = seen.get(identity);
    if (prev) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.TOKEN_DUPLICATE_DECLARATION,
          'warning',
          `Duplicate token declaration for ${decl.name} in identical context`,
          {
            source: decl.source,
            details: {
              previous: prev.source,
              identity,
            },
            remediation: 'Remove duplicate or differentiate selector/theme context.',
          },
        ),
      );
    } else {
      seen.set(identity, decl);
    }
  }

  // Broken reference detection within scanned public tokens
  const publicNames = new Set(
    declarations.filter((d) => !d.isPrivate).map((d) => d.name),
  );
  // Also allow private refs to exist without being in registry
  for (const decl of declarations) {
    for (const ref of decl.references) {
      if (ref.startsWith(privatePrefix)) continue;
      if (!publicNames.has(ref) && isLikelyTokenRef(ref, tokenNamespaces)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.TOKEN_BROKEN_REFERENCE,
            'error',
            `Broken reference ${ref} from ${decl.name}`,
            {
              source: decl.source,
              details: { from: decl.name, to: ref },
              remediation: 'Define the missing token or fix the reference name.',
            },
          ),
        );
      }
    }
  }

  // Circular dependency detection on public token graph
  const graph = buildReferenceGraph(declarations, privatePrefix);
  const cycles = findCycles(graph);
  for (const cycle of cycles) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.TOKEN_CIRCULAR_REFERENCE,
        'error',
        `Circular token reference: ${cycle.join(' -> ')}`,
        {
          details: { cycle },
          remediation: 'Break the alias cycle in SCSS token definitions.',
        },
      ),
    );
  }

  // Stable order
  declarations.sort((a, b) => {
    const f = a.source.file.localeCompare(b.source.file);
    if (f !== 0) return f;
    if (a.source.line !== b.source.line) return a.source.line - b.source.line;
    return a.name.localeCompare(b.name);
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    declarations,
    importGraph,
    diagnostics: sortDiagnostics(diagnostics),
  };
}

function collectScssFiles(tokenPaths: string[], diagnostics: Diagnostic[]): string[] {
  const files = new Set<string>();
  for (const p of tokenPaths) {
    if (!pathExists(p)) {
      diagnostics.push(
        createDiagnostic(DIAGNOSTIC_CODES.FILE_MISSING, 'error', `Token path not found: ${p}`, {
          remediation: 'Fix scss.tokenPaths in figma-to-code.config.json',
        }),
      );
      continue;
    }
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const f of walkFiles(p, ['.scss'])) {
        files.add(path.resolve(f));
      }
    } else if (p.endsWith('.scss')) {
      files.add(path.resolve(p));
    }
  }
  return [...files].sort((a, b) => a.localeCompare(b));
}

export function declarationIdentity(decl: SystemTokenDeclaration): string {
  return [
    decl.name,
    decl.selectorContext.join('|'),
    decl.atRuleContext.join('|'),
    decl.responsiveContext ?? '',
    decl.theme ?? '',
  ].join('::');
}

function isLikelyTokenRef(name: string, namespaces: string[]): boolean {
  return namespaces.some((ns) => name.startsWith(ns));
}

function buildReferenceGraph(
  declarations: SystemTokenDeclaration[],
  privatePrefix: string,
): Map<string, string[]> {
  // Graph by token name only for cycle detection (cross-theme ok)
  const graph = new Map<string, Set<string>>();
  for (const d of declarations) {
    if (d.isPrivate) continue;
    if (!graph.has(d.name)) graph.set(d.name, new Set());
    for (const ref of d.references) {
      if (ref.startsWith(privatePrefix)) continue;
      graph.get(d.name)!.add(ref);
    }
  }
  const out = new Map<string, string[]>();
  for (const [k, v] of graph) {
    out.set(k, [...v].sort());
  }
  return out;
}

function findCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx >= 0) {
        cycles.push([...path.slice(idx), node]);
      }
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of graph.get(node) ?? []) {
      if (graph.has(next) || true) {
        dfs(next);
      }
    }
    path.pop();
    stack.delete(node);
  }

  for (const node of [...graph.keys()].sort()) {
    dfs(node);
  }

  // Deduplicate cycles by normalized signature
  const seen = new Set<string>();
  const unique: string[][] = [];
  for (const c of cycles) {
    const body = c.slice(0, -1);
    const minIdx = body.reduce((mi, _, i, arr) => (arr[i]! < arr[mi]! ? i : mi), 0);
    const norm = [...body.slice(minIdx), ...body.slice(0, minIdx), body[minIdx]!].join('>');
    if (!seen.has(norm)) {
      seen.add(norm);
      unique.push(c);
    }
  }
  return unique;
}

export function indexSystemTokens(
  registry: SystemTokenRegistry,
): Record<string, SystemTokenDeclaration[]> {
  const index: Record<string, SystemTokenDeclaration[]> = {};
  for (const d of registry.declarations) {
    if (!index[d.name]) index[d.name] = [];
    index[d.name]!.push(d);
  }
  for (const key of Object.keys(index)) {
    index[key]!.sort((a, b) => a.source.file.localeCompare(b.source.file));
  }
  return index;
}
