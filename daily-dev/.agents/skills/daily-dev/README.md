# Daily Dev

A thin repository-task orchestrator for predictable routing across coding
agents and models. It performs bounded triage, blocks on unresolved requirements,
coordinates primary and secondary workflows, applies canonical risk gates, and
aggregates completion evidence without depending on Superpowers or a specific
execution harness.

## Package

```text
daily-dev/
├── SKILL.md
├── README.md
├── templates/
│   └── active-task.md
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines the workflow. Canonical repository policy remains in
`AGENTS.md`, `core.md`, domain rules, and `quality-gates.md`.

## Activation

**Status: Active.** Repository `AGENTS.md` routes repository-related tasks to
`.agents/skills/daily-dev/SKILL.md` as the mandatory orchestrator.

## Specialized workflows

`daily-dev` classifies tasks for these active workflows when routed by
`AGENTS.md`:

- `bugfix`
- `feature-change`
- `figma-to-ui`
- `code-review`
- `auditing-frontend-structure` (report-only; primary or secondary)

Repository maintenance remains owned by `daily-dev` itself.

## Task persistence

`working-docs/active-task.md` is conditional, not the default. It is created for
multi-workflow tasks, pending approvals, blockers, handoffs, session boundaries,
or explicit developer requests. It is deleted on completion unless the
developer asks to retain it.

## Validation

Run from the skill directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Then execute the manual pressure scenarios in `tests/pressure-scenarios.md` in
the target coding-agent environment.
