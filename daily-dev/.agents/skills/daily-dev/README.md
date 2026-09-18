# Daily Dev

A thin repository-task orchestrator designed for Codex, Antigravity, GPT, and
Gemini. `AGENTS.md` bootstraps exact mandatory reading and ordered routing;
`daily-dev` owns task state, workflow results, and completion.

## Package

```text
daily-dev/
|-- SKILL.md
|-- README.md
|-- templates/
|   `-- active-task.md
`-- tests/
    |-- pressure-scenarios.md
    `-- validate_skill.py
```

Only `SKILL.md` defines this workflow. Canonical policy remains in `AGENTS.md`,
`core.md`, applicable domain rules, and `quality-gates.md`.

## Runtime model

- One main agent owns the whole task.
- Specialized workflows return one canonical result to `daily-dev`.
- Subagents are optional, rare, and bounded by exact source paths.
- In-session state is the default for one-session tasks.

## Task persistence

Create a per-task artifact only for pending clarification or approval, blockers,
handoffs, context transitions, or explicit developer requests:

```text
working-docs/active-task-YYYYMMDD-HHMM-<slug>.md
```

Use a second-level unique Task ID and an unused path; append a numeric slug
suffix rather than overwrite a collision. The legacy singleton
`working-docs/active-task.md` is not valid.

## Validation

Requires Python 3 standard library. Replace `python` with the host's Python 3
interpreter path when it is not available on `PATH`.

Run the structural validator from the repository root:

```text
python scripts/validate-all.py
```

Run mutation tests:

```text
python scripts/test-validator-mutations.py
```

Structural validation checks contracts and cross-file consistency. It does not
prove model compliance. Run the structured scenarios in
`tests/pressure-scenarios.md` with fresh GPT/Gemini sessions for behavioral
evidence; otherwise report behavioral evidence as `NOT RUN`.
