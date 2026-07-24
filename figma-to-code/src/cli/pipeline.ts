import path from 'node:path';
import type { Diagnostic } from '../contracts/diagnostics.js';
import { hasBlockingErrors } from '../contracts/diagnostics.js';
import type {
  FigmaVariablesSnapshot,
  TokenMap,
  TokenRegistryGenerated,
} from '../contracts/types.js';
import { loadConfig, resolveFromPackage, resolveTokenPaths } from '../config/load-config.js';
import { scanTokenPaths } from '../scanner/scan-tokens.js';
import { resolveTokens, generateAdapterScss } from '../resolver/resolve-tokens.js';
import { pathExists, readJsonFile, readTextFile, writeTextFile } from '../shared/fs-utils.js';
import { stableStringify } from '../shared/serialize.js';
import { schemaDir, validateAgainstSchema, parseJsonSafe } from '../shared/validate.js';

export type PipelinePaths = {
  packageRoot: string;
  snapshotPath: string;
  tokenMapPath: string;
  registryPath: string;
  adapterPath: string;
  systemDebugPath?: string;
  scssPaths: string[];
};

export function getPipelinePaths(opts?: {
  packageRoot?: string;
  fixtureDir?: string;
}): PipelinePaths {
  const { config, packageRoot, diagnostics } = loadConfig({ packageRoot: opts?.packageRoot });
  if (hasBlockingErrors(diagnostics)) {
    throw new Error(diagnostics.map((d) => d.message).join('; '));
  }

  if (opts?.fixtureDir) {
    const root = opts.fixtureDir;
    return {
      packageRoot,
      snapshotPath: path.join(root, 'figma-variables.snapshot.json'),
      tokenMapPath: path.join(root, 'token-map.json'),
      registryPath: path.join(root, 'out', 'token-registry.generated.json'),
      adapterPath: path.join(root, 'out', 'mapped.generated.scss'),
      systemDebugPath: path.join(root, 'out', 'system-token-registry.debug.json'),
      scssPaths: [path.join(root, 'scss')],
    };
  }

  return {
    packageRoot,
    snapshotPath: resolveFromPackage(packageRoot, config.figma.snapshotPath),
    tokenMapPath: resolveFromPackage(packageRoot, config.mapping.tokenMapPath),
    registryPath: resolveFromPackage(packageRoot, config.output.registryPath),
    adapterPath: resolveFromPackage(packageRoot, config.output.adapterScssPath),
    systemDebugPath: config.output.systemRegistryDebugPath
      ? resolveFromPackage(packageRoot, config.output.systemRegistryDebugPath)
      : undefined,
    scssPaths: resolveTokenPaths(packageRoot, config.scss.tokenPaths),
  };
}

export function runScan(paths: PipelinePaths, packageRoot?: string) {
  const { config } = loadConfig({ packageRoot: packageRoot ?? paths.packageRoot });
  return scanTokenPaths({
    tokenPaths: paths.scssPaths,
    includePrivate: config.scss.includePrivate,
    privatePrefix: config.scss.privatePrefix,
    tokenNamespaces: config.scss.tokenNamespaces,
    layerHeuristics: config.scss.layerHeuristics,
    packageRoot: paths.packageRoot,
  });
}

export function runResolve(
  paths: PipelinePaths,
  options?: { write?: boolean; freeze?: boolean },
): {
  ok: boolean;
  exitCode: number;
  registry: TokenRegistryGenerated;
  diagnostics: Diagnostic[];
  adapterScss: string;
} {
  const pkg = paths.packageRoot;
  const { config } = loadConfig({ packageRoot: pkg });

  if (!pathExists(paths.snapshotPath)) {
    throw new Error(`Snapshot not found: ${paths.snapshotPath}`);
  }
  if (!pathExists(paths.tokenMapPath)) {
    throw new Error(`Token map not found: ${paths.tokenMapPath}`);
  }

  const snapText = readJsonFile<unknown>(paths.snapshotPath);
  const mapText = readJsonFile<unknown>(paths.tokenMapPath);

  const snapVal = validateAgainstSchema(
    snapText,
    path.join(schemaDir(pkg), 'figma-variables.snapshot.schema.json'),
  );
  const mapVal = validateAgainstSchema(
    mapText,
    path.join(schemaDir(pkg), 'token-map.schema.json'),
  );

  if (!snapVal.ok || !mapVal.ok) {
    const diagnostics = [...snapVal.diagnostics, ...mapVal.diagnostics];
    const empty = emptyRegistry(diagnostics);
    return {
      ok: false,
      exitCode: 1,
      registry: empty,
      diagnostics,
      adapterScss: '',
    };
  }

  const snapshot = snapText as FigmaVariablesSnapshot;
  const tokenMap = mapText as TokenMap;
  const system = runScan(paths, pkg);

  const result = resolveTokens({
    snapshot,
    system,
    tokenMap,
    usedFigmaTokens: tokenMap.usedFigmaTokens,
    valueDriftEnabled: config.valueDrift.enabled,
  });

  const adapterScss = generateAdapterScss(result.registry);
  const freeze = options?.freeze ?? Boolean(config.freezeExportTime);

  if (options?.write !== false) {
    writeTextFile(
      paths.registryPath,
      stableStringify(result.registry, { freezeTimestamps: freeze || true }),
    );
    writeTextFile(paths.adapterPath, adapterScss);
    if (paths.systemDebugPath) {
      writeTextFile(paths.systemDebugPath, stableStringify(system, { freezeTimestamps: true }));
    }
  }

  return {
    ok: result.ok,
    exitCode: result.ok ? 0 : 1,
    registry: result.registry,
    diagnostics: result.diagnostics,
    adapterScss,
  };
}

export function runSync(
  paths: PipelinePaths,
  options?: { write?: boolean },
): ReturnType<typeof runResolve> {
  return runResolve(paths, { write: options?.write ?? true, freeze: true });
}

export function checkStaleGenerated(paths: PipelinePaths): {
  stale: boolean;
  exitCode: number;
  message: string;
} {
  const fresh = runResolve(paths, { write: false, freeze: true });
  const expectedRegistry = stableStringify(fresh.registry, { freezeTimestamps: true });
  const expectedAdapter = fresh.adapterScss.replace(/\r\n/g, '\n');

  if (!pathExists(paths.registryPath) || !pathExists(paths.adapterPath)) {
    return {
      stale: true,
      exitCode: 1,
      message: 'Generated outputs missing; run tokens:sync',
    };
  }

  const actualRegistry = readTextFile(paths.registryPath);
  const actualAdapter = readTextFile(paths.adapterPath).replace(/\r\n/g, '\n');
  const actualRegNorm = normalizeJsonFile(actualRegistry);
  const expectedRegNorm = normalizeJsonFile(expectedRegistry);

  if (actualRegNorm !== expectedRegNorm || actualAdapter !== expectedAdapter) {
    return {
      stale: true,
      exitCode: 1,
      message: 'GENERATED_OUTPUT_STALE: run npm run tokens:sync',
    };
  }

  return { stale: false, exitCode: 0, message: 'Generated outputs are up to date' };
}

function normalizeJsonFile(text: string): string {
  try {
    return stableStringify(JSON.parse(text), { freezeTimestamps: true });
  } catch {
    return text;
  }
}

function emptyRegistry(diagnostics: Diagnostic[]): TokenRegistryGenerated {
  return {
    schemaVersion: '1.0.0',
    figmaTokens: {},
    systemTokens: {},
    resolvedMappings: {},
    suggestedMappings: {},
    diagnostics: {
      unmappedFigmaTokens: [],
      missingSystemTokens: [],
      typeMismatches: [],
      modeMismatches: [],
      valueDrifts: [],
      circularAliases: [],
      brokenReferences: [],
      items: diagnostics,
    },
  };
}

export function loadSnapshotFile(filePath: string): {
  ok: boolean;
  snapshot?: FigmaVariablesSnapshot;
  diagnostics: Diagnostic[];
} {
  try {
    const text = readTextFile(filePath);
    const parsed = parseJsonSafe(text, filePath);
    if (!parsed.ok) return { ok: false, diagnostics: parsed.diagnostics };
    return { ok: true, snapshot: parsed.data as FigmaVariablesSnapshot, diagnostics: [] };
  } catch (e) {
    return {
      ok: false,
      diagnostics: [
        {
          code: 'FILE_MISSING',
          severity: 'error',
          message: (e as Error).message,
        },
      ],
    };
  }
}
