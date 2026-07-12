import path from 'node:path';
import { getPipelinePaths, runScan } from '../src/cli/pipeline.js';
import { packageRootFrom, writeTextFile } from '../src/shared/fs-utils.js';
import { stableStringify } from '../src/shared/serialize.js';
import { hasBlockingErrors } from '../src/contracts/diagnostics.js';

const pkg = packageRootFrom(import.meta.url);
const args = process.argv.slice(2);
const fixtureIdx = args.indexOf('--fixture');
const outIdx = args.indexOf('--out');

const paths =
  fixtureIdx >= 0
    ? getPipelinePaths({
        packageRoot: pkg,
        fixtureDir: path.resolve(
          args[fixtureIdx + 1] ?? path.join(pkg, 'tests/fixtures/e2e-happy'),
        ),
      })
    : getPipelinePaths({ packageRoot: pkg });

const registry = runScan(paths, pkg);
const outPath =
  outIdx >= 0
    ? path.resolve(args[outIdx + 1]!)
    : paths.systemDebugPath ?? path.join(pkg, 'generated/system-token-registry.debug.json');

writeTextFile(outPath, stableStringify(registry, { freezeTimestamps: true }));

const errors = registry.diagnostics.filter((d) => d.severity === 'error');
console.log(
  `Scanned declarations=${registry.declarations.length} diagnostics=${registry.diagnostics.length} errors=${errors.length}`,
);
console.log(`Wrote ${outPath}`);

if (hasBlockingErrors(registry.diagnostics)) {
  for (const d of errors.slice(0, 20)) {
    console.error(`[${d.code}] ${d.message}`);
  }
  process.exit(1);
}
