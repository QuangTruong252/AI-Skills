import { describe, expect, it } from 'vitest';
import { contentDigest, stableStringify } from '../../src/shared/serialize.js';

describe('stableStringify', () => {
  it('sorts object keys and is deterministic across runs', () => {
    const a = stableStringify({ b: 1, a: 2, nested: { z: 1, a: 0 } });
    const b = stableStringify({ nested: { a: 0, z: 1 }, a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toContain('"a": 2');
    expect(a.indexOf('"a"')).toBeLessThan(a.indexOf('"b"'));
  });

  it('freezes timestamps when requested', () => {
    const s = stableStringify(
      { exportTime: '2026-01-01T12:00:00.000Z', value: 1 },
      { freezeTimestamps: true },
    );
    expect(s).toContain('1970-01-01T00:00:00.000Z');
  });

  it('contentDigest is stable for same string', () => {
    expect(contentDigest('hello')).toBe(contentDigest('hello'));
    expect(contentDigest('hello')).not.toBe(contentDigest('world'));
  });
});
