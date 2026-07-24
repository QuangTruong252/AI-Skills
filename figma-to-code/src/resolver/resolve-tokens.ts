import {
  DIAGNOSTIC_CODES,
  createDiagnostic,
  hasBlockingErrors,
  sortDiagnostics,
  type Diagnostic,
} from '../contracts/diagnostics.js';
import type {
  FigmaVariablesSnapshot,
  ResolvedMapping,
  SuggestedMapping,
  SystemTokenRegistry,
  TokenMap,
  TokenRegistryGenerated,
} from '../contracts/types.js';
import { SCHEMA_VERSION } from '../contracts/types.js';
import { indexSystemTokens } from '../scanner/scan-tokens.js';

export type ResolveOptions = {
  snapshot: FigmaVariablesSnapshot;
  system: SystemTokenRegistry;
  tokenMap: TokenMap;
  /** Figma tokens considered "used" in UI — unmapped used tokens are blocking */
  usedFigmaTokens?: string[];
  valueDriftEnabled?: boolean;
};

export type ResolveResult = {
  registry: TokenRegistryGenerated;
  diagnostics: Diagnostic[];
  ok: boolean;
};

export function resolveTokens(options: ResolveOptions): ResolveResult {
  const diagnostics: Diagnostic[] = [];
  diagnostics.push(...(options.snapshot.diagnostics ?? []));
  diagnostics.push(...options.system.diagnostics);

  const systemIndex = indexSystemTokens(options.system);
  const figmaTokens: TokenRegistryGenerated['figmaTokens'] = {};
  for (const col of options.snapshot.collections) {
    for (const v of col.variables) {
      figmaTokens[v.name] = v;
      figmaTokens[v.normalizedName] = v;
      figmaTokens[v.id] = v;
    }
  }

  const figmaByName = new Map<string, (typeof options.snapshot.collections)[0]['variables'][0]>();
  for (const col of options.snapshot.collections) {
    for (const v of col.variables) {
      figmaByName.set(v.name, v);
      figmaByName.set(v.normalizedName, v);
    }
  }

  const resolvedMappings: Record<string, ResolvedMapping> = {};
  const suggestedMappings: Record<string, SuggestedMapping> = {};
  const unmappedFigmaTokens: string[] = [];
  const missingSystemTokens: string[] = [];
  const typeMismatches: string[] = [];
  const modeMismatches: string[] = [];
  const valueDrifts: string[] = [];
  const circularAliases: string[] = [];
  const brokenReferences: string[] = [];

  // Collect system circular / broken from system diagnostics
  for (const d of options.system.diagnostics) {
    if (d.code === DIAGNOSTIC_CODES.TOKEN_CIRCULAR_REFERENCE) {
      circularAliases.push(String(d.details?.cycle ?? d.message));
    }
    if (d.code === DIAGNOSTIC_CODES.TOKEN_BROKEN_REFERENCE) {
      brokenReferences.push(String(d.details?.to ?? d.message));
    }
  }

  // Figma alias cycle / broken
  const figmaAliasGraph = buildFigmaAliasGraph(options.snapshot);
  for (const cycle of findGraphCycles(figmaAliasGraph)) {
    circularAliases.push(cycle.join(' -> '));
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.TOKEN_CIRCULAR_REFERENCE,
        'error',
        `Circular Figma alias: ${cycle.join(' -> ')}`,
        { details: { cycle } },
      ),
    );
  }

  const usedSet = new Set(
    options.usedFigmaTokens ?? options.tokenMap.usedFigmaTokens ?? [],
  );

  const approved = options.tokenMap.mappings.filter((m) => m.status === 'approved');
  const suggestedOnly = options.tokenMap.mappings.filter((m) => m.status === 'suggested');

  // Suggested never become approved
  for (const s of suggestedOnly) {
    suggestedMappings[s.figmaToken] = {
      figmaToken: s.figmaToken,
      systemToken: s.systemToken,
      status: 'suggested',
      confidence: 0.5,
      reason: s.notes ?? 'from token-map suggested entry',
    };
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.MAPPING_UNAPPROVED_SUGGESTION,
        'info',
        `Suggestion only (not approved): ${s.figmaToken} -> ${s.systemToken}`,
      ),
    );
  }

  for (const entry of approved) {
    const figma = figmaByName.get(entry.figmaToken);
    const systemDecls = systemIndex[entry.systemToken];

    if (!systemDecls || systemDecls.length === 0) {
      missingSystemTokens.push(entry.systemToken);
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.MAPPING_TARGET_MISSING,
          'error',
          `Mapping target does not exist: ${entry.systemToken} (from ${entry.figmaToken})`,
          {
            remediation: 'Point token-map.json at an existing SCSS token or add the token.',
          },
        ),
      );
      continue;
    }

    if (!figma) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.FIGMA_TOKEN_UNMAPPED_UNUSED,
          'warning',
          `Approved mapping references unknown Figma token: ${entry.figmaToken}`,
        ),
      );
    }

    // Type compatibility
    const systemType = systemDecls[0]!.tokenType;
    const figmaType = figma?.resolvedType ?? entry.type ?? 'unknown';
    if (figma && !typesCompatible(figmaType, systemType)) {
      typeMismatches.push(`${entry.figmaToken}:${figmaType}->${entry.systemToken}:${systemType}`);
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.MAPPING_TYPE_MISMATCH,
          'error',
          `Type mismatch: Figma ${entry.figmaToken} (${figmaType}) vs system ${entry.systemToken} (${systemType})`,
        ),
      );
      continue;
    }

    // Mode coverage light/dark if present
    if (figma) {
      const modeNames = Object.keys(figma.valuesByMode);
      const hasMissing = Object.values(figma.valuesByMode).some((v) => v.kind === 'missing');
      if (hasMissing) {
        modeMismatches.push(entry.figmaToken);
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.THEME_MODE_MISMATCH,
            'error',
            `Required mode value missing for Figma token ${entry.figmaToken}`,
            { details: { modes: modeNames } },
          ),
        );
      }

      if (options.valueDriftEnabled !== false) {
        const drift = detectValueDrift(figma, systemDecls);
        if (drift) {
          valueDrifts.push(entry.figmaToken);
          diagnostics.push(
            createDiagnostic(
              DIAGNOSTIC_CODES.VALUE_DRIFT,
              'warning',
              `VALUE_DRIFT between Figma ${entry.figmaToken} and system ${entry.systemToken}: ${drift}`,
              {
                remediation:
                  'Do not auto-overwrite either side; update Figma or SCSS deliberately.',
              },
            ),
          );
        }
      }
    }

    resolvedMappings[entry.figmaToken] = {
      figmaToken: entry.figmaToken,
      systemToken: entry.systemToken,
      status: 'approved',
      figmaType: figma?.resolvedType,
      systemType,
    };
  }

  // Unmapped Figma tokens
  const mappedFigma = new Set(Object.keys(resolvedMappings));
  for (const col of options.snapshot.collections) {
    for (const v of col.variables) {
      if (mappedFigma.has(v.name) || mappedFigma.has(v.normalizedName)) continue;
      unmappedFigmaTokens.push(v.name);
      const used = usedSet.has(v.name) || usedSet.has(v.normalizedName) || usedSet.has(v.id);
      if (used) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.FIGMA_TOKEN_UNMAPPED_USED,
            'error',
            `Used Figma token is not mapped: ${v.name}`,
            {
              remediation: 'Add an approved mapping in token-map.json.',
              source: { variableId: v.id },
            },
          ),
        );
      } else {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.FIGMA_TOKEN_UNMAPPED_UNUSED,
            'warning',
            `Unused Figma token is not mapped: ${v.name}`,
            { source: { variableId: v.id } },
          ),
        );
      }
    }
  }

  // Auto-suggestions for unmapped (never approved)
  for (const name of unmappedFigmaTokens) {
    if (suggestedMappings[name]) continue;
    const guess = suggestSystemToken(name, systemIndex);
    if (guess) {
      suggestedMappings[name] = guess;
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.MAPPING_UNAPPROVED_SUGGESTION,
          'info',
          `Auto-suggestion (not approved): ${guess.figmaToken} -> ${guess.systemToken}`,
        ),
      );
    }
  }

  const sortedDiagnostics = sortDiagnostics(diagnostics);
  const registry: TokenRegistryGenerated = {
    schemaVersion: SCHEMA_VERSION,
    figmaTokens: sortRecord(figmaTokens),
    systemTokens: sortRecord(systemIndex),
    resolvedMappings: sortRecord(resolvedMappings),
    suggestedMappings: sortRecord(suggestedMappings),
    diagnostics: {
      unmappedFigmaTokens: [...new Set(unmappedFigmaTokens)].sort(),
      missingSystemTokens: [...new Set(missingSystemTokens)].sort(),
      typeMismatches: [...new Set(typeMismatches)].sort(),
      modeMismatches: [...new Set(modeMismatches)].sort(),
      valueDrifts: [...new Set(valueDrifts)].sort(),
      circularAliases: [...new Set(circularAliases)].sort(),
      brokenReferences: [...new Set(brokenReferences)].sort(),
      items: sortedDiagnostics,
    },
  };

  return {
    registry,
    diagnostics: sortedDiagnostics,
    ok: !hasBlockingErrors(sortedDiagnostics),
  };
}

function typesCompatible(figmaType: string, systemType: string): boolean {
  if (systemType === 'unknown' || figmaType === 'UNSUPPORTED') return true;
  const f = figmaType.toUpperCase();
  if (f === 'COLOR' && (systemType === 'color' || systemType === 'unknown')) return true;
  if (f === 'FLOAT' && (systemType === 'dimension' || systemType === 'unknown')) return true;
  if (f === 'STRING' && (systemType === 'fontFamily' || systemType === 'typography' || systemType === 'unknown' || systemType === 'color'))
    return true;
  if (f === 'BOOLEAN') return systemType === 'unknown';
  // Allow color-ish system types (e.g. shadow color mapping to effect system token)
  if (f === 'COLOR' && systemType === 'effect') return true;
  return f.toLowerCase() === systemType.toLowerCase();
}

function detectValueDrift(
  figma: { valuesByMode: Record<string, { kind: string; value?: string | number | boolean }> },
  systemDecls: { rawValue: string; theme?: string }[],
): string | null {
  // Only compare when Figma has a literal and system has a literal (no var())
  const literals = Object.values(figma.valuesByMode).filter((v) => v.kind === 'literal');
  if (literals.length === 0) return null;
  const figmaLit = String(literals[0]!.value ?? '').toLowerCase().replace(/\s+/g, '');
  const systemLit = systemDecls.find((d) => !d.rawValue.includes('var('));
  if (!systemLit) return null;
  const sys = systemLit.rawValue.toLowerCase().replace(/\s+/g, '');
  if (!figmaLit || !sys) return null;
  if (normalizeColor(figmaLit) !== normalizeColor(sys) && figmaLit !== sys) {
    return `${figmaLit} vs ${sys}`;
  }
  return null;
}

function normalizeColor(s: string): string {
  if (s.startsWith('#') && s.length === 7) return s;
  const m = s.match(/^rgba?\((\d+),(\d+),(\d+)/);
  if (m) {
    const hex = [m[1], m[2], m[3]]
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('');
    return `#${hex}`;
  }
  return s;
}

function suggestSystemToken(
  figmaName: string,
  systemIndex: Record<string, unknown>,
): SuggestedMapping | null {
  const normalized = figmaName.replace(/\//g, '-').toLowerCase();
  const candidates = Object.keys(systemIndex);
  // Exact suffix match
  for (const c of candidates) {
    if (c.replace(/^--/, '') === normalized || c === `--${normalized}`) {
      return {
        figmaToken: figmaName,
        systemToken: c,
        status: 'suggested',
        confidence: 0.9,
        reason: 'exact normalized name match',
      };
    }
  }
  // Contains
  const loose = candidates.find((c) => c.includes(normalized.split('/').pop() ?? normalized));
  if (loose) {
    return {
      figmaToken: figmaName,
      systemToken: loose,
      status: 'suggested',
      confidence: 0.4,
      reason: 'partial name match',
    };
  }
  return null;
}

function buildFigmaAliasGraph(snapshot: FigmaVariablesSnapshot): Map<string, string[]> {
  const idToName = new Map<string, string>();
  for (const col of snapshot.collections) {
    for (const v of col.variables) {
      idToName.set(v.id, v.name);
    }
  }
  const graph = new Map<string, string[]>();
  for (const col of snapshot.collections) {
    for (const v of col.variables) {
      const targets = new Set<string>();
      for (const val of Object.values(v.valuesByMode)) {
        if (val.kind === 'alias') {
          targets.add(idToName.get(val.variableId) ?? val.variableId);
        }
      }
      graph.set(v.name, [...targets].sort());
    }
  }
  return graph;
}

function findGraphCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx >= 0) cycles.push([...path.slice(idx), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const n of graph.get(node) ?? []) dfs(n);
    path.pop();
    stack.delete(node);
  }

  for (const k of [...graph.keys()].sort()) dfs(k);
  return cycles;
}

function sortRecord<T>(obj: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of Object.keys(obj).sort((a, b) => a.localeCompare(b))) {
    out[k] = obj[k]!;
  }
  return out;
}

export function generateAdapterScss(registry: TokenRegistryGenerated): string {
  const lines: string[] = [
    '/* AUTO-GENERATED by figma-to-code — DO NOT EDIT MANUALLY */',
    '/* Re-run: npm run tokens:sync */',
    '',
    ':root {',
  ];
  const entries = Object.values(registry.resolvedMappings).sort((a, b) =>
    a.figmaToken.localeCompare(b.figmaToken),
  );
  for (const m of entries) {
    // Minimal adapter: only emit if figma name differs from system token CSS name
    const cssName = `--figma-${m.figmaToken.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()}`;
    if (cssName === m.systemToken) continue;
    // Prefer using system tokens directly; adapter is opt-in bridge for Figma-named hooks
    lines.push(`  ${cssName}: var(${m.systemToken});`);
  }
  lines.push('}', '');
  return lines.join('\n');
}
