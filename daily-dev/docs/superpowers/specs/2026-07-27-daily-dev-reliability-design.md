# Daily Dev Reliability Design

## Goal

Make `daily-dev` reliable for daily Codex and Antigravity work without turning
the instruction pack into a workflow engine. Agents must load project-mandated
sources, stop and ask the developer when a mandatory source is unavailable,
route deterministically, keep whole-task ownership in `daily-dev`, and separate
structural validation from model-behavior evidence.

## Constraints

- `AGENTS.md` is the project-wide source of truth.
- Codex and Antigravity/Gemini are the target runtimes.
- Missing mandatory sources fail closed as `clarification-required`.
- Main-agent/subagent is the supported parallel pattern.
- Most tasks finish in one session.
- No new dependency, runtime service, registry, database, or model adapter.
- Git writes remain developer-only.

The host must load root `AGENTS.md` as project instructions. A session that
never receives that bootstrap is outside the pack's enforcement boundary and
fails behavioral setup verification. Do not duplicate policy into a
model-specific adapter unless real host trials prove a thin bootstrap is
necessary.

## Architecture

Keep the existing file layout. Assign one responsibility to each layer:

- `AGENTS.md`: bootstrap, precedence, mandatory-source matrix, ordered routing,
  invariant table, canonical ownership, and repository-wide safety.
- `daily-dev/SKILL.md`: preflight receipt, triage, route execution, subagent
  boundary, canonical workflow result, task state, and evidence aggregation.
- `core.md`: change scope, reuse, approvals, conflicts, and repository safety.
- `quality-gates.md`: validation and implementation completion evidence.
- Specialized skills: workflow-specific execution only.
- References: verified inventory snapshots loaded after routing.
- Validators: deterministic structure and contract checks only.
- Pressure scenarios: GPT/Gemini behavioral evidence, executed separately.

## Bootstrap and Reading Contract

Every repository task follows:

```text
READ AGENTS.md COMPLETELY
-> CLASSIFY INTENT
-> SELECT PRELIMINARY ORDERED ROUTE
-> RESOLVE MANDATORY SOURCES
-> READ SELECTED SOURCES COMPLETELY
-> VERIFY PREFLIGHT
-> CONFIRM ROUTE OR STOP
```

The agent keeps an internal preflight receipt with task type, whether a
repository change is allowed, mandatory sources, loaded sources, missing
sources, and route. It remains silent on ordinary tasks. Missing sources,
conflicts, ambiguous routes, and approvals are shown to the developer.

Subagents receive file paths rather than copied policy text. Their
`mandatory_sources` includes `AGENTS.md` plus every source selected for the
delegated scope. They read those paths themselves and return `sources_loaded`.

## Ordered Routing

Apply outcome before acceptance source:

1. No repository change: structure-only review routes to
   `auditing-frontend-structure`; all other evaluation routes to `code-review`.
2. Internal rules, skills, documentation, or configuration change routes to
   `daily-dev`.
3. Broken accepted behavior routes to `bugfix`, except visual-only work whose
   main acceptance source is Figma.
4. New or intentionally changed product behavior routes to `feature-change`.
5. Visual-only implementation whose primary contract is Figma routes to
   `figma-to-ui`.
6. Insufficient evidence routes to developer clarification.
7. Other repository work routes to `daily-dev`.

After the primary route is confirmed, `daily-dev` evaluates the optional
secondary predicates in order and selects every applicable bounded secondary:
Figma visual acceptance for the same bugfix/feature scope, an explicitly
requested independent post-implementation review, or an explicitly
requested/stated report-only structure audit. No secondary is the default, and
execution is sequential unless independent parallel work is clearly useful.

## Ownership and Result Contract

Use one status vocabulary:

```text
in-progress
completed
clarification-required
approval-required
blocked
handoff-required
```

All specialized workflows return:

```yaml
workflow_result:
  workflow:
  role: primary | secondary
  status:
  sources_loaded: []
  scope_completed: []
  files_changed: []
  validation: []
  open_items: []
  return_to: daily-dev
```

Only `daily-dev` changes routes, expands approved scope, aggregates current
evidence, and marks the whole task complete. A malformed result is returned for
correction rather than interpreted.

## State and Persistence

Keep ordinary task state in the current session. Create an artifact only for a
cross-session approval, clarification, blocker, handoff, context transition, or
explicit developer request.

Use `working-docs/active-task-YYYYMMDD-HHMM-<slug>.md` with a second-level
unique Task ID. Check for an existing path before creation and append a numeric
slug suffix instead of overwriting. Verify Task ID and path before updating or
deleting an artifact.

Report-only workflows return content without writing files. When persistence is
requested, `daily-dev` writes an unused report path containing the verified
Task ID and links it from the matching artifact.

## Validation

`scripts/validate-all.py` reports `STRUCTURE VALIDATION PASSED`. It validates
exact paths, frontmatter, link targets, invariant rows, routing contracts,
canonical result ownership, scenario shape, and active package consistency.

Mutation tests use only Python standard-library modules and prove that the
validator rejects route removal, invariant reversal, result-contract drift,
and malformed scenarios.

Behavioral evaluation is separate. Run the high-risk scenario set in at least
one fresh GPT session and one fresh Gemini session after routing, ownership, or
mandatory-rule changes. Repeat only when results are unstable or a failure must
be reproduced. Summarize only real execution; do not create an empty evidence
file.

## Deliberate Omissions

Do not add a workflow engine, runtime hooks, model adapters, persistent
registry, JSON Schema, generated Markdown, per-task artifacts by default,
scenario-count quotas, or a new CI workflow. Add platform-specific enforcement
only after real usage proves the common contract insufficient.
