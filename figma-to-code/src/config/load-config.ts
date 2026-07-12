import path from 'node:path';
import type { FigmaToCodeConfig } from '../contracts/types.js';
import { SCHEMA_VERSION } from '../contracts/types.js';
import { DIAGNOSTIC_CODES, createDiagnostic, type Diagnostic } from '../contracts/diagnostics.js';
import { pathExists, readJsonFile, packageRootFrom } from '../shared/fs-utils.js';
import { schemaDir, validateAgainstSchema } from '../shared/validate.js';

export const DEFAULT_CONFIG: FigmaToCodeConfig = {
  schemaVersion: SCHEMA_VERSION,
  scss: {
    tokenPaths: ['../styles/tokens', '../styles/_variables.scss'],
    includePrivate: false,
    tokenNamespaces: [
      '--brand-',
      '--alias-',
      '--mapped-',
      '--state-',
      '--app-',
      '--calendar-',
    ],
    privatePrefix: '--_',
    layerHeuristics: {
      brand: 'brand',
      alias: 'alias',
      'mapped-light': 'mapped',
      'mapped-dark': 'mapped',
      state: 'state',
      semantic: 'semantic',
      typography: 'typography',
      responsive: 'responsive',
      effects: 'effects',
      variables: 'app',
    },
  },
  figma: {
    snapshotPath: 'generated/figma-variables.snapshot.json',
    pluginVersion: '1.0.0',
  },
  mapping: {
    tokenMapPath: 'token-map.json',
  },
  output: {
    registryPath: 'generated/token-registry.generated.json',
    adapterScssPath: 'generated/mapped.generated.scss',
    uiSpecPath: 'generated/ui-spec.generated.json',
    systemRegistryDebugPath: 'generated/system-token-registry.debug.json',
  },
  breakpoints: {
    source: '../styles/tokens/_breakpoints.scss',
    viewports: [
      { name: 'mobile', width: 480 },
      { name: 'wide-mobile', width: 600 },
      { name: 'tablet', width: 768 },
      { name: 'laptop', width: 1024 },
      { name: 'large', width: 1200 },
      { name: 'desktop', width: 1440 },
    ],
  },
  valueDrift: {
    enabled: true,
    normalizeColors: true,
  },
};

export type LoadedConfig = {
  config: FigmaToCodeConfig;
  packageRoot: string;
  repoRoot: string;
  diagnostics: Diagnostic[];
};

export function resolveConfigPath(packageRoot: string, explicit?: string): string {
  if (explicit) return path.resolve(explicit);
  return path.join(packageRoot, 'figma-to-code.config.json');
}

export function loadConfig(options?: {
  configPath?: string;
  packageRoot?: string;
}): LoadedConfig {
  const packageRoot = options?.packageRoot ?? packageRootFrom(import.meta.url);
  const repoRoot = path.resolve(packageRoot, '..');
  const configPath = resolveConfigPath(packageRoot, options?.configPath);
  const diagnostics: Diagnostic[] = [];

  let config: FigmaToCodeConfig = structuredClone(DEFAULT_CONFIG);

  if (pathExists(configPath)) {
    try {
      const raw = readJsonFile<FigmaToCodeConfig>(configPath);
      const schemaPath = path.join(schemaDir(packageRoot), 'figma-to-code.config.schema.json');
      if (pathExists(schemaPath)) {
        const v = validateAgainstSchema(raw, schemaPath);
        diagnostics.push(...v.diagnostics);
        if (!v.ok) {
          return { config, packageRoot, repoRoot, diagnostics };
        }
      }
      config = mergeConfig(DEFAULT_CONFIG, raw);
    } catch (e) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.CONFIG_INVALID,
          'error',
          `Failed to load config: ${(e as Error).message}`,
          { source: { file: configPath } },
        ),
      );
    }
  }

  return { config, packageRoot, repoRoot, diagnostics };
}

function mergeConfig(
  base: FigmaToCodeConfig,
  override: Partial<FigmaToCodeConfig>,
): FigmaToCodeConfig {
  return {
    ...base,
    ...override,
    scss: { ...base.scss, ...override.scss },
    figma: { ...base.figma, ...override.figma },
    mapping: { ...base.mapping, ...override.mapping },
    output: { ...base.output, ...override.output },
    breakpoints: {
      ...base.breakpoints,
      ...override.breakpoints,
      viewports: override.breakpoints?.viewports ?? base.breakpoints.viewports,
    },
    valueDrift: { ...base.valueDrift, ...override.valueDrift },
    bootstrap: override.bootstrap ?? base.bootstrap,
  };
}

export function resolveFromPackage(packageRoot: string, rel: string): string {
  return path.resolve(packageRoot, rel);
}

export function resolveTokenPaths(packageRoot: string, tokenPaths: string[]): string[] {
  return tokenPaths.map((p) => {
    if (path.isAbsolute(p)) return p;
    // Paths in config are relative to package root; ../styles is repo styles
    return path.resolve(packageRoot, p);
  });
}
