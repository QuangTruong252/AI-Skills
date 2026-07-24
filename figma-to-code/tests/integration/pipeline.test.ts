import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  checkStaleGenerated,
  getPipelinePaths,
  runResolve,
  runSync,
} from '../../src/cli/pipeline.js';
import { packageRootFrom, writeTextFile } from '../../src/shared/fs-utils.js';
import { stableStringify } from '../../src/shared/serialize.js';
import { buildUiSpec } from '../../src/ui-analyzer/build-ui-spec.js';
import {
  buildImplementationPlan,
  lintTokenUsage,
} from '../../src/implementation/plan-implementation.js';
import { isExitGatePass, runVerification } from '../../src/verification/verify.js';
import { schemaDir, validateAgainstSchema } from '../../src/shared/validate.js';

const pkg = packageRootFrom(import.meta.url);
const happy = path.join(pkg, 'tests/fixtures/e2e-happy');

describe('pipeline integration', () => {
  it('happy path tokens:sync produces schema-valid registry and exit 0', () => {
    const paths = getPipelinePaths({ packageRoot: pkg, fixtureDir: happy });
    // clean out
    fs.rmSync(path.join(happy, 'out'), { recursive: true, force: true });
    const result = runSync(paths);
    expect(result.exitCode).toBe(0);
    expect(result.ok).toBe(true);
    expect(fs.existsSync(paths.registryPath)).toBe(true);
    const reg = JSON.parse(fs.readFileSync(paths.registryPath, 'utf8'));
    const v = validateAgainstSchema(reg, path.join(schemaDir(pkg), 'token-registry.schema.json'));
    expect(v.ok).toBe(true);
  });

  it('failing path missing mapping used token exit 1', () => {
    const dir = path.join(pkg, 'tests/fixtures/e2e-fail-unmap');
    fs.mkdirSync(path.join(dir, 'scss'), { recursive: true });
    fs.copyFileSync(
      path.join(happy, 'scss/tokens.scss'),
      path.join(dir, 'scss/tokens.scss'),
    );
    fs.copyFileSync(
      path.join(happy, 'figma-variables.snapshot.json'),
      path.join(dir, 'figma-variables.snapshot.json'),
    );
    writeTextFile(
      path.join(dir, 'token-map.json'),
      stableStringify({
        schemaVersion: '1.0.0',
        usedFigmaTokens: ['app/primary'],
        mappings: [],
      }),
    );
    const paths = getPipelinePaths({ packageRoot: pkg, fixtureDir: dir });
    const result = runResolve(paths, { write: true, freeze: true });
    expect(result.exitCode).toBe(1);
    expect(result.diagnostics.some((d) => d.code === 'FIGMA_TOKEN_UNMAPPED_USED')).toBe(true);
  });

  it('determinism: two sync runs produce identical content', () => {
    const paths = getPipelinePaths({ packageRoot: pkg, fixtureDir: happy });
    const r1 = runSync(paths);
    const reg1 = fs.readFileSync(paths.registryPath, 'utf8');
    const ad1 = fs.readFileSync(paths.adapterPath, 'utf8');
    const r2 = runSync(paths);
    const reg2 = fs.readFileSync(paths.registryPath, 'utf8');
    const ad2 = fs.readFileSync(paths.adapterPath, 'utf8');
    expect(r1.exitCode).toBe(0);
    expect(r2.exitCode).toBe(0);
    expect(reg1).toBe(reg2);
    expect(ad1).toBe(ad2);
  });

  it('stale generated check fails when registry is dirtied', () => {
    const paths = getPipelinePaths({ packageRoot: pkg, fixtureDir: happy });
    runSync(paths);
    const ok = checkStaleGenerated(paths);
    expect(ok.stale).toBe(false);
    expect(ok.exitCode).toBe(0);

    // dirty — mutate semantic content (trailing whitespace alone may re-normalize equal)
    const dirty = JSON.parse(fs.readFileSync(paths.registryPath, 'utf8')) as {
      schemaVersion: string;
    };
    dirty.schemaVersion = '0.0.0-dirty';
    fs.writeFileSync(paths.registryPath, JSON.stringify(dirty, null, 2));
    const stale = checkStaleGenerated(paths);
    expect(stale.stale).toBe(true);
    expect(stale.exitCode).toBe(1);

    // repair
    runSync(paths);
    expect(checkStaleGenerated(paths).exitCode).toBe(0);
  });

  it('invalid schema version fails closed', () => {
    const dir = path.join(pkg, 'tests/fixtures/e2e-bad-schema');
    fs.mkdirSync(path.join(dir, 'scss'), { recursive: true });
    fs.copyFileSync(path.join(happy, 'scss/tokens.scss'), path.join(dir, 'scss/tokens.scss'));
    writeTextFile(
      path.join(dir, 'figma-variables.snapshot.json'),
      stableStringify({
        schemaVersion: '99.0.0',
        documentName: 'x',
        pluginVersion: '1',
        exportTime: '1970-01-01T00:00:00.000Z',
        collections: [],
      }),
    );
    writeTextFile(
      path.join(dir, 'token-map.json'),
      stableStringify({ schemaVersion: '1.0.0', mappings: [] }),
    );
    const paths = getPipelinePaths({ packageRoot: pkg, fixtureDir: dir });
    const result = runResolve(paths, { write: false });
    expect(result.exitCode).toBe(1);
    expect(result.diagnostics.some((d) => d.code === 'SCHEMA_VERSION_UNSUPPORTED')).toBe(true);
  });
});

describe('phase 1/3/4 skills modules', () => {
  it('builds ui-spec with token node traceability and no fixed frame CSS default', () => {
    const spec = buildUiSpec({
      nodeId: '1:1',
      name: 'Card',
      type: 'FRAME',
      width: 1440,
      tokenReferences: [{ property: 'fills', tokenName: 'app/primary' }],
      componentHints: [{ name: 'app-card', evidence: ['padding auto-layout'] }],
      screenshotContradiction: 'tree has 2 children, screenshot shows 3',
    });
    expect(spec.tree.tokenReferences?.[0]?.nodeId).toBe('1:1');
    expect(spec.tree.responsiveIntent).not.toBe('Fixed');
    expect(spec.diagnostics.some((d) => d.message.includes('contradiction'))).toBe(true);
    const v = validateAgainstSchema(spec, path.join(schemaDir(pkg), 'ui-spec.schema.json'));
    expect(v.ok).toBe(true);
  });

  it('implementation plan prefers existing components and token lint catches unresolved', () => {
    const plan = buildImplementationPlan({
      nodes: [
        {
          id: '1',
          name: 'Primary Button',
          componentMatch: {
            name: 'app-button',
            confidence: 0.85,
            evidence: ['primary fill'],
          },
          tokenReferences: [{ tokenName: 'app/primary' }],
        },
      ],
      availableComponents: ['app-button'],
    });
    expect(plan.items[0]?.strategy).toBe('Existing component');

    const lint = lintTokenUsage({
      usedTokens: ['--app-primary', '--missing-token'],
      resolvedMappings: { 'app/primary': { systemToken: '--app-primary' } },
      systemTokenNames: ['--app-primary'],
    });
    expect(lint.ok).toBe(false);
    expect(lint.unresolved).toContain('--missing-token');
  });

  it('verification gate allows pending external visual', () => {
    const report = runVerification({
      buildPass: true,
      typecheckPass: true,
      unresolvedUsedTokens: [],
      componentCompliancePass: true,
      viewportResults: [
        { name: 'mobile', pass: true },
        { name: 'desktop', pass: true },
      ],
      themeResults: [
        { theme: 'light', pass: true },
        { theme: 'dark', pass: true },
      ],
      a11yBasicsPass: true,
      interactionPass: true,
      visualExternal: true,
    });
    expect(isExitGatePass(report)).toBe(true);
    expect(report.checks.find((c) => c.id === 'visual')?.status).toBe('pending_external');
  });
});
