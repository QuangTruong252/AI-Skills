import { runBootstrap } from '../src/bootstrap/bootstrap-tokens.js';
import { packageRootFrom } from '../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);
const result = runBootstrap({ packageRoot: pkg, write: true });

console.log(`tokens:bootstrap ${result.ok ? 'success' : 'failed'}`);
console.log(result.message);
process.exit(result.ok ? 0 : 1);
