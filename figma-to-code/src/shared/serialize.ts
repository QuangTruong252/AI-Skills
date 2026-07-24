/**
 * Deterministic JSON serialization: sorted object keys, LF newlines, no trailing spaces.
 * Optionally replaces exportTime / timestamps with a freeze value for golden tests.
 */
export function stableStringify(
  value: unknown,
  options?: { space?: number; freezeTimestamps?: boolean | string },
): string {
  const space = options?.space ?? 2;
  const freeze = options?.freezeTimestamps;
  const normalized = normalizeForSerialize(value, freeze);
  return `${JSON.stringify(normalized, null, space)}\n`;
}

function normalizeForSerialize(value: unknown, freeze: boolean | string | undefined): unknown {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string' && freeze && looksLikeIsoTimestamp(value)) {
      return typeof freeze === 'string' ? freeze : '1970-01-01T00:00:00.000Z';
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => normalizeForSerialize(v, freeze));
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    let v = obj[key];
    if (
      freeze &&
      (key === 'exportTime' || key === 'generatedAt' || key === 'timestamp') &&
      typeof v === 'string'
    ) {
      v = typeof freeze === 'string' ? freeze : '1970-01-01T00:00:00.000Z';
    } else {
      v = normalizeForSerialize(v, freeze);
    }
    out[key] = v;
  }
  return out;
}

function looksLikeIsoTimestamp(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s);
}

export function contentDigest(text: string): string {
  // Simple stable FNV-1a 32-bit for determinism checks without crypto dependency issues
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
