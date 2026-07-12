import {
  DIAGNOSTIC_CODES,
  createDiagnostic,
  sortDiagnostics,
  type Diagnostic,
} from '../contracts/diagnostics.js';
import type {
  FigmaCollection,
  FigmaValue,
  FigmaVariable,
  FigmaVariableType,
  FigmaVariablesSnapshot,
} from '../contracts/types.js';
import { SCHEMA_VERSION } from '../contracts/types.js';

/** Raw shapes approximating Figma Plugin API local variable payloads (offline testable). */
export type RawFigmaMode = { modeId: string; name: string };

export type RawFigmaVariable = {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
  description?: string;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
};

export type RawFigmaCollection = {
  id: string;
  name: string;
  modes: RawFigmaMode[];
  variableIds: string[];
};

export type RawFigmaExportInput = {
  documentName: string;
  pluginVersion: string;
  exportTime?: string;
  collections: RawFigmaCollection[];
  variables: RawFigmaVariable[];
};

export function normalizeVariableName(name: string): string {
  return name
    .trim()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function mapResolvedType(raw: string): FigmaVariableType {
  const t = raw.toUpperCase();
  if (t === 'COLOR' || t === 'FLOAT' || t === 'STRING' || t === 'BOOLEAN') {
    return t;
  }
  return 'UNSUPPORTED';
}

export function transformFigmaValue(raw: unknown): FigmaValue {
  if (raw === null || raw === undefined) {
    return { kind: 'missing' };
  }
  if (typeof raw === 'object' && raw !== null && 'type' in raw) {
    const obj = raw as { type: string; id?: string; name?: string };
    if (obj.type === 'VARIABLE_ALIAS' && obj.id) {
      return {
        kind: 'alias',
        variableId: obj.id,
        variableName: obj.name,
      };
    }
  }
  if (typeof raw === 'object' && raw !== null && 'r' in raw && 'g' in raw && 'b' in raw) {
    const c = raw as { r: number; g: number; b: number; a?: number };
    const a = c.a === undefined ? 1 : c.a;
    const toByte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255);
    if (a < 1) {
      return {
        kind: 'literal',
        value: `rgba(${toByte(c.r)}, ${toByte(c.g)}, ${toByte(c.b)}, ${Number(a.toFixed(4))})`,
      };
    }
    const hex = [c.r, c.g, c.b]
      .map((n) => toByte(n).toString(16).padStart(2, '0'))
      .join('');
    return { kind: 'literal', value: `#${hex}` };
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return { kind: 'literal', value: raw };
  }
  return { kind: 'unsupported', raw };
}

export function buildSnapshot(input: RawFigmaExportInput): FigmaVariablesSnapshot {
  const diagnostics: Diagnostic[] = [];
  const variablesById = new Map(input.variables.map((v) => [v.id, v]));

  const collections: FigmaCollection[] = input.collections
    .map((col) => {
      const modes = [...col.modes]
        .map((m) => ({ id: m.modeId, name: m.name }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

      const vars: FigmaVariable[] = col.variableIds
        .map((id) => variablesById.get(id))
        .filter((v): v is RawFigmaVariable => Boolean(v))
        .map((raw) => {
          const resolvedType = mapResolvedType(raw.resolvedType);
          if (resolvedType === 'UNSUPPORTED') {
            diagnostics.push(
              createDiagnostic(
                DIAGNOSTIC_CODES.UNSUPPORTED_FIGMA_TYPE,
                'warning',
                `Unsupported variable type "${raw.resolvedType}" for ${raw.name}`,
                {
                  source: { variableId: raw.id },
                  remediation: 'Export as string literal or extend type support.',
                },
              ),
            );
          }

          const valuesByMode: Record<string, FigmaValue> = {};
          for (const mode of modes) {
            if (!(mode.id in raw.valuesByMode)) {
              valuesByMode[mode.id] = { kind: 'missing' };
              diagnostics.push(
                createDiagnostic(
                  DIAGNOSTIC_CODES.FIGMA_MODE_MISSING,
                  'warning',
                  `Missing mode value for ${raw.name} / mode ${mode.name}`,
                  {
                    source: { variableId: raw.id },
                    details: { modeId: mode.id, modeName: mode.name },
                  },
                ),
              );
            } else {
              valuesByMode[mode.id] = transformFigmaValue(raw.valuesByMode[mode.id]);
            }
          }

          // Preserve any extra mode keys not in collection (sorted)
          for (const modeId of Object.keys(raw.valuesByMode).sort()) {
            if (!(modeId in valuesByMode)) {
              valuesByMode[modeId] = transformFigmaValue(raw.valuesByMode[modeId]);
            }
          }

          return {
            id: raw.id,
            name: raw.name,
            originalName: raw.name,
            normalizedName: normalizeVariableName(raw.name),
            collectionId: col.id,
            resolvedType,
            valuesByMode,
            description: raw.description,
            scopes: raw.scopes ? [...raw.scopes].sort() : undefined,
            codeSyntax: raw.codeSyntax,
          };
        })
        .sort(
          (a, b) =>
            a.normalizedName.localeCompare(b.normalizedName) || a.id.localeCompare(b.id),
        );

      return {
        id: col.id,
        name: col.name,
        modes,
        variables: vars,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  // Validate alias targets exist
  const allIds = new Set(input.variables.map((v) => v.id));
  for (const col of collections) {
    for (const variable of col.variables) {
      for (const [modeId, val] of Object.entries(variable.valuesByMode)) {
        if (val.kind === 'alias' && !allIds.has(val.variableId)) {
          diagnostics.push(
            createDiagnostic(
              DIAGNOSTIC_CODES.FIGMA_ALIAS_BROKEN,
              'error',
              `Broken alias from ${variable.name} mode ${modeId} -> ${val.variableId}`,
              {
                source: { variableId: variable.id },
                remediation: 'Fix alias target in Figma or re-export after cleanup.',
              },
            ),
          );
        }
      }
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    documentName: input.documentName,
    pluginVersion: input.pluginVersion,
    exportTime: input.exportTime ?? new Date().toISOString(),
    collections,
    diagnostics: sortDiagnostics(diagnostics),
  };
}
