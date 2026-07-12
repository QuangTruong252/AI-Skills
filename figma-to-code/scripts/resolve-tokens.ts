import path from 'node:path';
import { getPipelinePaths, runResolve } from '../src/cli/pipeline.js';
import { packageRootFrom } from '../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);
const args = process.argv.slice(2);
const fixtureIdx = args.indexOf('--fixture');

const paths =
  fixtureIdx >= 0
    ? getPipelinePaths({
        packageRoot: pkg,
        fixtureDir: path.resolve(
          args[fixtureIdx + 1] ?? path.join(pkg, 'tests/fixtures/e2e-happy'),
        ),
      })
    : getPipelinePaths({ packageRoot: pkg });

const result = runResolve(paths, { write: true, freeze: true });
console.log(
  `Resolve ok=${result.ok} exit=${result.exitCode} mappings=${Object.keys(result.registry.resolvedMappings).length}`,
);
for (const d of result.diagnostics.filter((x) => x.severity === 'error').slice(0, 30)) {
  console.error(`[${d.code}] ${d.message}`);
}
process.exit(result.exitCode);
