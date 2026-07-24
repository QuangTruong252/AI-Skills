# Feature Change

A requirement- and acceptance-driven workflow for introducing intentional new
or changed repository behavior without inventing product decisions, silently
breaking consumers, expanding scope without approval, or claiming completion
without evidence.

`daily-dev` routes and owns the whole task. `feature-change` owns only its bounded
workflow. It uses `core.md` for risk, approval, shared/public contracts,
security, migrations, destructive changes, and repository safety. It uses
`quality-gates.md` for testing permission, correction limits, validation
evidence, and completion reporting.

## Package

```text
feature-change/
├── SKILL.md
├── README.md
├── templates/
│   └── feature-change-result.md
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines executable workflow policy. The README explains the
package. The result template standardizes the return to `daily-dev`. Pressure
scenarios preserve the approved edge-case decisions, and the validator checks
structure, canonical ownership boundaries, scenario coverage, and forbidden
workflow or Git behavior.

## Activation

**Status: Active.** Repository `AGENTS.md` routes intentional new or changed
behavior through `daily-dev` to `.agents/skills/feature-change/SKILL.md`.

Use it for:

- behavior that did not previously exist;
- deliberate changes to existing accepted behavior;
- new acceptance criteria, business rules, inputs, outputs, states, or
  interactions;
- extensions of an existing workflow;
- tasks called bugs when the requested behavior never existed.

Do not use it merely because a change is large. Existing-behavior failures route
to `bugfix`; Figma-primary acceptance routes to `figma-to-ui`; review-only work
routes to `code-review`.

## Core principles

- Perform bounded discovery before design.
- Ask one clarification batch for all known material ambiguity.
- Trace every acceptance criterion from source through scope and evidence.
- Treat explicit, derived, and assumed requirements differently.
- Use existing implementation as behavior evidence, not automatic authority.
- Select the smallest coherent design, not the smallest diff.
- Compare real alternatives only when material trade-offs exist.
- Expand read-only discovery only when evidence leads outside the boundary.
- Return confirmed approval, ownership, contract, migration, security, and
  dependency boundaries to `daily-dev` with concrete impact evidence.
- Do not invent API mappings, migration semantics, feature flags, authorization,
  or user-visible states.
- Separate the bounded workflow result from the whole-task exit state.
- Never mark required `NOT RUN` acceptance as complete.

## Canonical ownership

`feature-change` detects triggers and prepares evidence, but does not duplicate
canonical policy:

| Owner | Policy |
| --- | --- |
| `AGENTS.md` | Routing and instruction precedence |
| `core.md` | Scope, approval, shared/public contracts, security, destructive changes, repository safety |
| Domain rules | Angular, SCSS, accessibility, design-system, and other domain requirements |
| `quality-gates.md` | Testing permission, correction limits, validation evidence, completion and reporting |
| `daily-dev` | Whole-task ownership, routing, approval coordination, final task state |
| `feature-change` | Requirements, acceptance traceability, bounded discovery, candidate design, feature impact, implementation boundary, and return payload |

## Result model

A bounded frontend stage, migration stage, or behavior stage may be complete
while the repository task still requires another workflow or developer action.
The template therefore separates:

- `workflow_scope_result`: evidence for the assigned feature-change boundary;
- `recommended_task_state`: the state suggested to `daily-dev`;
- `return_to: daily-dev`: ownership always returns to the orchestrator.

## Validation

Run from the skill directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Expected output:

```text
VALIDATION PASSED
Validated 4 required files
Pressure scenarios: 60
```

Then execute the manual cases in `tests/pressure-scenarios.md` in each target
coding-agent environment. The validator checks document shape and policy
boundaries; it does not replace behavior testing of the agent runtime.
