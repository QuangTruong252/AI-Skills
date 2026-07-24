import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanTokenPaths } from '../../src/scanner/scan-tokens.js';
import { resolveTokens } from '../../src/resolver/resolve-tokens.js';
import type { FigmaVariablesSnapshot, TokenMap } from '../../src/contracts/types.js';
import { packageRootFrom, readJsonFile } from '../../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);
const happy = path.join(pkg, 'tests/fixtures/e2e-happy');

function baseSystem() {
  return scanTokenPaths({ tokenPaths: [path.join(happy, 'scss')] });
}

function baseSnapshot(): FigmaVariablesSnapshot {
  return readJsonFile(path.join(happy, 'figma-variables.snapshot.json'));
}

describe('resolver', () => {
  it('resolves exact approved mappings', () => {
    const tokenMap = readJsonFile<TokenMap>(path.join(happy, 'token-map.json'));
    const result = resolveTokens({
      snapshot: baseSnapshot(),
      system: baseSystem(),
      tokenMap,
    });
    expect(result.registry.resolvedMappings['app/primary']?.systemToken).toBe('--app-primary');
    expect(result.registry.resolvedMappings['app/primary']?.status).toBe('approved');
    // suggestions stay suggested
    const suggestions = Object.values(result.registry.suggestedMappings);
    expect(suggestions.every((s) => s.status === 'suggested')).toBe(true);
    expect(result.ok).toBe(true);
  });

  it('blocks missing system target', () => {
    const result = resolveTokens({
      snapshot: baseSnapshot(),
      system: baseSystem(),
      tokenMap: {
        schemaVersion: '1.0.0',
        mappings: [
          {
            figmaToken: 'app/primary',
            systemToken: '--app-does-not-exist',
            status: 'approved',
          },
        ],
        usedFigmaTokens: ['app/primary'],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'MAPPING_TARGET_MISSING')).toBe(true);
  });

  it('blocks used unmapped token', () => {
    const result = resolveTokens({
      snapshot: baseSnapshot(),
      system: baseSystem(),
      tokenMap: {
        schemaVersion: '1.0.0',
        mappings: [],
        usedFigmaTokens: ['app/primary'],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'FIGMA_TOKEN_UNMAPPED_USED')).toBe(true);
  });

  it('warns on unused unmapped token', () => {
    const result = resolveTokens({
      snapshot: baseSnapshot(),
      system: baseSystem(),
      tokenMap: {
        schemaVersion: '1.0.0',
        mappings: [
          {
            figmaToken: 'app/primary',
            systemToken: '--app-primary',
            status: 'approved',
          },
        ],
        usedFigmaTokens: ['app/primary'],
      },
    });
    // brand/primary may be unmapped unused
    expect(
      result.diagnostics.some(
        (d) => d.code === 'FIGMA_TOKEN_UNMAPPED_UNUSED' || d.severity === 'warning',
      ),
    ).toBe(true);
  });

  it('blocks type mismatch', () => {
    const snap = baseSnapshot();
    // force FLOAT on color mapping path
    snap.collections[0]!.variables[0]!.resolvedType = 'FLOAT';
    const result = resolveTokens({
      snapshot: snap,
      system: baseSystem(),
      tokenMap: {
        schemaVersion: '1.0.0',
        mappings: [
          {
            figmaToken: 'brand/primary',
            systemToken: '--brand-coral-500',
            status: 'approved',
          },
        ],
      },
    });
    expect(result.diagnostics.some((d) => d.code === 'MAPPING_TYPE_MISMATCH')).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('detects circular figma aliases', () => {
    const snap: FigmaVariablesSnapshot = {
      schemaVersion: '1.0.0',
      documentName: 'cycle',
      pluginVersion: '1.0.0',
      exportTime: '1970-01-01T00:00:00.000Z',
      collections: [
        {
          id: 'c',
          name: 'C',
          modes: [{ id: 'm', name: 'Default' }],
          variables: [
            {
              id: 'a',
              name: 'a',
              originalName: 'a',
              normalizedName: 'a',
              collectionId: 'c',
              resolvedType: 'COLOR',
              valuesByMode: { m: { kind: 'alias', variableId: 'b' } },
            },
            {
              id: 'b',
              name: 'b',
              originalName: 'b',
              normalizedName: 'b',
              collectionId: 'c',
              resolvedType: 'COLOR',
              valuesByMode: { m: { kind: 'alias', variableId: 'a' } },
            },
          ],
        },
      ],
    };
    const result = resolveTokens({
      snapshot: snap,
      system: baseSystem(),
      tokenMap: { schemaVersion: '1.0.0', mappings: [] },
    });
    expect(result.diagnostics.some((d) => d.code === 'TOKEN_CIRCULAR_REFERENCE')).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('never promotes suggested mappings into resolvedMappings', () => {
    const result = resolveTokens({
      snapshot: baseSnapshot(),
      system: baseSystem(),
      tokenMap: {
        schemaVersion: '1.0.0',
        mappings: [
          {
            figmaToken: 'app/primary',
            systemToken: '--app-primary',
            status: 'suggested',
          },
        ],
        usedFigmaTokens: [],
      },
    });
    expect(result.registry.resolvedMappings['app/primary']).toBeUndefined();
    expect(result.registry.suggestedMappings['app/primary']?.status).toBe('suggested');
  });
});
