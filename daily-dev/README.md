# daily-dev agent pack

A lightweight repository workflow pack optimized for Codex/GPT and
Antigravity/Gemini. It makes rule loading, routing, workflow ownership, and
completion evidence explicit without requiring a workflow engine or model
adapter.

## Runtime contract

1. Read [`AGENTS.md`](./AGENTS.md) completely.
2. Select the preliminary route using the first matching ordered predicate.
3. Build an internal preflight receipt for that route.
4. Load only the exact mandatory sources selected for the task.
5. Stop and ask the developer if a mandatory source is missing or unusable.
6. Confirm the route, then return every specialist result to `daily-dev`.

`daily-dev` alone owns route changes, scope aggregation, final validation, and
whole-task completion.

## Host bootstrap prerequisite

The coding host must expose the project-root `AGENTS.md` as project
instructions. The pack cannot enforce rules in a session that never loads its
entry point. For every new Codex or Antigravity setup, confirm the preflight
reports `AGENTS.md` in `sources_loaded` before trusting behavioral results.

This pack intentionally does not duplicate policy into a Gemini-specific or
model-specific adapter. Add a thin bootstrap adapter only if real target-host
trials repeatedly show that the host cannot load `AGENTS.md` directly.

## Layout

```text
AGENTS.md                 # bootstrap, invariants, required reading, routing
.agents/
  rules/                  # core, Angular, SCSS, quality gates
  references/             # verified-on-use inventory snapshots
  skills/
    daily-dev/            # orchestrator
    bugfix/               # existing accepted behavior is broken
    feature-change/       # new or intentionally changed behavior
    figma-to-ui/          # visual-only Figma acceptance
    code-review/          # evaluation without implementation
    auditing-frontend-structure/  # report-only structure audit
scripts/
  validate-all.py         # structural and cross-pack validation
  test-validator-mutations.py     # validator regression/mutation tests
```

## Ordered routes

| Observable outcome | Route |
| --- | --- |
| Evaluation without implementation | `code-review`, or the structure audit for template/SCSS-only review |
| Internal rules, skills, docs, validators, or configuration | `daily-dev` |
| Existing accepted behavior is broken | `bugfix`; optional bounded Figma secondary for the same affected scope |
| New or intentionally changed behavior | `feature-change`; optional bounded Figma secondary |
| Visual-only work with Figma as the main source | `figma-to-ui` |
| Insufficient evidence for a safe route | `clarification-required` |
| Other repository work | `daily-dev` |

The exact predicates and precedence live only in `AGENTS.md`.

Optional secondaries are also owned there: bounded Figma acceptance for the
same bugfix/feature scope, an explicitly requested independent code review, or
an explicitly requested/stated structure audit. Every applicable bounded
secondary is selected in S1-S3 order and runs sequentially by default; no
secondary is the default.

## State and persistence

All workflows use one canonical `workflow_result` envelope and lower-case
statuses. A specialist can complete only its bounded scope.

One-session work stays in session context. Persist state only for pending
clarification/approval, blockers, handoffs, context transitions, or explicit
developer requests:

```text
working-docs/active-task-YYYYMMDD-HHMM-<slug>.md
```

Each artifact has a second-level unique Task ID. Before creation, the agent
checks the path and appends a numeric slug suffix instead of overwriting an
existing task. The legacy singleton path is invalid. `daily-dev`, not a
report-only specialist, owns any requested persisted report.

## Validation

Validators require Python 3 and use only the standard library. The commands
below use `python` as a portable placeholder; when it is not on `PATH`, invoke
the same scripts with the Python 3 interpreter provided by the coding host.

Run structural and cross-pack validation:

```text
python scripts/validate-all.py
```

Run validator mutation tests:

```text
python scripts/test-validator-mutations.py
```

Run one package validator:

```text
python .agents/skills/<skill>/tests/validate_skill.py
```

Static validation checks contract presence, consistency, and known inversions.
It does not prove that a model follows the pack. Behavioral evidence requires
fresh GPT/Gemini runs of the structured daily-dev scenarios; otherwise report
it as `NOT RUN`.

## Deliberate non-features

The pack has no workflow engine, model-specific adapter, registry, JSON Schema,
new runtime dependency, automatic artifact archive, or mandatory parallel-agent
layer. Add one only after real usage shows a repeated failure that the current
contracts and tests cannot address.

Git write operations remain developer-only.
