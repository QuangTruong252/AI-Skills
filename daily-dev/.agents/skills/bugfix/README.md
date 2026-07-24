# Bugfix

An evidence-driven workflow for correcting existing repository behavior without
silently changing its accepted contract. It is routed and owned by `daily-dev`,
uses `core.md` for scope and approval decisions, and uses `quality-gates.md` for
testing and completion evidence.

## Package

```text
bugfix/
├── SKILL.md
├── README.md
├── templates/
│   └── bugfix-result.md
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines the workflow. The template standardizes the result
returned to `daily-dev`; tests check required boundaries and pressure behavior.

## Activation

**Status: Active.** Repository `AGENTS.md` routes existing-behavior failures
through `daily-dev` to `.agents/skills/bugfix/SKILL.md`.

## Core principles

- Reproduce when feasible; otherwise require concrete evidence.
- Correct the causal mechanism, not the visible symptom.
- Inspect the directly affected flow and nearest consumers.
- Expand read-only discovery only when evidence leads outside scope.
- Use bounded safe instrumentation and remove it before completion.
- Return risky scope, refactors, contract changes, and new behavior to
  `daily-dev`.
- Recheck the original failure path before repository quality gates.
- Never claim runtime success for a path that was not run.

## Validation

Run from the skill directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Then execute the manual scenarios in `tests/pressure-scenarios.md` in the target
coding-agent environment.
