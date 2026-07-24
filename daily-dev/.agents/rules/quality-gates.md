# Quality Gates

## Applicability

This file is the only canonical testing, validation, retry, completion-evidence,
and final-report policy. Apply it to every repository change. Other rules and
skills may link here but MUST NOT redefine or bypass these requirements.

## Discover real commands

Before claiming completion, the agent MUST inspect `package.json`, workspace
configuration, TypeScript configuration, and repository documentation and use
real repository commands.

- Use the package manager and script names declared by the repository.
- Prefer repository scripts over equivalent ad hoc commands.
- Do not claim a command exists until it is confirmed.
- Record the exact command used and its result.

## Required static validation

For code changes, run every configured applicable gate:

- Typecheck when a dedicated command or TypeScript project exists.
- Lint when configured.
- Build.

A successful lint does not prove typecheck or build success. A successful build
does not prove required runtime behavior.

For documentation-only changes, run configured Markdown formatting or linting
and link/path checks. Application build and tests MAY be `NOT RUN` only when no
application, workspace, dependency, or executable configuration changed; state
that reason explicitly.

Static searches MAY support validation, but a regex match is a review candidate,
not proof of correctness by itself.

## Existing-test policy

Run focused existing tests when any condition is true:

- Business logic changes.
- Data transformation changes.
- State transitions or branching behavior change.
- A bug fix modifies a previously failing behavioral path.
- A bug fix changes code used by multiple callers or consumers.
- A shared implementation changes internally.

Testing boundaries:

- Do not create, extend, refactor, or delete tests unless the developer
  explicitly requests test changes.
- Empty or placeholder `.spec.ts` files produced by a generator count as newly
  created tests.
- Use an existing no-test generator option or create implementation files
  without a spec.
- Do not change workspace generator defaults merely to suppress specs; that is a
  configuration change governed by
  [`core.md#high-risk-changes`](./core.md#high-risk-changes).
- If repository policy requires a companion spec, report the conflict and
  request a developer decision.
- Do not delete existing project-required tests merely to satisfy this policy.

When tests are required but cannot run, report `NOT RUN` with the exact
environment, dependency, fixture, or access blocker.

## Runtime and UI validation

Run the checks below when the touched behavior meets the stated condition:

- Exercise real interaction behavior when event handlers, outputs, forms, state
  transitions, visibility, navigation, or user actions change.
- Inspect browser console and runtime errors when the application can be
  launched in the available environment.
- Verify keyboard behavior, focus order, focus visibility, accessible names,
  and relevant ARIA when interactive elements, semantic elements, DOM order,
  focus management, or accessibility attributes change.
- Verify loading, empty, disabled, validation, success, and error states when the
  touched code can enter those states.
- Verify mobile, intermediate, and desktop ranges when layout, dimensions,
  visibility, order, breakpoint behavior, or responsive tokens change.
- Verify every supported theme mode when theme-aware tokens, surfaces, borders,
  text colors, icons, effects, or shadows change.
- Compare against the exact approved design/source when implementing or changing
  a design-driven UI.

A failed or unavailable runtime check MUST be reported explicitly. The agent
MUST NOT infer runtime success from static validation.

## Validation failure handling

For each distinct validation failure whose root cause is inside the approved
task scope, the agent MAY perform at most two targeted correction-and-rerun
cycles.

Stop earlier and report the blocker when:

- The fix triggers
  [`core.md#high-risk-changes`](./core.md#high-risk-changes).
- The failure is unrelated to the task.
- The same root cause remains after two targeted correction cycles.
- Resolution requires a broad refactor, dependency/configuration change, or
  unavailable environment access.
- A correction would expand the approved task boundary.

A renamed or shifted form of the same error does not reset the retry count. A
new error is distinct only when it has a materially different root cause.

The report MUST include attempted commands, concise failure evidence,
corrections attempted, and the remaining blocker or developer decision.

## Completion claims

The agent MUST NOT state or imply that a check passed unless fresh command or
runtime evidence from the current task proves it.

- Use `PASS` only with current evidence.
- Use `FAIL` when the check ran and failed.
- Use `NOT RUN` when the check was unavailable, not configured, or not required;
  include the exact reason.
- Do not silently omit required checks.
- Completion requires verifying the requested behavior and the task acceptance
  criteria, not only obtaining a successful build.

## Final report

Every completed implementation response MUST use this structure:

```markdown
## Implementation

- Files changed:
- Behavior changed:
- Existing components, tokens, and patterns reused:
- Approved high-risk decisions:
- Exceptions and justification:

## Validation

| Check                   | Result                | Evidence or reason |
| ----------------------- | --------------------- | ------------------ |
| Typecheck               | PASS / FAIL / NOT RUN | ...                |
| Lint                    | PASS / FAIL / NOT RUN | ...                |
| Build                   | PASS / FAIL / NOT RUN | ...                |
| Existing tests          | PASS / FAIL / NOT RUN | ...                |
| Runtime/UI verification | PASS / FAIL / NOT RUN | ...                |

## Remaining risks

- None, or the exact unresolved risk and required developer decision.
```

A `SHOULD` or `SHOULD NOT` exception MUST identify the exact guidance, concrete
reason, affected files or scope, alternative considered, and resulting
maintenance or compatibility risk.
