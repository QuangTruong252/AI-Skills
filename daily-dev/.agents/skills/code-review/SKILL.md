---
name: code-review
description: Use when daily-dev routes a repository task whose dominant outcome is independent evaluation without implementation, including working-tree, staged-diff, commit-range, pull-request, targeted audit, or completion-evidence review.
---

# Code Review

## Role

`code-review` is an evidence-driven, review-only workflow. It evaluates a bounded repository target against developer instructions, objective repository facts, canonical rules, approved requirements, and current validation evidence.

`daily-dev` retains whole-task ownership. This workflow owns only the routed review scope and returns findings, limitations, evidence, and a recommended next route.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and instruction precedence.
- [`core.md`](../../rules/core.md): scope, approval gates, shared consumers, conflicts, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): tests, validation, retries, completion evidence, and final reporting.
- Applicable domain rules such as [`angular.md`](../../rules/angular.md) and [`scss.md`](../../rules/scss.md).

## Activation and ownership

Use this workflow as primary when the dominant requested outcome is evaluation without implementation. Examples include reviewing working-tree changes, a staged diff, a commit range, a pull request, a bounded component or flow, or another agent's completion evidence.

`daily-dev` MAY delegate `code-review` as a secondary independent review after `bugfix`, `feature-change`, or `figma-to-ui` completes a bounded implementation stage.

This workflow MUST NOT reroute the task, invoke another workflow, edit repository files, or declare the whole task complete. Return findings and a probable follow-up route to `daily-dev`; only `daily-dev` may choose the next workflow.

## Review-only boundary

The review scope is read-only.

The reviewer MAY:

- inspect files, diffs, history, configuration, callers, consumers, tests, and documentation;
- run non-destructive, repository-confirmed validation commands when required to prove or disprove a concern;
- identify the smallest safe resolution;
- recommend routing to `bugfix`, `feature-change`, or `figma-to-ui`.

The reviewer MUST NOT:

- modify code, tests, configuration, documentation, generated output, or task artifacts except an explicitly required review handoff artifact;
- stage, commit, push, merge, rebase, tag, switch branches, or create pull requests;
- transform a finding into an implementation patch unless the developer separately starts an implementation task;
- treat a combined review-and-implementation request as implicit permission to edit.

When the user requests both review and implementation, return the bounded review result to `daily-dev` with a recommended implementation route.

## Required reading

Before review:

1. Read `AGENTS.md`, `core.md`, and `quality-gates.md`.
2. Read applicable domain rules and repository references.
3. Resolve the review target, baseline, acceptance sources, included scope, and excluded scope.
4. Inspect objective repository configuration relevant to the target.
5. Inspect the complete directly affected flow and consumer dimensions necessary to evaluate the target.

## Required input

Require or derive:

```yaml
code_review_input:
  objective:
  review_mode: change-review | targeted-audit | evidence-review
  target:
  baseline:
  acceptance_sources: []
  included_scope: []
  excluded_scope: []
  available_validation_evidence: []
```

A baseline MAY be working tree versus `HEAD`, staged changes versus `HEAD`, an explicit commit range, a pull-request base and head, an approved plan, or the current state of a bounded audit target.

Do not assume `HEAD~1` or another arbitrary baseline. When target or baseline cannot be determined objectively, return `WAITING_FOR_CLARIFICATION`. When required access is unavailable and no evidence-preserving fallback exists, return `BLOCKED`.

## Review modes

```yaml
review_modes:
  change-review:
    targets: [working-tree, staged-diff, commit-range, pull-request]
    default: true
  targeted-audit:
    targets: [specific-flow, file-set, component, service, module]
  evidence-review:
    targets: [completion-claims, validation-output, handoff, task-artifact]
```

### Change review

Review the selected diff and only the callers, consumers, contracts, tests, and configuration needed to understand its consequences. Include untracked files when they are part of the current change surface.

### Targeted audit

Review the named target and complete directly affected flow. Do not expand into an unbounded repository audit. Evidence-led read-only discovery MAY reach a shared dependency or nearest consumer when required to evaluate the target.

### Evidence review

Evaluate whether stated completion, test, build, runtime, or UI claims are supported by current evidence. Do not infer success from summaries, stale command output, or another agent's confidence.

## Source authority

Apply repository precedence:

1. Developer instruction for the current task.
2. Objective repository facts.
3. `AGENTS.md`.
4. `core.md`.
5. Applicable domain rules.
6. Approved specification, plan, or task artifact.
7. Applicable workflow contract.
8. Repository references.
9. Compatible local patterns.

Existing code is evidence of current behavior, not automatic proof of approved behavior or convention. Identify exact conflicts and limitations rather than silently selecting the easiest interpretation.

## Workflow state machine

```text
RESOLVE TARGET AND BASELINE
→ LOAD ACCEPTANCE SOURCES
→ INSPECT DIFF OR TARGET
→ INSPECT DIRECTLY AFFECTED FLOW
→ INSPECT REQUIRED CONSUMERS
→ CHECK SPEC COMPLIANCE
→ CHECK CORRECTNESS AND REGRESSIONS
→ CHECK SECURITY AND DATA SAFETY
→ CHECK PUBLIC AND SHARED CONTRACTS
→ CHECK VALIDATION EVIDENCE
→ CHECK UI, ACCESSIBILITY, RESPONSIVE AND THEMES
→ CHECK PERFORMANCE AND RESOURCE SAFETY
→ CHECK MAINTAINABILITY
→ DEDUPLICATE AND RANK FINDINGS
→ RETURN RESULT TO DAILY-DEV
```

Exit states are `COMPLETED`, `WAITING_FOR_CLARIFICATION`, `BLOCKED`, and `HANDOFF_REQUIRED`.

## Scope and discovery

Inspect:

- every changed or explicitly targeted file;
- directly affected implementations, callers, templates, styles, public contracts, and relevant tests;
- nearest consumers required to establish impact;
- objective configuration, schemas, generated contracts, and runtime constraints when touched;
- untracked files belonging to the selected change surface.

Do not review unrelated legacy code merely because it is nearby. Report an out-of-scope issue only when it creates a concrete correctness, security, accessibility, compatibility, validation, or maintenance risk for the reviewed target.

## Review sequence

Review in this priority order:

1. Requirement and specification compliance.
2. Correctness.
3. Regression risk.
4. Security, authorization, privacy, and destructive behavior.
5. Public and shared contract compatibility.
6. State, data flow, lifecycle, and resource cleanup.
7. Validation evidence.
8. Accessibility and interaction.
9. Responsive layout, themes, and approved design fidelity.
10. Performance and resource usage.
11. Maintainability.
12. Naming or style only when it creates concrete risk.

Formatting or stylistic preferences MUST NOT obscure higher-impact findings.

## Finding eligibility

A confirmed finding requires:

```yaml
finding_eligibility:
  observable_condition:
  evidence:
  affected_behavior:
  plausible_trigger:
  concrete_impact:
  smallest_safe_resolution:
```

Do not create findings for personal preference, speculative architecture, theoretical edge cases with no path, formatter-owned style, unrelated code, or optimization without a plausible impact path.

A concern that cannot meet this threshold belongs in `questions_or_required_verification`, not confirmed findings.

## Severity model

### P0 — Blocker

Use for an exploitable security failure, destructive data loss or corruption, authentication or authorization bypass, an application that cannot build or start, or a production-critical path that is certainly broken.

### P1 — High

Use for violated accepted behavior, a primary-flow regression, broken public or shared contract, materially wrong state or data flow, a required canonical approval that was bypassed, a primary accessibility failure, or a false completion claim that masks missing evidence.

### P2 — Medium

Use for a realistic secondary-flow or edge-flow defect, probable resource leak, supported responsive or theme failure, incomplete consumer analysis with material risk, a maintainability defect with a credible failure path, or missing evidence for changed behavior with material regression risk.

### P3 — Low

Use for a real localized defect with limited impact, a minor accessibility issue, a small maintainability risk, or misleading naming or duplication that creates a concrete but low risk. P3 is not a style-nit bucket.

Severity is based on observable impact, likelihood, and affected scope. Repetition alone does not increase severity.

## Confidence model

```yaml
confidence:
  high:
    basis: directly-proven-by-code-contract-command-or-runtime-evidence
  medium:
    basis: strong-execution-path-with-one-limited-unverified-assumption
  low:
    action: questions_or_required_verification
```

Only `high` and `medium` confidence items may appear as confirmed findings. State the unverified assumption for every medium-confidence finding.

## Finding format

```markdown
### [P1] Defect-focused title

- Location: `path/file.ts:42-58`
- Confidence: High
- Requirement or rule:
- Evidence:
- Trigger:
- Impact:
- Affected consumers:
- Smallest safe resolution:
- Validation needed:
```

Use the smallest useful location range. Describe the execution path and impact, not only the code shape. Recommend the smallest safe resolution without writing a full patch.

## Deduplication

- One root cause affecting multiple locations produces one finding with all relevant locations.
- Symptoms with one proven causal chain are grouped.
- Independent defects remain separate.
- Do not repeat the same issue under correctness, validation, and maintainability.
- Do not increase severity because one root cause appears repeatedly.

## Specification and correctness review

Check that implementation satisfies explicit acceptance criteria and does not add unapproved behavior. A clean implementation that solves the wrong requirement is a finding.

Trace changed branches, state transitions, data transformations, error handling, cleanup, and public behavior. When multiple symptoms exist, group them only when evidence proves a shared root cause.

## Shared, public, and approval review

For shared or public changes, inspect all applicable consumer dimensions required by [`core.md#shared-component-changes`](../../rules/core.md#shared-component-changes), including selectors, symbols, direct and barrel imports, inputs, outputs, models, event payloads, projected content, routes, tests, demos, wrappers, and verification surfaces.

Review whether changes requiring [`core.md#high-risk-changes`](../../rules/core.md#high-risk-changes) had explicit approval and stayed inside the approved boundary.

```yaml
approval_review:
  approved_and_implemented: []
  required_but_missing: []
  approval_scope_exceeded: []
  approval_evidence_unavailable: []
```

Do not duplicate the canonical trigger list in this workflow.

## Validation evidence

Reuse fresh, relevant evidence when it covers the final reviewed state. Invalidate evidence made stale by later changes.

The reviewer MAY run a repository-confirmed, non-destructive command only when needed to prove or disprove a suspected finding or evidence gap. Record the exact command and result. Do not change files, configuration, fixtures, snapshots, or tests to make validation pass.

```yaml
validation_evidence:
  current: accept
  stale_after_later_change: invalidate
  incomplete: report-gap
  unavailable: NOT_VERIFIED
  contradictory: finding-or-blocked
```

Testing, validation, completion evidence, and retry policy belong exclusively to [`quality-gates.md`](../../rules/quality-gates.md). Build success does not prove runtime or UI correctness.

## Test review

Evaluate whether existing tests and reported executions prove the changed behavior:

- assertions map to acceptance criteria;
- tests cannot pass while the behavior remains wrong;
- mocks do not conceal the relevant integration boundary;
- required focused existing tests were run when canonical policy requires them;
- evidence remains current after the final change.

Do not require a new test merely to increase coverage. Identify a missing regression test only when a concrete changed path has material recurrence risk, and return the proposal to `daily-dev` for developer decision.

## Security and sensitive data

Review authentication, authorization, input validation, unsafe HTML, injection paths, persistence, destructive actions, secret exposure, unsafe logging, and sensitive personal data when relevant.

Do not copy secret values or sensitive payloads into findings. Redact them, avoid unnecessary access, and do not run production-like destructive flows or add instrumentation.

## UI, Figma, accessibility, responsive, and themes

When UI is in scope, inspect approved visual sources, component reuse, semantic token use, forbidden hardcoding, fixed dimensions, responsive behavior, supported themes, loading and error states, keyboard operation, focus, labels, ARIA, assets, and interaction fidelity.

When runtime or visual comparison evidence is unavailable, state `NOT_VERIFIED`. Do not claim visual correctness from static review alone.

## Performance and resource review

Create a performance finding only when there is a clear execution path, relevant scale or frequency, plausible measurable impact, and a bounded resolution. Do not report micro-optimization preferences or theoretical complexity that cannot occur under supported inputs.

Review deterministic cleanup for subscriptions, listeners, timers, observers, streams, and external resources when the target creates or changes them.

## Generated, vendor, and binary files

Review the source of truth before generated output. Do not line-review minified, vendor, or generated files as authored implementation. Report generated drift when the source changed but required output did not.

For binary assets, evaluate presence, path, format, size, and usage contract only when evidence supports a finding.

## No-findings behavior

When no actionable findings meet the eligibility threshold, report:

```markdown
## Findings

No actionable findings were identified in the reviewed scope.
```

Still report the exact scope, acceptance limitations, validation coverage, and unverified areas. Do not imply that code outside the reviewed scope is defect-free.

## Review assessment

```yaml
review_outcome:
  ready:
    condition: no-P0-no-P1-and-no-unresolved-blocking-limitation
  changes-required:
    condition: P0-or-P1-or-unsatisfied-acceptance
  blocked:
    condition: target-baseline-access-or-material-evidence-unavailable
```

P2 and P3 do not automatically block. Explain whether each should be handled in the current task or recorded for later.

`ready` is a review assessment only. It does not authorize Git writes, merge, release, or deployment.

## Task artifact

Create or update `working-docs/active-task.md` only when the review is secondary, a blocker or handoff exists, work must survive a session or model boundary, or the developer explicitly requests persistence.

Do not persist raw diffs, secrets, sensitive payloads, or long command output. Preserve only the review target, baseline, scope, findings, limitations, evidence, and next action required by `daily-dev`.

## Result and return

Use [`templates/code-review-result.md`](templates/code-review-result.md).

```yaml
code_review_result:
  workflow_scope:
    mode: primary | secondary
    review_mode: change-review | targeted-audit | evidence-review
    status: completed | blocked | clarification-required | handoff-required
  target:
    baseline:
    head:
    files_reviewed: []
    directly_affected_flow: []
    consumers_reviewed: []
    excluded_scope: []
  acceptance:
    sources: []
    limitations: []
  findings:
    p0: []
    p1: []
    p2: []
    p3: []
  questions_or_required_verification: []
  validation:
    evidence_reused: []
    commands_run: []
    not_verified: []
  assessment:
    outcome: ready | changes-required | blocked
    reason:
    recommended_follow_up: []
  return_to: daily-dev
```

A finding that requires implementation MUST name the probable route and return ownership to `daily-dev`. This workflow never implements the resolution or selects the final route.
