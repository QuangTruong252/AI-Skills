---
name: feature-change
description: Use when a repository task intentionally introduces new behavior, changes accepted behavior, adds acceptance criteria, extends an existing workflow, or changes a business rule and the work must remain traceable, compatible, scoped, and verifiable.
---

# Feature Change

## Role

`feature-change` is the primary workflow for intentional new or changed
repository behavior. It converts authoritative requirements into traceable
acceptance criteria, discovers the directly affected flow, compares coherent
designs, implements only the approved boundary, and returns current evidence to
`daily-dev`.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and instruction precedence.
- [`core.md`](../../rules/core.md): scope, approval, shared or public contracts,
  conflicts, security, destructive changes, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): testing permission,
  correction limits, validation evidence, completion, and final reporting.
- Applicable domain rules such as [`angular.md`](../../rules/angular.md) and
  [`scss.md`](../../rules/scss.md).

This workflow is self-contained and does not depend on another workflow
framework.

## Activation and ownership

Use this skill only when `daily-dev` routes a task whose dominant outcome is new
or intentionally changed behavior. Examples include:

- a capability that did not previously exist;
- a deliberate change to existing user-visible behavior;
- new acceptance criteria, state, input, output, interaction, or business rule;
- an extension of an existing workflow;
- a reported "bug" whose expected behavior never existed.

Do not use it merely because implementation is large. Return the task to
`daily-dev` when existing accepted behavior is failing, Figma is the primary
acceptance source, or the task is evaluation without implementation.

`daily-dev` retains whole-task ownership. `feature-change` MUST NOT reroute
itself, invoke another task workflow, alter the approved boundary, or declare the
whole repository task complete.

## Intake gates

Begin bounded discovery with the minimum available context:

```yaml
feature_intake:
  requested_behavior:
  initial_affected_area:
  current_behavior:
  motivation:
  acceptance_criteria: []
  affected_users_or_roles: []
  constraints: []
  source_of_truth: []
  initial_scope: []
```

Before solution design, establish:

- current and requested behavior;
- authoritative source and acceptance criteria;
- affected users or roles when behavior differs by role;
- material constraints and affected scope.

Before implementation, establish:

- selected design and approved implementation boundary;
- acceptance-to-scope and acceptance-to-validation mappings;
- compatibility and migration decisions when applicable;
- resolution of every applicable canonical gate.

Missing context does not block bounded discovery when repository evidence can
resolve it. Return `WAITING_FOR_CLARIFICATION` before design or implementation
when missing information affects behavior, contract, acceptance, compatibility,
role semantics, source of truth, or implementation scope.

## Workflow

```text
INTAKE FROM DAILY-DEV
→ NORMALIZE FEATURE INTAKE
→ BOUNDED DISCOVERY
→ REQUIREMENT, ACCEPTANCE, AND SOURCE CHECK
    ↳ ambiguity or conflict
      → RETURN WAITING_FOR_CLARIFICATION
    ↳ new evidence
      → UPDATE INTAKE
→ MAP ACCEPTANCE CRITERIA
→ ANALYZE IMPACT, COMPATIBILITY, AND PRELIMINARY RISK
    ↳ insufficient evidence
      → CONTINUE BOUNDED DISCOVERY
    ↳ CANONICAL GATE CONFIRMED
      → RETURN TO DAILY-DEV
→ COMPARE CANDIDATE DESIGNS WHEN MATERIAL TRADE-OFFS EXIST
→ SELECT THE VALID OR APPROVED SMALLEST COHERENT DESIGN
→ IMPLEMENT THE APPROVED BOUNDARY
    ↳ requirement changes
      → SAFE CHECKPOINT
      → INVALIDATION MAP
      → RETURN TO REQUIREMENT CHECK
    ↳ scope, ownership, or risk changes
      → RETURN TO DAILY-DEV
→ MAP ACCEPTANCE TO CURRENT VALIDATION EVIDENCE
→ APPLY QUALITY-GATES
→ RETURN FEATURE-CHANGE RESULT TO DAILY-DEV
```

There are no workflow lanes. Risk is a state, not a separate workflow.
Uncertainty alone is not approval. Preliminary risk permits bounded read-only
investigation; confirmed risk returns to `daily-dev` with an impact packet for
the applicable `core.md` gate.

## Requirements and acceptance

### Source kinds

Classify every criterion as:

- `explicit`: stated directly by an authoritative source;
- `derived`: follows directly from authoritative statements without choosing
  new product behavior;
- `assumption`: fills an unspecified behavior or contract decision.

An assumption MUST NOT authorize implementation. Derived acceptance is allowed
only when supporting evidence is recorded, no equally valid alternative exists,
and no material product decision is introduced.

```yaml
acceptance_criterion:
  id:
  statement:
  source:
    kind: explicit | derived
    type: developer_instruction | product_spec | figma | contract | other
    reference:
    evidence: []
    supersedes: []
  affected_behavior:
  affected_users_or_roles: []
  implementation_scope:
    files_or_components: []
    contracts: []
    states_or_flows: []
  validation:
    strategy:
    required_environment:
    status: PASS | FAIL | NOT RUN
    evidence: []
  dependencies: []
  notes:
```

Use one criterion for one independently observable outcome. Details that jointly
define one outcome may be sub-checks. Do not combine business logic, visual
behavior, and public contract changes into one generic claim.

### Clarification and source conflicts

When ambiguity affects behavior, contract, acceptance, compatibility, or scope:

1. perform bounded discovery first;
2. collect every currently known material ambiguity;
3. return one clarification batch through `daily-dev`;
4. preserve answered questions and ask only what remains unresolved;
5. do not design or implement speculative defaults.

Apply repository precedence before declaring a source conflict. When two
apparently authoritative sources remain inconsistent, record the exact behavior
difference and return `WAITING_FOR_CLARIFICATION`. Existing tests and
implementation are evidence, not automatic product authority.

When a developer instruction conflicts with a current authoritative source,
confirm that the instruction intentionally supersedes it. After confirmation,
use the developer instruction as the current acceptance source, record the stale
source, and report the documentation follow-up without editing documents outside
the approved scope.

## Bounded discovery

Inspect only what is required to understand the feature and its directly
affected behavior:

- objective repository configuration and installed capabilities;
- the complete current affected flow;
- direct callers, consumers, state, services, templates, and styles;
- existing inputs, outputs, events, URLs, schemas, and persistence;
- relevant tests and design references;
- reusable components, services, stores, utilities, and local patterns.

Discovery is complete when the agent can explain current behavior, map each
acceptance criterion to affected scope, define a coherent design boundary,
identify material consumer and contract impact, determine whether a canonical
gate may apply, and define a feasible validation strategy.

Expand read-only discovery only when evidence reveals a direct dependency,
shared contract, external owner, unresolved source of truth, compatibility
requirement, or validation path outside the current boundary. Similar code may
be inspected as evidence, but similarity alone is not permission to standardize
or edit it.

```yaml
scope_discovery:
  current_flow: []
  direct_consumers: []
  objective_configuration: []
  existing_contracts: []
  reusable_capabilities: []
  similar_but_out_of_scope: []
  expansion_evidence: []
```

## Impact analysis and canonical handoff

`feature-change` detects feature-specific triggers and prepares evidence. It
does not reproduce the approval rules from `core.md`.

Return to `daily-dev` before editing when discovery confirms a changed approval,
ownership, or routing boundary, including material shared or public contracts,
shared state or configuration, API or persistence schemas, migrations,
security-sensitive paths, controlled rollout infrastructure, dependency changes,
destructive operations, or broader consumer scope.

```yaml
canonical_gate_handoff:
  trigger:
  current_behavior_or_contract:
  requested_behavior_or_contract:
  evidence: []
  affected_scope: []
  direct_consumers: []
  compatibility_options: []
  migration_options: []
  candidate_designs: []
  validation_strategy: []
  requested_decision:
  return_to: daily-dev
```

Initial developer scope is not automatic permission to edit required dependencies
outside it. Record why additional scope is necessary and return to `daily-dev`
before editing beyond an explicit boundary. Conversely, do not omit a required
direct consumer change merely to keep the diff small.

## Candidate design

Always record the selected design. Compare multiple designs only when material
trade-offs exist in scope, contracts, reuse, state ownership, compatibility,
migration, dependencies, configuration, or risk.

```yaml
candidate_design:
  option:
  behavior_supported: []
  affected_scope: []
  reused_capabilities: []
  new_capabilities: []
  compatibility:
  migration_required: false
  risks: []
  validation_strategy: []
  rejected_reason:
```

Prefer, in order:

1. complete support for mapped acceptance;
2. reuse of suitable installed or repository capabilities;
3. preservation of unrelated behavior and supported contracts;
4. the smallest coherent design, not the fewest lines;
5. compatibility with objective repository facts;
6. clear ownership and maintainability;
7. strong, feasible verification.

Do not invent artificial alternatives. A single design is acceptable when
bounded discovery finds one coherent solution and the rationale is recorded.

### Reuse, abstraction, and state ownership

Evaluate behavioral cohesion, semantics, ownership, lifecycle, consumer impact,
contract clarity, and validation cost before extending a shared capability or
creating a new one.

- Extend an existing capability when it retains one coherent responsibility and
  explicit non-ambiguous contracts.
- Prefer a local component or bounded composition when state models or
  interaction semantics materially diverge.
- Create a shared abstraction only for the same named rule with shared ownership
  and expected change coupling.
- Keep small duplication when similarity is incidental or future behavior may
  diverge.
- Use derived state or a one-directional adapter when shared state remains the
  authoritative source.

Do not duplicate authoritative state to avoid approval, introduce unclear
bidirectional synchronization, or change shared state for architectural purity.

## Implementation boundary

Implement only the selected valid or approved design. Internal shared logic may
change when it is required for the feature and preserved behavior is separately
traced and verified. A touched file is not blanket refactor scope.

Local cleanup is allowed only when necessary for correctness, removes dead code
created by the feature, prevents conflicting logic in the affected flow, or
keeps the selected design maintainable. Record unrelated cleanup opportunities
without implementing them.

Mandatory domain rules override conflicting legacy patterns. Apply mandatory
rules to the changed flow and record legacy divergence; do not migrate unrelated
legacy consumers without approved scope.

### Requirement changes during implementation

When acceptance changes:

1. stop at a safe file-based checkpoint;
2. preserve current work and evidence;
3. update acceptance criteria;
4. create an invalidation map;
5. reassess scope, compatibility, migration, risk, and validation;
6. return to `daily-dev` when the approval basis changes.

```yaml
invalidation_map:
  reusable: []
  requires_modification: []
  must_be_removed: []
  newly_required: []
  validation_invalidated: []
```

Do not append behavior to stale acceptance, rewrite everything by default, or
reuse evidence invalidated by the requirement change.

If later discovery finds a better design, continue without renewed approval only
when the change is an equivalent internal implementation and does not alter
scope, contract, acceptance, risk, or the original approval basis.

## Conditional subflows

Activate these subflows only when impact analysis finds their trigger.

### Compatibility

Use when supported consumers, clients, workflows, or legacy behavior must remain.
Record affected consumers, supported behaviors, selection semantics, ownership,
validation, and lifecycle.

A staged migration must preserve one authoritative rule, explicitly isolate
legacy behavior, identify migrated and unmigrated consumers, and define follow-up
ownership. Temporary compatibility requires an owner and removal condition; a
permanent compatibility layer must be redesigned as an explicit supported
contract rather than retained as a temporary fallback.

Supported client lifecycle is part of the removal condition. Repository search
alone does not prove external clients no longer exist.

### Migration and persistence

Use when persisted schemas change, previously valid state becomes invalid, data
transformation or reset is required, or rollback depends on old data.

Record current and target schemas, affected data, read and write consumers,
conversion options, user-visible consequences, data-loss risk, rollback, and
validation. Do not infer user intent, truncate, reset, or reinterpret persisted
data without confirmed acceptance.

Legacy data may remain readable under an explicit compatibility state. Preserve
untouched legacy values only when persistence semantics can do so without
serializing them through the new contract. Client-controlled flags MUST NOT grant
business-validation or authorization bypass eligibility.

Destructive or irreversible real-data execution is never performed by this
workflow. Apply the canonical safety path through `daily-dev` and provide safe
dry-run evidence and exact developer-run steps.

### Feature flags and controlled rollout

Use when acceptance requires limited exposure, rollback without redeployment, or
hiding incomplete dependencies. Inspect existing flag capabilities first.

Do not overload a flag whose capability, target users, environment, rollback, or
cleanup lifecycle differs. Do not introduce custom flag infrastructure or a new
dependency automatically. Present a concrete proposal and wait for explicit
developer instruction plus every applicable canonical gate.

### API, authorization, and security boundaries

Determine authoritative API semantics and ownership. Do not invent business
mappings, omit fields under unconfirmed update semantics, or use mocks as
end-to-end evidence.

Frontend role visibility and guards may complete an explicitly bounded frontend
scope, but must be reported as frontend controls, not backend authorization or
full-system security. If a security-unsafe path is directly used by the feature,
stop before implementation and return a minimal non-sensitive impact report to
`daily-dev`.

Do not inspect, copy, or preserve secrets, credentials, session data, sensitive
personal data, or unnecessary full production payloads. Production-like
telemetry or instrumentation requires canonical risk handling before
implementation. Existing unsafe logging is not permission to consume it.

## UI, Figma, and secondary workflows

When product behavior is the primary acceptance source and Figma supplies visual
acceptance, `feature-change` remains primary and `figma-to-ui` may be a bounded
secondary workflow routed only by `daily-dev`.

Separate behavioral criteria from layout, spacing, visual states, and responsive
presentation. Do not let visual references override confirmed product behavior.
If Figma becomes the primary acceptance source, return to `daily-dev` for routing
review.

Reuse existing loading, error, empty, recovery, responsive, and mobile behavior
only when semantics remain complete and compatible. New user-visible states,
copy, retry semantics, confirmation behavior, or mobile interaction require
explicit acceptance.

Preserve mandatory accessibility in the directly affected flow, including
semantic interaction, keyboard access, accessible names, visible focus, and
changed-state announcements. Record unrelated accessibility findings separately.
Prefer standards-based browser behavior and feature detection. A browser-specific
workaround requires evidence, narrow targeting, documented debt, a removal
condition, and the applicable canonical gate.

## Tests and validation

Testing and completion policy belongs to `quality-gates.md`.

Before implementation, map every acceptance criterion to a feasible evidence
path: behavior, validation layer, required environment, observable expected
result, and known limitation. Static checks do not substitute for runtime,
visual, browser, device, or integration evidence.

When a stable scenario has material regression risk, propose the smallest
sufficient test with location, setup, scenario, assertions, covered risk,
maintenance impact, and command. Do not create, modify, or run tests without the
permission required by repository policy. Preserve the repository exception for
default test artifacts created by approved framework generation commands.

Choose the lowest test layer that fully proves the acceptance claim. Use a
higher layer only for distinct DOM, integration, routing, authorization, or
system-boundary risk.

Known unavailable validation may allow implementation when design safety is
already established. Record the dependency before implementation, run the
strongest available checks, and return `HANDOFF_REQUIRED` with exact steps and
expected evidence. If target evidence is required to choose a safe design, stop
before implementation.

Follow `quality-gates.md` for validation statuses, correction limits, unrelated
failures, evidence freshness, and completion. A `NOT RUN` required criterion is
not a remaining risk and is never treated as `PASS`.

## Result and return

Use [`templates/feature-change-result.md`](templates/feature-change-result.md).
The workflow reports its bounded result separately from its recommendation for
the whole task:

```yaml
feature_change_result:
  workflow_scope_result:
    status: completed | approval-required | blocked | handoff-required
  recommended_task_state:
    status: COMPLETED | WAITING_FOR_CLARIFICATION | APPROVAL_REQUIRED | BLOCKED | HANDOFF_REQUIRED
  return_to: daily-dev
```

`workflow_scope_result: completed` means only the assigned `feature-change`
scope is verified. It does not close the repository task while secondary
workflows, approvals, handoffs, blockers, or required acceptance remain.
daily-dev owns the final task exit state and repository report.

## Repository safety

Do not edit generated, vendor, or third-party output. Identify the generator,
schema, package, template, or upstream owner and return the evidence to
`daily-dev`.

Prefer installed and repository-native capabilities. A new or upgraded dependency is proposal-only and MUST NOT be implemented unless the developer
explicitly requests the concrete dependency change and applicable canonical
gates are resolved.

`feature-change` MUST NOT execute Git write operations. The developer owns
staging, commits, branches, pushes, merges, rebases, tags, and pull-request
creation. Report changed files, evidence, risks, and an optional suggested commit
message without executing it.
