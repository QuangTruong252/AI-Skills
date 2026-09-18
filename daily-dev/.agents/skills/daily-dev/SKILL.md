---
name: daily-dev
description: Use when a request depends on repository files, configuration, behavior, runtime evidence, implementation, review, continuation, or handoff.
---

# Daily Dev

## Purpose

`daily-dev` is the thin orchestrator for repository-related work. It owns the
whole task, while routed workflows own only bounded specialist work.

Canonical policy remains in:

- [`AGENTS.md`](../../../AGENTS.md): bootstrap, precedence, required reading,
  routing, and delegation.
- [`core.md`](../../rules/core.md): scope, reuse, clarification, approval gates,
  conflicts, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): validation, retries,
  completion evidence, and final reporting.

Do not restate or weaken those policies here.

## Activation boundary

Activate for repository-aware implementation, debugging, review, design,
maintenance, continuation, or handoff. Skip only a standalone explanation that
needs no repository file, configuration, or runtime behavior.

## Preflight

Complete the bootstrap contract in `AGENTS.md` before task work:

```text
read AGENTS.md
-> classify observable task scope
-> select preliminary ordered route
-> build preflight receipt for that route
-> read exact mandatory sources
-> verify sources_loaded
-> confirm route
```

Do not edit, delegate, run implementation checks, or silently substitute policy
while `missing_sources` is non-empty. A missing or unusable mandatory source
sets `clarification-required` and requires a developer decision.

Keep the receipt internal unless it explains a clarification, approval,
blocker, handoff, or route decision.

## Execution model

Use this sequence:

```text
PREFLIGHT
-> ROUTE
-> BOUNDED DISCOVERY
-> CLARIFICATION OR APPROVAL GATE WHEN REQUIRED
-> PRIMARY WORK
-> OPTIONAL BOUNDED SECONDARY WORK
-> RESULT VALIDATION
-> TASK-LEVEL VALIDATION
-> REPORT
```

Routing is owned exclusively by the ordered table in `AGENTS.md`. Do not create
a second route table in this skill and do not classify from a prompt keyword
when observable behavior indicates another route.

For repository instruction, rule, skill, validator, documentation, or
configuration maintenance, execute the smallest coherent change directly under
`daily-dev`. Do not invent a catch-all maintenance workflow.

## Ownership

`daily-dev` alone may:

- choose or change the route;
- expand delegated scope;
- aggregate workflow results and validation evidence;
- decide whether evidence became stale after later changes;
- mark the whole task `completed`.

A specialized workflow may complete only its delegated scope. It MUST return
its result to `daily-dev` and MUST NOT invoke another workflow.

Parallel agents are optional. Use them only for independent, bounded work that
helps within the current session. Send the exact `scope_packet` defined by
`AGENTS.md`; copied rule summaries are not a substitute for source paths. A
subagent must independently read `AGENTS.md` and every mandatory source in the
packet, then report those paths in `sources_loaded`.

Before starting any optional secondary, extend and re-verify the preflight
receipt for that secondary's mandatory sources.

## Route changes

Change a route only when new evidence disproves the current classification.
Preserve valid discovery and current validation evidence, then reevaluate
scope, acceptance criteria, mandatory reading, and risk.

Make the change visible when it affects developer expectations:

```markdown
## Triage updated

- Previous route:
- New route:
- Evidence:
- Scope impact:
- Risk impact:
```

A route change does not itself authorize expanded scope or bypass a
clarification or approval gate.

## Canonical statuses

Use only these lower-case statuses:

| Status | Meaning |
| --- | --- |
| `in-progress` | Bounded work is active and no stop condition is open. |
| `completed` | The reported workflow scope is complete with current required evidence. |
| `clarification-required` | A missing source or unresolved decision affects scope, behavior, contract, or acceptance. |
| `approval-required` | A confirmed change requires the canonical approval gate. |
| `blocked` | Progress cannot continue with available evidence or permitted actions. |
| `handoff-required` | Work must cross a session, model, or developer boundary. |

No synonym, upper-case legacy state, or workflow-specific status is valid.

## Canonical workflow result

Every primary or secondary workflow returns this exact top-level envelope:

```yaml
workflow_result:
  workflow: <workflow-name>
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed: []
  files_changed: []
  validation: []
  open_items: []
  return_to: daily-dev
```

Rules for the envelope:

- `sources_loaded` contains exact paths actually read, including `AGENTS.md`.
- `scope_completed` describes only the workflow's bounded scope.
- `files_changed` is empty for report-only work.
- `validation` records the command or observation, outcome, and relevant scope.
- `open_items` carries unresolved decisions, approvals, blockers, deviations,
  or handoff notes.
- `return_to` is always `daily-dev`, including a primary workflow result.

Workflow-specific detail may be nested inside one of these fields. It MUST NOT
replace, rename, or add an alternative top-level result contract.

On receipt, verify every required key, allowed status, source path, delegated
boundary, and return owner. If the result is invalid, return it for correction.
Do not infer omitted fields, translate a legacy status, or mark the workflow
complete on its behalf.

## Clarification, risk, and approval

Apply the canonical gates in `core.md`.

- Aggregate all currently known clarification questions into one request.
- A partial answer keeps the task `clarification-required`; ask only the
  remaining questions.
- Preliminary risk permits bounded read-only investigation only.
- Confirmed risk returns to `daily-dev` for impact analysis and approval.
- Inconclusive risk is `blocked`, not implicit approval.

After approval, related edits are allowed only when necessary for the approved
objective and when they add no new behavior, risk category, public surface, or
unrelated consumer impact.

## Task artifact

Default: no artifact. Keep state in the current session.

Create a task artifact only when at least one condition is true:

- clarification or approval is pending;
- a blocker or handoff exists;
- work must cross a session or model boundary;
- primary and secondary work cannot be safely reconstructed from current
  context;
- the developer explicitly requests persistence.

Use:

```text
working-docs/active-task-YYYYMMDD-HHMM-<slug>.md
```

Create it from `templates/active-task.md`. Assign a unique Task ID and Created
timestamp. The Task ID MUST include second-level time plus a unique suffix; it
MUST NOT be derived from the minute-level path alone. Before creation, check
whether the target path exists. Never overwrite it: append `-02`, `-03`, and so
on to the slug until the path is unused. Before updating or deleting an
artifact, verify that its Task ID and path belong to the current task. Never use
the legacy singleton `working-docs/active-task.md`.

Update only at meaningful transitions: route change, completed workflow,
confirmed risk, approval, blocker, handoff, or session boundary. Remove the
verified task artifact after completion unless the developer requests
retention. Never archive it automatically.

When the developer requests a persisted specialist report, `daily-dev` writes
the returned content to:

```text
working-docs/reports/YYYY-MM-DD-HHMMSS-<task-id>-<report-kind>.md
```

Verify that the Task ID matches the active artifact and that the report path is
unused before writing, then link it from that artifact. A report-only workflow
never writes or links the file itself.

## Validation and completion

Validation policy belongs to `quality-gates.md`.

- Reuse current evidence that still covers final scope.
- Invalidate evidence made stale by later changes.
- Run only required checks still missing.
- Treat static pack validators as structural evidence, not proof that a model
  follows the skill.
- Record GPT/Gemini behavioral trials separately. If no fresh trial was run,
  report behavioral evidence as `NOT RUN`, never as passed.

The whole task cannot be `completed` while a mandatory source is missing, a
clarification, approval, blocker, or handoff remains open, a delegated workflow
has not returned a valid result, acceptance criteria are unverified, or required
evidence is missing.

Use the final-report structure from `quality-gates.md`. Follow the Git ownership
invariant in `AGENTS.md`.
