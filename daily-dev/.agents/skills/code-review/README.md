# Code Review

An evidence-driven, review-only workflow for evaluating bounded repository changes, targeted implementation surfaces, and completion evidence without silently editing code, inflating severity, or treating speculation as a confirmed defect.

## Package

```text
code-review/
├── SKILL.md
├── README.md
├── templates/
│   └── code-review-result.md
└── tests/
    ├── pressure-scenarios.md
    └── validate_skill.py
```

Only `SKILL.md` defines executable workflow policy. The result template standardizes the bounded return to `daily-dev`, pressure scenarios preserve approved edge cases, and the validator checks structure and ownership boundaries.

## Activation

**Status: Active.** Repository `AGENTS.md` routes evaluation-without-implementation tasks through `daily-dev` to `.agents/skills/code-review/SKILL.md`.

## Use it for

- Working-tree, staged-diff, commit-range, or pull-request review.
- Targeted audit of a bounded component, service, flow, module, or file set.
- Independent review after another workflow completes implementation.
- Evaluation of completion claims, tests, builds, runtime evidence, and handoffs.

## Do not use it for

- Implementing a finding.
- Fixing an existing behavior failure.
- Introducing or changing product behavior.
- Figma-primary UI implementation.
- Unbounded repository-wide review without a specific target.
- Template/SCSS structure-only audits that belong to `auditing-frontend-structure`.

## Core principles

- Review-only: findings return to `daily-dev` for routing.
- Specification compliance precedes code-quality preferences.
- Findings require evidence, an execution path, concrete impact, and a bounded resolution.
- Severity reflects observable impact; P3 is not a nit bucket.
- Low-confidence concerns become questions or required verification.
- Consumer-impact review is mandatory for shared and public changes.
- Fresh evidence may be reused; stale evidence is invalidated.
- No-findings reports still disclose scope and validation limitations.
- Git writes, implementation edits, and silent route changes are forbidden.

## Canonical ownership

| Owner | Responsibility |
| --- | --- |
| `AGENTS.md` | Routing and precedence |
| `core.md` | Scope, approval gates, shared/public impact, conflicts, and safety |
| Domain rules | Angular, SCSS, accessibility, tokens, and implementation requirements |
| `quality-gates.md` | Testing, validation, retries, completion evidence, and final reporting |
| `daily-dev` | Whole-task ownership and final workflow route |
| `code-review` | Bounded evaluation, findings, limitations, evidence assessment, and return payload |

## Review modes

- `change-review`: working tree, staged diff, commit range, or pull request.
- `targeted-audit`: a named flow, component, service, module, or file set.
- `evidence-review`: completion claims, command evidence, handoff, or task artifact.

## Result model

The result separates review findings from the whole-task state. See [`templates/code-review-result.md`](templates/code-review-result.md).

## Validation

Run from the package directory:

```text
python tests/validate_skill.py
```

Or from the repository root:

```text
python scripts/validate-all.py
```

Then manually exercise scenarios in `tests/pressure-scenarios.md` in the target coding-agent environments.
