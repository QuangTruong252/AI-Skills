export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export type DiagnosticSource = {
  file?: string;
  line?: number;
  column?: number;
  nodeId?: string;
  variableId?: string;
};

export type Diagnostic = {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  source?: DiagnosticSource;
  details?: Record<string, unknown>;
  remediation?: string;
};

export const DIAGNOSTIC_CODES = {
  CONFIG_INVALID: 'CONFIG_INVALID',
  SCHEMA_VERSION_UNSUPPORTED: 'SCHEMA_VERSION_UNSUPPORTED',
  SCSS_PARSE_ERROR: 'SCSS_PARSE_ERROR',
  SCSS_UNKNOWN_CONSTRUCT: 'SCSS_UNKNOWN_CONSTRUCT',
  TOKEN_DUPLICATE_DECLARATION: 'TOKEN_DUPLICATE_DECLARATION',
  TOKEN_BROKEN_REFERENCE: 'TOKEN_BROKEN_REFERENCE',
  TOKEN_CIRCULAR_REFERENCE: 'TOKEN_CIRCULAR_REFERENCE',
  FIGMA_MODE_MISSING: 'FIGMA_MODE_MISSING',
  FIGMA_ALIAS_BROKEN: 'FIGMA_ALIAS_BROKEN',
  MAPPING_TARGET_MISSING: 'MAPPING_TARGET_MISSING',
  MAPPING_TYPE_MISMATCH: 'MAPPING_TYPE_MISMATCH',
  MAPPING_UNAPPROVED_SUGGESTION: 'MAPPING_UNAPPROVED_SUGGESTION',
  FIGMA_TOKEN_UNMAPPED_USED: 'FIGMA_TOKEN_UNMAPPED_USED',
  FIGMA_TOKEN_UNMAPPED_UNUSED: 'FIGMA_TOKEN_UNMAPPED_UNUSED',
  VALUE_DRIFT: 'VALUE_DRIFT',
  THEME_MODE_MISMATCH: 'THEME_MODE_MISMATCH',
  GENERATED_OUTPUT_STALE: 'GENERATED_OUTPUT_STALE',
  FILE_MISSING: 'FILE_MISSING',
  INVALID_JSON: 'INVALID_JSON',
  UNSUPPORTED_FIGMA_TYPE: 'UNSUPPORTED_FIGMA_TYPE',
} as const;

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES];

export function createDiagnostic(
  code: string,
  severity: DiagnosticSeverity,
  message: string,
  opts?: {
    source?: DiagnosticSource;
    details?: Record<string, unknown>;
    remediation?: string;
  },
): Diagnostic {
  return {
    code,
    severity,
    message,
    source: opts?.source,
    details: opts?.details,
    remediation: opts?.remediation,
  };
}

export function hasBlockingErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === 'error');
}

export function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort((a, b) => {
    const sev = severityRank(a.severity) - severityRank(b.severity);
    if (sev !== 0) return sev;
    const code = a.code.localeCompare(b.code);
    if (code !== 0) return code;
    return a.message.localeCompare(b.message);
  });
}

function severityRank(s: DiagnosticSeverity): number {
  switch (s) {
    case 'error':
      return 0;
    case 'warning':
      return 1;
    case 'info':
      return 2;
  }
}
