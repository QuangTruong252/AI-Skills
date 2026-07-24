# Auditing Frontend Structure

A report-only workflow for Angular template and component SCSS structure. It
finds wrapper weight, duplication, dead or unsafe selectors, and over-eager
abstractions without editing source.

`daily-dev` routes and owns the whole task. This package owns only the bounded
structure audit and returns findings to `daily-dev`.

## Package

```text
auditing-frontend-structure/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines executable workflow policy.

## Activation

**Status: Active** when repository `AGENTS.md` routes structure-audit work to
`.agents/skills/auditing-frontend-structure/SKILL.md` through `daily-dev`.

Use it for:

- template/SCSS structure audit without implementation;
- secondary review after `figma-to-ui` or frontend `feature-change` when
  structure, reuse, or wrapper weight is in question.

Do not use it for:

- implementing findings;
- business-logic review as the primary outcome;
- unbounded repository-wide redesign.

## Core principles

- Report-only: no source or Git mutation.
- Smallest structure that preserves semantics, behavior, fidelity, and rules.
- Evidence before `DELETE`, `MERGE`, or shared abstraction proposals.
- `KEEP` when attractive DRY increases total concepts.
- Persist reports only when an active task artifact exists or the developer
  requests persistence.

## Canonical ownership

| Owner | Responsibility |
| --- | --- |
| `AGENTS.md` | Routing and precedence |
| `core.md` | Scope, approval, inventory validity, shared impact, safety |
| Domain rules | Angular and SCSS implementation policy |
| `quality-gates.md` | Validation and completion evidence |
| `daily-dev` | Whole-task ownership and final route |
| `auditing-frontend-structure` | Bounded structure findings and return payload |

## Validation

Run from the package directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Then manually exercise `tests/pressure-scenarios.md` in the target coding-agent
environment.
