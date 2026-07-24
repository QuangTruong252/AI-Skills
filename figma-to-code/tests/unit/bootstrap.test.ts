import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runBootstrap } from '../../src/bootstrap/bootstrap-tokens.js';
import { packageRootFrom } from '../../src/shared/fs-utils.js';

const pkg = packageRootFrom(import.meta.url);

describe('bootstrapper', () => {
  it('runs bootstrap dry-run successfully', () => {
    const result = runBootstrap({
      packageRoot: pkg,
      write: false,
    });
    
    expect(result.ok).toBe(true);
    expect(result.message).toContain('Bootstrapped');
  });
});
