import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageRootFrom } from '../../src/shared/fs-utils.js';
import { parseJsonSafe, schemaDir, validateAgainstSchema } from '../../src/shared/validate.js';
import { DEFAULT_CONFIG } from '../../src/config/load-config.js';

const pkg = packageRootFrom(import.meta.url);

describe('schema validation', () => {
  it('accepts valid config', () => {
    const result = validateAgainstSchema(
      DEFAULT_CONFIG,
      path.join(schemaDir(pkg), 'figma-to-code.config.schema.json'),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects missing required field', () => {
    const result = validateAgainstSchema(
      { schemaVersion: '1.0.0' },
      path.join(schemaDir(pkg), 'figma-to-code.config.schema.json'),
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.severity === 'error')).toBe(true);
  });

  it('rejects unsupported schema version', () => {
    const result = validateAgainstSchema(
      { ...DEFAULT_CONFIG, schemaVersion: '9.9.9' },
      path.join(schemaDir(pkg), 'figma-to-code.config.schema.json'),
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'SCHEMA_VERSION_UNSUPPORTED')).toBe(true);
  });

  it('parseJsonSafe reports invalid JSON', () => {
    const r = parseJsonSafe('{nope', 'x.json');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('INVALID_JSON');
  });
});
