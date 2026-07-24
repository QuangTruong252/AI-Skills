import type { Diagnostic } from '../contracts/diagnostics.js';
import { createDiagnostic, sortDiagnostics } from '../contracts/diagnostics.js';

export type VerifyCheck = {
  id: string;
  category:
    | 'build'
    | 'token-lint'
    | 'component'
    | 'responsive'
    | 'theme'
    | 'a11y'
    | 'interaction'
    | 'visual';
  status: 'pass' | 'fail' | 'skip' | 'pending_external';
  message: string;
  evidence?: string;
};

export type VisualIssue = {
  category: string;
  severity: 'error' | 'warning' | 'info';
  viewport?: string;
  theme?: string;
  expected: string;
  actual: string;
  evidencePath?: string;
  suggestedCorrection?: string;
};

export type VerificationReport = {
  checks: VerifyCheck[];
  visualIssues: VisualIssue[];
  blocking: boolean;
  diagnostics: Diagnostic[];
};

export type VerifyInput = {
  buildPass: boolean;
  typecheckPass: boolean;
  unresolvedUsedTokens: string[];
  componentCompliancePass: boolean;
  viewportResults: Array<{ name: string; pass: boolean; detail?: string }>;
  themeResults: Array<{ theme: string; pass: boolean; detail?: string }>;
  a11yBasicsPass: boolean;
  interactionPass: boolean;
  visualIssues?: VisualIssue[];
  /** External visual tooling unavailable */
  visualExternal?: boolean;
};

export function runVerification(input: VerifyInput): VerificationReport {
  const checks: VerifyCheck[] = [];
  const diagnostics: Diagnostic[] = [];

  checks.push({
    id: 'build',
    category: 'build',
    status: input.buildPass && input.typecheckPass ? 'pass' : 'fail',
    message:
      input.buildPass && input.typecheckPass
        ? 'Build and typecheck pass'
        : 'Build or typecheck failed',
  });

  checks.push({
    id: 'token-lint',
    category: 'token-lint',
    status: input.unresolvedUsedTokens.length === 0 ? 'pass' : 'fail',
    message:
      input.unresolvedUsedTokens.length === 0
        ? 'No unresolved used tokens'
        : `Unresolved: ${input.unresolvedUsedTokens.join(', ')}`,
  });

  checks.push({
    id: 'component-compliance',
    category: 'component',
    status: input.componentCompliancePass ? 'pass' : 'fail',
    message: input.componentCompliancePass
      ? 'Component compliance ok'
      : 'Component compliance failed',
  });

  for (const vp of input.viewportResults) {
    checks.push({
      id: `viewport-${vp.name}`,
      category: 'responsive',
      status: vp.pass ? 'pass' : 'fail',
      message: vp.detail ?? (vp.pass ? `${vp.name} ok` : `${vp.name} layout break`),
    });
  }

  for (const th of input.themeResults) {
    checks.push({
      id: `theme-${th.theme}`,
      category: 'theme',
      status: th.pass ? 'pass' : 'fail',
      message: th.detail ?? (th.pass ? `${th.theme} ok` : `${th.theme} unreadable/fail`),
    });
  }

  checks.push({
    id: 'a11y-basics',
    category: 'a11y',
    status: input.a11yBasicsPass ? 'pass' : 'fail',
    message: input.a11yBasicsPass ? 'Keyboard/focus basics ok' : 'Keyboard/focus failure',
  });

  checks.push({
    id: 'interaction-states',
    category: 'interaction',
    status: input.interactionPass ? 'pass' : 'fail',
    message: input.interactionPass ? 'Required states present' : 'Missing required state',
  });

  if (input.visualExternal) {
    checks.push({
      id: 'visual',
      category: 'visual',
      status: 'pending_external',
      message: 'PENDING_EXTERNAL_VERIFICATION: pixel visual comparison requires browser/Figma',
    });
  } else {
    const issues = input.visualIssues ?? [];
    const blockingVisual = issues.some((i) => i.severity === 'error');
    checks.push({
      id: 'visual',
      category: 'visual',
      status: blockingVisual ? 'fail' : 'pass',
      message: blockingVisual ? 'Visual deviations exceed threshold' : 'Visual checks pass',
    });
  }

  const blocking =
    checks.some((c) => c.status === 'fail' && c.category !== 'visual') ||
    checks.some((c) => c.status === 'fail' && c.category === 'visual');

  for (const c of checks.filter((x) => x.status === 'fail')) {
    diagnostics.push(
      createDiagnostic('VERIFY_FAIL', 'error', `${c.id}: ${c.message}`, {
        details: { category: c.category },
      }),
    );
  }

  return {
    checks,
    visualIssues: input.visualIssues ?? [],
    blocking,
    diagnostics: sortDiagnostics(diagnostics),
  };
}

export function isExitGatePass(report: VerificationReport): boolean {
  const required = ['build', 'token-lint', 'component-compliance', 'a11y-basics', 'interaction-states'];
  for (const id of required) {
    const c = report.checks.find((x) => x.id === id);
    if (!c || c.status !== 'pass') return false;
  }
  const responsive = report.checks.filter((c) => c.category === 'responsive');
  if (responsive.some((c) => c.status === 'fail')) return false;
  const themes = report.checks.filter((c) => c.category === 'theme');
  if (themes.some((c) => c.status === 'fail')) return false;
  const visual = report.checks.find((c) => c.id === 'visual');
  if (visual?.status === 'fail') return false;
  // pending_external is allowed for overall pipeline with documentation
  return true;
}
