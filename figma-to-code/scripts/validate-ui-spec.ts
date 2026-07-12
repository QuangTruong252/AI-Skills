import path from 'node:path';
import { packageRootFrom, readJsonFile, pathExists } from '../src/shared/fs-utils.js';
import { schemaDir, validateAgainstSchema } from '../src/shared/validate.js';

const pkg = packageRootFrom(import.meta.url);
const file =
  process.argv[2] ?? path.join(pkg, 'tests/fixtures/ui-spec/sample.ui-spec.json');

if (!pathExists(file)) {
  console.error(`UI spec not found: ${file}`);
  process.exit(1);
}

const data = readJsonFile(file);
const result = validateAgainstSchema(data, path.join(schemaDir(pkg), 'ui-spec.schema.json'));
if (!result.ok) {
  for (const d of result.diagnostics) console.error(`[${d.code}] ${d.message}`);
  process.exit(1);
}
console.log(`UI spec valid: ${file}`);
