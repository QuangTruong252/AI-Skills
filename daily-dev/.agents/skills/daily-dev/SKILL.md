---
name: daily-dev
description: Use when repository-aware development, debugging, review, design, implementation, maintenance, continuation, or handoff must be triaged and routed through the correct workflow.
---

# Daily Dev

## Role

`daily-dev` is the mandatory thin orchestrator for repository-related work. It
classifies the task, resolves requirement ambiguity, coordinates primary and
secondary workflows, tracks risk, and completes the task through canonical
quality gates.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and precedence.
- [`core.md`](../../rules/core.md): scope, reuse, approval gates, conflicts, and
  repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): testing, validation,
  retries, completion evidence, and final reporting.

## Activation

Use this skill for every repository-related task except a standalone explanation
that requires no repository context.

Activate it when a repository change may be required, for repository review or
debugging, feature or refactor design, Figma-to-code work, continuation or
handoff, or when repository scope is unclear.

Skip it for general knowledge, translation, rewriting, or standalone
explanations with no repository files or behavior. When uncertain, activate it
if the request names an actual repository, file, component, bug, feature,
configuration, implementation, or runtime behavior.

## State machine

```text
INTAKE
→ ACTIVATION CHECK
→ LOAD CANONICAL RULES
→ MINIMAL TRIAGE
→ CLARIFICATION GATE
→ PRELIMINARY RISK CHECK
→ ROUTE
→ TASK WORKFLOW
→ CORE APPROVAL GATE WHEN RISK IS CONFIRMED
→ IMPLEMENT OR REVIEW
→ QUALITY GATES
→ REPORT
→ REMOVE OR PRESERVE TASK ARTIFACT
```

Exit states are `COMPLETED`, `WAITING_FOR_CLARIFICATION`, `APPROVAL_REQUIRED`,
`BLOCKED`, and `HANDOFF_REQUIRED`.

## Required reading

Before routing:

1. Read `AGENTS.md`, `core.md`, and `quality-gates.md`.
2. Read only applicable domain rules and project references routed by
   `AGENTS.md` for the classified task. Apply inventory validity before trusting
   reference snapshots.
3. Inspect relevant objective configuration: installed versions, actual scripts,
   compiler or workspace configuration, schemas, and runtime constraints.
4. Inspect directly affected files and the nearest caller, consumer, or public
   surface.
5. Load a specialized skill only after this orchestrator routes to it.

## Minimal triage

Minimal triage is mandatory and bounded:

```text
READ ROUTER
→ INSPECT RELEVANT CONFIGURATION
→ INSPECT DIRECTLY AFFECTED FLOW
→ CLASSIFY TASK
→ DETECT RISK FLAGS
→ ROUTE
```

```yaml
triage:
  task_type: bugfix | feature-change | figma-to-ui | code-review | auditing-frontend-structure | repository-maintenance
  evidence: []
  risk_flags: []
  route_to: <primary workflow>
  approval_required: false
  reason: <evidence-based reason>
```

During minimal triage, MUST NOT edit code, deep-debug, design the full solution,
create a long plan or artifact, run build or tests, or request approval before a
concrete risk is identified.

Show triage only for ambiguity, risk, approval, shared-consumer impact, route
changes, or a required developer decision:

```markdown
## Triage

- Task type:
- Route:
- Risk:
- Affected scope:
- Decision required:
```

## Clarification gate

Any unresolved ambiguity affecting implementation, behavior, scope, contract,
acceptance criteria, or source of truth requires a stop.

The agent MUST collect all currently known ambiguities, ask them in one batch,
explain why each matters, and wait until all are answered. After a partial
response, show only unanswered questions and remain
`WAITING_FOR_CLARIFICATION`.

The agent MUST NOT route, implement, or substitute a recommended option while
clarification remains incomplete.

## Primary workflow selection

Choose the primary workflow from the developer's dominant outcome and acceptance
source, not from the first keyword in the prompt.

| Dominant outcome | Primary workflow |
| --- | --- |
| Existing behavior is incorrect or broken | `bugfix` |
| New or changed behavior is required | `feature-change` |
| Figma is the main acceptance source | `figma-to-ui` |
| Evaluation without implementation | `code-review` |
| Template/SCSS structure audit without implementation | `auditing-frontend-structure` |
| Internal repository docs, rules, skills, or configuration maintenance | `daily-dev` |

For `repository-maintenance`, `daily-dev` executes the generic workflow itself.
It MUST NOT use that workflow to bypass an applicable specialized skill.

## Primary and secondary ownership

A task has exactly one `primary_skill`, normally zero or one `secondary_skills`,
and at most two secondary workflows.

```yaml
routing:
  primary_skill: bugfix
  secondary_skills:
    - figma-to-ui
  ownership_reason: runtime failure is the primary outcome
  secondary_scope: implement the affected visual contract
```

`daily-dev` retains whole-task ownership. The primary workflow owns the main
objective, acceptance criteria, integration, and completion. A secondary
workflow owns only its delegated specialist scope.

Only `daily-dev` may alter routing. A secondary workflow MUST NOT invoke another
workflow or declare the whole task complete.

### Frontend structure audit routing

Route `auditing-frontend-structure` as primary when the dominant requested
outcome is a report-only template/SCSS structure audit.

Route it as a secondary workflow when a frontend implementation workflow has
produced or changed templates/SCSS and structure, reuse, wrapper weight, or
dead/duplicated styles are in question before completion. Typical primaries:

- `figma-to-ui`
- `feature-change` with material template/SCSS edits

The audit secondary is report-only: it MUST NOT edit source, MUST return
findings to the primary via `daily-dev`, and MUST NOT declare the whole task
complete. Persist the audit report only when
`working-docs/active-task.md` already exists for the task or the developer
explicitly requests persistence.

### Secondary execution boundary

A secondary workflow MAY analyze and directly implement only within:

```yaml
secondary_scope:
  workflow: figma-to-ui
  objective: <bounded specialist outcome>
  allowed_files: []
  excluded_scope: []
  return_to: <primary workflow>
```

It MUST return:

```yaml
secondary_result:
  workflow: figma-to-ui
  status: completed | approval-required | blocked
  files_changed: []
  behavior_changed: []
  validation: []
  discovered_risks: []
  scope_deviations: []
  return_to: <primary workflow>
```

## Route changes

Change the primary workflow only when new evidence proves the original
classification wrong. Preserve valid discovery, approved scope, completed work,
and validation evidence.

Always show:

```markdown
## Triage updated

- Previous route:
- New route:
- Evidence:
- Scope impact:
- Risk impact:
```

The route change itself needs no approval unless it expands scope, changes
acceptance criteria, or triggers a core approval gate.

## Risk investigation and approval

Risk has two states:

```yaml
risk:
  status: preliminary | confirmed
```

A preliminary risk may receive bounded, read-only investigation: inspect
implementation, consumers, references, contracts, configuration, and focused
diagnostic output. It MUST NOT edit files or begin speculative refactoring.

```yaml
risk_investigation:
  suspected_risk: <risk>
  evidence_inspected: []
  result: confirmed | disproved | inconclusive
  impact:
    files: []
    consumers: []
    contracts: []
  next_action: continue | request-approval | blocked
```

- `disproved`: continue the routed workflow.
- `confirmed`: return to `daily-dev`, complete impact analysis, apply the
  canonical approval gate in `core.md`, and stop.
- `inconclusive`: stop as `BLOCKED`; uncertainty is not approval.

After approval, the agent MAY make reasonable related changes without approval
per file when they are necessary for the approved objective, preserve acceptance
criteria, and add no behavior, risk category, public surface, or unrelated
consumer impact beyond the approved proposal. Anything beyond those limits
requires a new approval decision.

## Generic repository workflow

```text
INTAKE
→ LOAD CANONICAL RULES
→ MINIMAL TRIAGE
→ CLARIFICATION GATE
→ PRELIMINARY RISK CHECK
→ PLAN CHANGE
→ CORE APPROVAL GATE IF REQUIRED
→ IMPLEMENT
→ QUALITY GATES
→ REPORT
```

## Task artifact

Create `working-docs/active-task.md` only when primary and secondary workflows
are both used, approval is pending, a blocker or handoff exists, work must
survive a session or model boundary, significant completed work must be
preserved, or the developer explicitly requests persistence.

Use `templates/active-task.md`. Update it only for meaningful transitions:
route changes, completed workflows, confirmed risks, approvals, blockers,
handoffs, or session boundaries.

On completion, delete the artifact by default. Preserve it only when the
developer explicitly requests retention for handoff, audit, documentation, or
another stated purpose. Do not archive it automatically.

## Validation coordination

Validation policy belongs exclusively to `quality-gates.md`.

- Secondary workflows provide current local evidence.
- The primary workflow verifies main acceptance criteria and integration.
- `daily-dev` aggregates evidence, invalidates results made stale by later
  changes, and runs only required task-level checks still missing.
- Do not rerun a check when valid current evidence covers the final scope.

A task cannot be `COMPLETED` while required evidence is missing, acceptance
criteria are unverified, a secondary workflow has not returned ownership, or
clarification, approval, or blockers remain open.

## Repository safety and completion

The agent MUST NOT execute Git write operations. The developer owns staging,
commits, branches, pushes, merges, rebases, tags, and pull-request creation.
Read-only Git inspection is allowed under `AGENTS.md` and `core.md`.

Use the final-report structure from `quality-gates.md`. Report related scope
expansion and why it remained inside the approved objective. Remove
`working-docs/active-task.md` unless explicit retention was requested.