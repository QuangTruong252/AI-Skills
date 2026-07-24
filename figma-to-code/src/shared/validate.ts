import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { DIAGNOSTIC_CODES, createDiagnostic, type Diagnostic } from '../contracts/diagnostics.js';
import { SUPPORTED_SCHEMA_VERSIONS } from '../contracts/types.js';

const require = createRequire(import.meta.url);
// Use CJS require for reliable ajv constructability under NodeNext
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Ajv = require('ajv') as new (opts?: object) => {
  compile: (schema: object) => ((data: unknown) => boolean) & { errors?: Array<{
    instancePath?: string;
    message?: string;
    keyword?: string;
    params?: unknown;
  }> };
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const addFormats = require('ajv-formats') as (ajv: unknown) => void;

export type ValidationResult = {
  ok: boolean;
  diagnostics: Diagnostic[];
  data?: unknown;
};

type ValidateFn = ((data: unknown) => boolean) & {
  errors?: Array<{
    instancePath?: string;
    message?: string;
    keyword?: string;
    params?: unknown;
  }>;
};

const schemaCache = new Map<string, ValidateFn>();

function createAjv() {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: false,
  });
  addFormats(ajv);
  return ajv;
}

export function loadSchema(schemaPath: string): object {
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as object;
}

export function validateAgainstSchema(
  data: unknown,
  schemaPath: string,
  options?: { requireSupportedSchemaVersion?: boolean },
): ValidationResult {
  const diagnostics: Diagnostic[] = [];

  if (options?.requireSupportedSchemaVersion !== false) {
    const version = (data as { schemaVersion?: string } | null)?.schemaVersion;
    if (version && !(SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(version)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.SCHEMA_VERSION_UNSUPPORTED,
          'error',
          `Unsupported schemaVersion "${version}". Supported: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}`,
          {
            remediation: 'Bump tooling or provide a compatible schemaVersion.',
            details: { schemaVersion: version },
          },
        ),
      );
      return { ok: false, diagnostics };
    }
  }

  let validate = schemaCache.get(schemaPath);
  if (!validate) {
    if (!fs.existsSync(schemaPath)) {
      diagnostics.push(
        createDiagnostic(DIAGNOSTIC_CODES.FILE_MISSING, 'error', `Schema not found: ${schemaPath}`),
      );
      return { ok: false, diagnostics };
    }
    const schema = loadSchema(schemaPath);
    const ajv = createAjv();
    validate = ajv.compile(schema) as ValidateFn;
    schemaCache.set(schemaPath, validate);
  }

  const ok = Boolean(validate(data));
  if (!ok && validate.errors) {
    for (const err of validate.errors) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.CONFIG_INVALID,
          'error',
          `${err.instancePath || '/'} ${err.message ?? 'invalid'}`,
          {
            details: { keyword: err.keyword, params: err.params as Record<string, unknown> },
            remediation: 'Fix the JSON document to match the schema.',
          },
        ),
      );
    }
  }

  return { ok: diagnostics.length === 0, diagnostics, data };
}

export function parseJsonSafe(text: string, sourceLabel?: string): ValidationResult {
  try {
    return { ok: true, diagnostics: [], data: JSON.parse(text) };
  } catch (e) {
    return {
      ok: false,
      diagnostics: [
        createDiagnostic(
          DIAGNOSTIC_CODES.INVALID_JSON,
          'error',
          `Invalid JSON${sourceLabel ? ` in ${sourceLabel}` : ''}: ${(e as Error).message}`,
        ),
      ],
    };
  }
}

export function schemaDir(packageRoot: string): string {
  return path.join(packageRoot, 'schemas');
}
