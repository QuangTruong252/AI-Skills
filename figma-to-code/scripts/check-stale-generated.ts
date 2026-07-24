import path from 'node:path';
import { checkStaleGenerated, getPipelinePaths } from '../src/cli/pipeline.js';
import { packageRootFrom } from '../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);
const args = process.argv.slice(2);
const fixtureFlag = args.includes('--fixture');
const fixtureIdx = args.indexOf('--fixture');
const fixturePath =
  fixtureFlag && args[fixtureIdx + 1] && !args[fixtureIdx + 1]!.startsWith('-')
    ? path.resolve(args[fixtureIdx + 1]!)
    : path.join(pkg, 'tests/fixtures/e2e-happy');

const paths = fixtureFlag
  ? getPipelinePaths({ packageRoot: pkg, fixtureDir: fixturePath })
  : getPipelinePaths({ packageRoot: pkg });

const result = checkStaleGenerated(paths);
console.log(result.message);
process.exit(result.exitCode);
