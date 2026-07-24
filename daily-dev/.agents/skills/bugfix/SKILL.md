---
name: bugfix
description: Use when an existing repository behavior is incorrect, broken, intermittent, or regressed and the task must identify and correct the causal failure without silently changing the accepted behavior contract.
---

# Bugfix

## Role

`bugfix` is the primary workflow for correcting existing behavior. It receives
ownership from `daily-dev`, establishes expected versus observed behavior,
collects reproducible or evidence-backed failure data, identifies the causal
mechanism, implements the smallest coherent fix, and returns current validation
evidence to `daily-dev`.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and precedence.
- [`core.md`](../../rules/core.md): scope, approval, shared-consumer impact,
  conflicts, security, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): testing, validation,
  correction limits, completion evidence, and final reporting.

## Activation and ownership

Use this skill only when `daily-dev` routes an existing-behavior failure to
`bugfix` as the primary workflow or delegates a bounded secondary scope.

Use it for incorrect output, runtime failure, regression, intermittent behavior,
race conditions, compatibility failures, malformed integration data, or an
existing interaction that no longer satisfies its accepted contract.

Do not use it when the requested behavior never existed, the main acceptance
source is Figma, or the task is evaluation without implementation. Return new
behavior to `daily-dev` for possible `feature-change` routing.

`daily-dev` retains whole-task ownership. `bugfix` MUST NOT reroute itself,
invoke another workflow, alter the approved boundary, or declare the whole task
complete.

## Required input

Before investigation, require or derive:

```yaml
bugfix_intake:
  expected_behavior:
  observed_behavior:
  affected_environment:
  known_reproduction_steps: []
  available_evidence: []
  initial_scope: []
  acceptance_source:
```

If expected behavior, scope, acceptance, or source of truth is materially
ambiguous, return `WAITING_FOR_CLARIFICATION` to `daily-dev` before editing.

## Workflow

```text
INTAKE FROM DAILY-DEV
→ DEFINE EXPECTED VS ACTUAL
→ REPRODUCE WHEN FEASIBLE
→ COLLECT FAILURE EVIDENCE
→ INSPECT DIRECTLY AFFECTED FLOW
→ FORM EVIDENCE-BACKED ROOT-CAUSE HYPOTHESIS
→ USE BOUNDED INSTRUMENTATION IF REQUIRED
→ CONFIRM OR DISPROVE THE HYPOTHESIS
→ CHECK SCOPE, OWNERSHIP, AND RISK
→ COMPARE CANDIDATE FIXES
→ REQUEST REQUIRED APPROVALS THROUGH DAILY-DEV
→ IMPLEMENT THE APPROVED SMALLEST COHERENT FIX
→ REMOVE DIAGNOSTIC CHANGES
→ REPLAY THE ORIGINAL FAILURE PATH
→ CHECK DIRECTLY AFFECTED REGRESSIONS
→ RUN APPLICABLE QUALITY GATES
→ RETURN RESULT TO DAILY-DEV
```

## Reproduction and failure evidence

Reproduce the failure when the available environment makes it feasible.
Otherwise use concrete alternative evidence. A developer description alone is
not proof that the failure path is established.

```yaml
reproduction:
  status: reproduced | evidence-backed | not-established
  expected_behavior:
  actual_behavior:
  steps_or_conditions: []
  evidence: []
  environment_limitations: []
```

Valid evidence may include a stack trace, existing failing test, runtime or
console error, state transition, caller/consumer trace, malformed payload, or a
static causal path whose preconditions are verified.

- `reproduced`: the failure is observed directly.
- `evidence-backed`: direct execution is unavailable, but the failure path is
  supported by concrete evidence.
- `not-established`: evidence is insufficient; return `BLOCKED`.

For multiple symptoms, reproduce and trace them separately. Group symptoms only
when evidence shows a shared causal chain. Independent symptoms require an
updated scope or task split by `daily-dev`.

## Investigation boundary

Begin with the failure surface, directly affected flow, and nearest consumers:

- implementation where the failure appears;
- direct callers and event sources;
- service, store, state, template, or style involved;
- nearest consumers and existing focused tests;
- objective configuration that controls the flow.

Expand read-only investigation only when evidence leads outside the current
boundary. Record the evidence and discovered files or modules before editing.

```yaml
scope_expansion:
  trigger_evidence: []
  discovered_root_cause:
  additional_files_or_modules: []
  ownership_changed: false
  risk_status: none | preliminary | confirmed
  next_action: continue-bugfix | reroute | request-approval
```

Continue in `bugfix` only when the discovered work still corrects the same
existing behavior, preserves acceptance, remains in the directly affected flow,
and triggers no core approval condition. Otherwise return to `daily-dev`.

Similar code patterns MAY be inspected read-only. Classify each occurrence as
impacted or not impacted. Do not repair additional occurrences without a
specific scope proposal and developer approval.

## Root-cause contract

A fix requires either a confirmed root cause or a strong causal hypothesis with
verified supporting evidence.

```yaml
root_cause:
  status: confirmed | strong-hypothesis | disproved
  hypothesis:
  supporting_evidence: []
  competing_explanations: []
  validation_method:
```

A strong hypothesis MUST explain the failure path, exclude important competing
causes, and make a testable prediction:

```text
IF the hypothesis is correct
→ changing X removes failure Y
→ while preserving behavior Z
```

If implementation or validation disproves the hypothesis, stop patching the
symptom, preserve valid evidence, and return to investigation. Trial-and-error
candidate patching is prohibited.

## Diagnostic instrumentation

Read-only investigation is preferred. When it is insufficient, bounded temporary instrumentation MAY be used to test one named hypothesis.

```yaml
diagnostic_edit:
  purpose:
  hypothesis_tested:
  allowed_files: []
  expected_signal:
  removal_required: true
```

Allowed examples include local temporary logs, assertions, state inspection, or
narrow diagnostic flags that do not change the production contract.

Instrumentation MUST NOT collect secrets, credentials, authorization headers,
session data, sensitive personal data, or unnecessary full payloads. It MUST NOT
send diagnostic data to external services.

Instrumentation with persistent side effects, external calls, auth/security
impact, payment impact, meaningful timing changes, or use in a production-like
environment requires return to `daily-dev` for risk review before execution.
Diagnostic code, logs, flags, and temporary assertions MUST be removed before
completion.

## Destructive and external-code boundaries

Do not perform destructive or irreversible reproduction, including real data
deletion, payment, permission mutation, production write, or external side
effect. Stop and return `HANDOFF_REQUIRED` with exact developer-run verification
steps.

Do not edit generated, vendor, or third-party code. When the causal failure is
owned by such code, record the evidence and return `BLOCKED` to `daily-dev` with
the owning generator, package, or upstream action when known. A generator,
schema, dependency, or integration workaround requires a separately routed task.

## Candidate fixes

Compare viable fixes by:

1. correctness against the causal mechanism;
2. preservation of unrelated behavior and public contracts;
3. smallest coherent affected scope;
4. compatibility with installed versions and repository facts;
5. maintainability and removal of unnecessary complexity;
6. strength and cost of verification.

The fewest changed lines are not automatically the smallest safe fix. Do not
prefer a newer framework API merely because it is newer.

```yaml
candidate_fix:
  option:
  correctness:
  affected_scope:
  compatibility_risk:
  maintainability:
  assumptions: []
  rejected_reason:
```

A local cleanup MAY be included only when needed for a correct maintainable fix
inside the affected flow. A module-wide preventative refactor requires:

- evidence that a local fix is insufficient or likely to recur;
- full module and consumer analysis;
- local, bounded, and module-refactor alternatives;
- affected files, behavior impact, risks, and validation plan;
- explicit developer approval through `daily-dev`.

Generic approval such as "refactor as needed" authorizes proposal development,
not implementation. Approval is valid only for the concrete boundary shown to
the developer. New scope or risk requires new approval.

## Specialized causal cases

### Intermittent and timing failures

A single post-fix PASS is sufficient only when causal evidence identifies the
intermittency mechanism, the fix directly removes it, important competing causes
are excluded, and the observed result matches the prediction made before
validation. Otherwise report residual uncertainty.

Treat a bug that disappears under logging or a breakpoint as timing evidence.
Investigate initialization, ordering, subscriptions, cancellation, duplicate
requests, stale responses, lifecycle teardown, and shared mutable state.
Arbitrary delay, timeout increase, sleep, or retry without a defined condition
MUST NOT be used as the fix.

For stale async responses, cancel superseded work or guard updates with request
identity/version. The latest accepted state must not be overwritten by an older
response.

### Browser and breakpoint failures

Collect browser, version, OS, device, viewport, computed-style, DOM, and state
evidence. Preserve behavior in unaffected environments. Without the target
environment, return `HANDOFF_REQUIRED` when strong evidence supports the fix;
return `BLOCKED` when evidence is insufficient.

Prefer a standards-based root-cause fix. Use a browser-specific workaround only
when the standard fix is not feasible, the condition is narrowly targeted, the
maintenance debt and removal condition are recorded, and broader risk gates are
satisfied. Prefer feature detection over user-agent sniffing.

### API and production-data mismatches

Determine the authoritative API contract and ownership. A local compatibility
guard is allowed only when expected behavior is clear, the guard is located at
the integration boundary, and user-visible behavior remains unchanged. Shared
schema changes, business-default guesses, or broad multi-consumer work return to
`daily-dev`.

For production-only data, identify the minimum failure characteristics and use
sanitized synthetic data. Never request or store production dumps, credentials,
or sensitive payloads. If safe reproduction remains unavailable, return
`HANDOFF_REQUIRED` with exact developer verification steps.

### User-visible loading and error states

A fix MAY correct loading, retry, error, empty, or success state only to restore
the accepted contract. Adding new retry behavior, new UI states, changed error
copy or timing, or a new recovery interaction is behavior change and must return
to `daily-dev`.

## Tests and validation

Testing and validation policy belongs to `quality-gates.md`.

When no existing regression test covers a stable reproducible failure, propose
the smallest useful regression test. Do not create or modify tests without
explicit developer approval. Test approval is scoped to the presented location,
scenario, assertion, and maintenance implications.

After implementation:

```text
REPLAY ORIGINAL FAILURE OR EVIDENCE PATH
→ CONFIRM EXPECTED BEHAVIOR
→ CHECK DIRECTLY AFFECTED CONSUMERS AND REGRESSIONS
→ RUN APPLICABLE QUALITY GATES
```

Build, lint, typecheck, or code inspection does not replace original-path
verification. Evidence made stale by a later edit must be rerun.

For each in-scope failure, use at most two targeted correction-and-rerun cycles
as defined by `quality-gates.md`. Each cycle must revise the hypothesis, make one
targeted correction, and replay relevant validation. After two failed cycles,
return to `daily-dev` to reassess classification, scope, risk, and acceptance. If
routing remains valid, return `BLOCKED`.

Existing tests that conflict with the reported expectation create an acceptance
conflict. Stop editing and return to `daily-dev` to resolve the authoritative
source before changing production code or tests.

## Exit states and completion

Return one of:

- `completed`: the causal failure and accepted behavior are fully verified.
- `approval-required`: a concrete proposal awaits developer approval.
- `handoff-required`: implementation or investigation is complete, but the
  developer must perform a specific safe validation step unavailable to the
  agent.
- `blocked`: evidence, ownership, risk, or validation cannot be resolved safely.

`HANDOFF_REQUIRED` must contain exact steps, required environment or access,
expected result, and remaining uncertainty. Do not claim the bug is fixed when
the original runtime path is `NOT RUN`.

Completion requires all of the following:

- root cause is addressed;
- original failure path is `PASS`;
- affected behavior and nearest consumers are preserved;
- diagnostic changes are removed;
- applicable current quality gates are complete;
- no ambiguity, approval, blocker, or secondary ownership remains;
- remaining risks and limitations are explicitly reported.

Use [`templates/bugfix-result.md`](templates/bugfix-result.md) for the return
contract. `daily-dev` owns the final repository report and task exit state.

## Repository safety

`bugfix` MUST NOT execute Git write operations. The developer owns staging,
commits, branches, pushes, merges, rebases, tags, and pull-request creation.
