import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildSnapshot,
  type RawFigmaExportInput,
} from '../../src/plugin-transform/transform-snapshot.js';
import { packageRootFrom } from '../../src/shared/fs-utils.js';
import { stableStringify } from '../../src/shared/serialize.js';

const pkg = packageRootFrom(import.meta.url);

describe('Figma transform (offline)', () => {
  const fixture = JSON.parse(
    fs.readFileSync(path.join(pkg, 'tests/fixtures/figma/raw-export.json'), 'utf8'),
  ) as RawFigmaExportInput;

  it('preserves collections, modes, alias refs without flattening', () => {
    const snap = buildSnapshot(fixture);
    expect(snap.collections).toHaveLength(1);
    const col = snap.collections[0]!;
    expect(col.modes.map((m) => m.name).sort()).toEqual(['Dark', 'Light']);
    const alias = col.variables.find((v) => v.name === 'alias/primary');
    expect(alias?.valuesByMode.light).toEqual({
      kind: 'alias',
      variableId: 'v1',
      variableName: undefined,
    });
    // literal color not flattened from alias
    expect(alias?.valuesByMode.light?.kind).toBe('alias');
  });

  it('handles light/dark modes and missing mode', () => {
    const snap = buildSnapshot(fixture);
    const mystery = snap.collections[0]!.variables.find((v) => v.name === 'mystery');
    expect(mystery?.valuesByMode.dark?.kind).toBe('missing');
    expect((snap.diagnostics ?? []).some((d) => d.code === 'FIGMA_MODE_MISSING')).toBe(true);
  });

  it('flags unsupported types', () => {
    const snap = buildSnapshot(fixture);
    const mystery = snap.collections[0]!.variables.find((v) => v.name === 'mystery');
    expect(mystery?.resolvedType).toBe('UNSUPPORTED');
    expect((snap.diagnostics ?? []).some((d) => d.code === 'UNSUPPORTED_FIGMA_TYPE')).toBe(true);
  });

  it('is deterministically sorted and byte-stable with frozen time', () => {
    const a = buildSnapshot(fixture);
    const b = buildSnapshot(fixture);
    const sa = stableStringify(a, { freezeTimestamps: true });
    const sb = stableStringify(b, { freezeTimestamps: true });
    expect(sa).toBe(sb);
  });

  it('single collection single mode', () => {
    const snap = buildSnapshot({
      documentName: 'one',
      pluginVersion: '1.0.0',
      exportTime: '1970-01-01T00:00:00.000Z',
      collections: [
        {
          id: 'c',
          name: 'C',
          modes: [{ modeId: 'm', name: 'Default' }],
          variableIds: ['v'],
        },
      ],
      variables: [
        {
          id: 'v',
          name: 'x',
          variableCollectionId: 'c',
          resolvedType: 'STRING',
          valuesByMode: { m: 'hello' },
        },
      ],
    });
    expect(snap.collections[0]!.variables[0]!.valuesByMode.m).toEqual({
      kind: 'literal',
      value: 'hello',
    });
  });

  it('detects broken alias target', () => {
    const snap = buildSnapshot({
      documentName: 'broken',
      pluginVersion: '1.0.0',
      collections: [
        {
          id: 'c',
          name: 'C',
          modes: [{ modeId: 'm', name: 'Default' }],
          variableIds: ['v'],
        },
      ],
      variables: [
        {
          id: 'v',
          name: 'alias',
          variableCollectionId: 'c',
          resolvedType: 'COLOR',
          valuesByMode: { m: { type: 'VARIABLE_ALIAS', id: 'missing-id' } },
        },
      ],
    });
    expect((snap.diagnostics ?? []).some((d) => d.code === 'FIGMA_ALIAS_BROKEN')).toBe(true);
  });
});
