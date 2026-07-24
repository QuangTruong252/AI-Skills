# daily-dev agent pack

Policy-driven multi-skill agent operating system for Angular frontend work across
Codex, Claude, Gemini, and similar coding agents.

## Entry point

1. Read [`AGENTS.md`](./AGENTS.md) first.
2. Follow only sources in the active instruction graph.
3. Let `daily-dev` triage and route specialized workflows.

## Layout

```text
AGENTS.md                 # router, precedence, inventory validity
.agents/
  rules/                  # core, angular, scss, quality-gates
  references/             # token/component/pattern inventory snapshots
  skills/
    daily-dev/            # orchestrator (active)
    bugfix/               # existing-behavior failures (active)
    feature-change/       # intentional new/changed behavior (active)
    figma-to-ui/          # Figma-primary visual work (active)
    code-review/          # evaluation without implementation (active)
    auditing-frontend-structure/  # report-only structure audit (active)
scripts/
  validate-all.py         # pack + package validators
```

## Active workflows

| Outcome | Route |
| --- | --- |
| Any repository task | `daily-dev` |
| Existing behavior broken | `daily-dev` → `bugfix` |
| New or changed behavior | `daily-dev` → `feature-change` |
| Figma is visual acceptance | `daily-dev` → `figma-to-ui` |
| Evaluation only | `daily-dev` → `code-review` |
| Template/SCSS structure audit | `daily-dev` → `auditing-frontend-structure` |
| Internal docs/skills maintenance | `daily-dev` |

`auditing-frontend-structure` may also run as a report-only secondary after
frontend implementation when structure or reuse is in question.

## Inventory snapshots

`.agents/references/*` are inventory snapshots of a target Angular codebase.
Before reuse, agents must verify recorded source paths exist and prefer live
source. See **Inventory validity** in `AGENTS.md` and `core.md`.

## Validation

Run all package validators and pack consistency checks:

```text
python scripts/validate-all.py
```

Run one package:

```text
python .agents/skills/<skill>/tests/validate_skill.py
```

Validators check structure, routing consistency, activation docs, inventory
gates, and minimum pressure-scenario counts. They do not replace manual
pressure-scenario execution in a target coding agent.

## Safety

- Git write operations are non-delegable to the developer.
- High-risk and shared-contract changes require explicit approval via `core.md`.
- No workflow may redefine canonical policy owned by `AGENTS.md`, `core.md`, or
  `quality-gates.md`.
