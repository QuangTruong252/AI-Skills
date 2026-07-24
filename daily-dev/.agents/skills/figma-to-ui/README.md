# Figma to UI

A repository-aware workflow for converting an approved Figma visual contract into Angular UI without inventing product behavior, bypassing design-system boundaries, changing shared consumers silently, or claiming visual success without current evidence.

## Package

```text
figma-to-ui/
├── SKILL.md
├── README.md
├── templates/
│   └── figma-to-ui-result.md
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines executable workflow policy. The README explains the package, the result template standardizes the bounded return to `daily-dev`, pressure scenarios preserve approved edge cases, and the validator checks structure and policy boundaries.

## Activation

**Status: Active.** Repository `AGENTS.md` routes Figma-primary visual work through `daily-dev` to `.agents/skills/figma-to-ui/SKILL.md`.

Active `AGENTS.md` assigns testing and completion policy only to `.agents/rules/quality-gates.md`.

## Use it for

- Figma-primary screen, component, modal, or page implementation.
- Bounded visual implementation delegated by `daily-dev` from another primary workflow.
- Mapping Figma components, variables, states, assets, constraints, and viewports to repository capabilities.
- Resolving visual differences through one scope-level UI authorization and one material-delta batch.

## Do not use it for

- Product behavior changes whose primary source is a requirement rather than Figma.
- Existing-behavior failures whose dominant outcome is a bug fix.
- Review-only work without implementation.
- General repository maintenance.
- Unbounded design-system redesign.

## Core principles

- Figma owns the approved visual contract, not business behavior.
- Developer instruction owns objective, scope, behavior, and intentional UI change.
- Objective repository facts own technical and runtime constraints.
- Authorize an existing UI once per Figma source identity and bounded scope.
- Continue exact and evidence-backed equivalent mappings; stop for ambiguous or missing decisions.
- Reuse components, tokens, patterns, and assets by semantic contract rather than visual similarity alone.
- Apply inventory validity before trusting reference snapshots.
- Infer responsive behavior only from supplied evidence and repository APIs.
- Accessibility cannot be traded for pixel fidelity.
- Return canonical approvals, shared-consumer impact, blockers, and handoffs to `daily-dev`.
- After material template/SCSS work, `daily-dev` MAY add `auditing-frontend-structure` as a report-only secondary.
- Never treat build or test success as proof of visual correctness.

## Canonical ownership

| Owner | Responsibility |
| --- | --- |
| `AGENTS.md` | Routing and precedence |
| `core.md` | Scope, approval, shared/public impact, conflicts, missing capabilities, and safety |
| Domain rules | Angular, SCSS, tokens, accessibility, and repository implementation requirements |
| `quality-gates.md` | Test permission, validation, retries, evidence, completion, and reporting |
| `daily-dev` | Whole-task ownership and final task state |
| `figma-to-ui` | Source normalization, UI authorization, material deltas, mapping, bounded visual implementation, and return payload |

## Result model

The workflow result separates completion of the assigned visual scope from the final repository task state. See [`templates/figma-to-ui-result.md`](templates/figma-to-ui-result.md).

## Validation

Run from the package directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Then execute all manual scenarios in `tests/pressure-scenarios.md` in the target coding-agent environments.
