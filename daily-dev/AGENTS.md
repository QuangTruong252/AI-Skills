# Project Agent Guide

This file is the single bootstrap entry point for Codex, Antigravity, Gemini,
and other coding agents working in this repository.

Read this file completely before editing files, running implementation checks,
or delegating work. Then read only the sources required by the selected route.
Custom metadata such as `trigger`, `glob`, or `model_decision` is descriptive
only and MUST NOT be treated as enforcement.

## Bootstrap contract

For every repository-related task:

1. Read this `AGENTS.md` completely.
2. Decide whether the request requires repository files, configuration,
   behavior, runtime evidence, implementation, review, continuation, or
   handoff.
3. Select the preliminary route by applying the first matching predicate in
   **Ordered workflow routing**. Route selection is classification, not task
   work.
4. Build the internal preflight receipt for that selected route.
5. Read every mandatory source selected by **Required reading**.
6. Verify that every selected source was actually read and is usable.
7. Confirm the route and start task work only after the receipt has no missing
   source. If loaded evidence changes the classification, return to step 3 and
   rebuild the receipt.

```yaml
preflight:
  task_type: <classification>
  repository_change: true | false
  mandatory_sources: []
  sources_loaded: []
  missing_sources: []
  route: <workflow | clarification-required>
```

`mandatory_sources` and `sources_loaded` MUST both include `AGENTS.md`; add the
exact paths selected by **Required reading** for the preliminary route.

The receipt is internal by default. Show it only when clarification, approval,
a blocker, a handoff, or a route decision needs developer attention.

If a mandatory source is missing, unreadable, contradictory at the same
precedence level, or cannot be applied to the current repository state:

- set the task status to `clarification-required`;
- identify the exact source and why it is required;
- ask the developer for direction;
- do not start task work, edit, delegate, or infer replacement policy.

## Non-negotiable invariants

| Rule ID | Required behavior |
| --- | --- |
| missing-mandatory-source | stop-and-ask-developer |
| unresolved-clarification | stop-and-ask-developer |
| git-write | developer-only |
| secondary-return | daily-dev |
| whole-task-owner | daily-dev |

These invariants are behavioral contracts. Rewording elsewhere MUST NOT reverse,
weaken, or create an exception to them.

## Instruction precedence

Use this order when instructions disagree:

1. The developer's explicit instruction for the current task, except for the
   non-delegable Git-write invariant above.
2. Objective repository facts: installed versions, real scripts, workspace or
   compiler configuration, schemas, generated contracts, and runtime
   constraints. Existing implementation conventions are not objective facts.
3. This `AGENTS.md`.
4. `.agents/rules/core.md`.
5. Applicable domain rules in `.agents/rules/`.
6. The workflow skill selected by this file.
7. Verified project references in `.agents/references/`.
8. Established local feature patterns that do not conflict with higher levels.
9. General framework or language recommendations.

Files or folders prefixed with `_legacy-`, deprecated references, and skills not
explicitly routed by this file are inactive unless the developer asks to review
or migrate them.

## Canonical ownership

| Concern | Canonical owner |
| --- | --- |
| Bootstrap, precedence, required reading, and routing | `AGENTS.md` |
| Whole-task ownership and result aggregation | `.agents/skills/daily-dev/SKILL.md` |
| Scope, reuse, approval gates, conflicts, and repository safety | `.agents/rules/core.md` |
| Testing, validation, retries, completion evidence, and final report | `.agents/rules/quality-gates.md` |
| Angular, TypeScript, templates, forms, reactivity, and accessibility | `.agents/rules/angular.md` |
| SCSS architecture, tokens, responsive layout, and style exceptions | `.agents/rules/scss.md` |
| Current token inventory | `.agents/references/TOKENS.md` |
| Current shared UI API inventory | `.agents/references/COMPONENTS.md` |
| Current composition inventory | `.agents/references/PATTERNS.md` |
| Bounded specialist process | The routed specialized workflow skill |

A non-owner MAY link to its canonical owner but MUST NOT redefine the owner's
policy.

## Required reading

Only this file is active before classification. Select mandatory sources from
the table, record their exact paths in the preflight receipt, and read each
selected source completely before work begins.

| Observable task scope | Mandatory source |
| --- | --- |
| Any repository-related task except a standalone explanation | `.agents/skills/daily-dev/SKILL.md` |
| Any repository change or routed specialized workflow | `.agents/rules/core.md`, `.agents/rules/quality-gates.md` |
| Existing accepted behavior is broken, intermittent, or regressed | `.agents/skills/bugfix/SKILL.md` |
| New behavior or intentional change to accepted behavior | `.agents/skills/feature-change/SKILL.md` |
| Any routed Figma visual work, primary or secondary | `.agents/skills/figma-to-ui/SKILL.md` |
| Evaluation without implementation, except a report-only template/SCSS structure audit | `.agents/skills/code-review/SKILL.md` |
| Report-only template/SCSS structure audit | `.agents/skills/auditing-frontend-structure/SKILL.md` |
| Angular, TypeScript, routing, forms, services, directives, pipes, or templates | `.agents/rules/angular.md` |
| SCSS, styling, responsive layout, design values, or themes | `.agents/rules/scss.md`, `.agents/references/TOKENS.md` |
| Styled controls, directives, or shared UI | `.agents/references/COMPONENTS.md` |
| Existing forms, search, icons, dialogs, toasts, navigation, or compositions | `.agents/references/PATTERNS.md` |

Load a specialized workflow only after the route is selected. Load inventory
references only for the needed sections and only after applying **Inventory
validity**.

## Ordered workflow routing

`daily-dev` is the mandatory orchestrator for repository-related tasks. Apply
this table from top to bottom. The first matching predicate wins.

| Order | Observable predicate | Route |
| --- | --- | --- |
| 1 | The requested outcome is evaluation without implementation | `daily-dev` -> `.agents/skills/auditing-frontend-structure/SKILL.md` only for a report-only template/SCSS structure audit; otherwise `daily-dev` -> `.agents/skills/code-review/SKILL.md` |
| 2 | The change is limited to repository instructions, rules, skills, documentation, validators, tests for those assets, or configuration maintenance | `.agents/skills/daily-dev/SKILL.md` |
| 3 | Existing accepted behavior is broken, intermittent, or regressed, and the task is not visual-only with Figma as the main acceptance source | `daily-dev` -> `.agents/skills/bugfix/SKILL.md` |
| 4 | New product behavior or an intentional change to accepted behavior is required | `daily-dev` -> `.agents/skills/feature-change/SKILL.md` |
| 5 | The requested implementation is visual-only and Figma is the main acceptance source | `daily-dev` -> `.agents/skills/figma-to-ui/SKILL.md` |
| 6 | Evidence is insufficient to choose a route without changing scope, behavior, contract, or acceptance criteria | `clarification-required` |
| 7 | Repository work is required and no specialized predicate above applies | `.agents/skills/daily-dev/SKILL.md` |

### Optional secondary routing

Select secondaries only after the primary route is confirmed. Evaluate S1-S3 in
order and select every applicable bounded secondary; no secondary is the
default. Execute them sequentially unless independent parallel work is clearly
useful.

| Order | Observable secondary need | Route |
| --- | --- | --- |
| S1 | Figma supplies visual acceptance for the same bounded scope owned by `bugfix` or `feature-change` | `.agents/skills/figma-to-ui/SKILL.md` |
| S2 | The developer explicitly requests an independent post-implementation review | `.agents/skills/code-review/SKILL.md` |
| S3 | A report-only template/SCSS structure audit is explicitly requested after frontend implementation, or structure/reuse is a stated acceptance concern | `.agents/skills/auditing-frontend-structure/SKILL.md` |

Only `daily-dev` may select secondaries. A secondary cannot select another
workflow or change the primary route. For every selected secondary, extend the
preflight receipt with its mandatory sources and complete bootstrap steps 5-6
before delegation.

Only `daily-dev` may choose or change the route, expand delegated scope,
aggregate workflow evidence, or mark the whole task complete. Specialized
workflows return their bounded result to `daily-dev`.

Skip `daily-dev` only for a standalone explanation that needs no repository
file, configuration, or runtime behavior.

## Main-agent and subagent contract

Parallel work is optional and should be rare. Use a subagent only when its scope
is independent, bounded, and useful within the current session.

The main agent MUST send a scope packet:

```yaml
scope_packet:
  objective: <bounded outcome>
  allowed_files: []
  excluded_scope: []
  mandatory_sources: []
  expected_evidence: []
  return_to: daily-dev
```

The packet lists exact source paths; it MUST NOT copy or paraphrase rule text.
`mandatory_sources` MUST include `AGENTS.md` plus every source selected for the
delegated scope. Every subagent MUST independently read those paths. Its result
MUST report `sources_loaded`. Missing sources make the result invalid and
require correction or developer clarification.

## Inventory validity

`.agents/references/TOKENS.md`, `COMPONENTS.md`, and `PATTERNS.md` are inventory
snapshots, not live sources of truth.

Before reusing a recorded token, component, selector, import path, or pattern:

1. Confirm at least one recorded source path still exists.
2. Prefer live source search and objective configuration over the snapshot.
3. If the path is absent or conflicts with live source, report it as stale and
   do not invent the missing API or implement from the snapshot alone.

Inventory documents MUST state their recorded source paths and verification
date. Stale inventory is a reporting concern, not permission to hardcode a
fallback.

## Required process

1. Inspect objective repository configuration and the complete directly
   affected flow before proposing edits.
2. Search for existing components, APIs, tokens, and patterns before creating
   anything.
3. Define the smallest coherent change boundary.
4. Apply the clarification and approval gates owned by
   `.agents/rules/core.md`.
5. Make only task-scoped changes.
6. Validate with actual repository commands and evidence according to
   `.agents/rules/quality-gates.md`.
7. Report failed or unavailable checks explicitly.

## Command and repository safety

- Use `rtk` when it is available; otherwise use the repository shell directly.
- Discover the package manager and commands from repository configuration.
- Prefer repository scripts and `rg`; do not invent commands or add unnecessary
  dependencies.
- Do not reformat, rename, reorganize, migrate, overwrite, or revert unrelated
  user changes.

### Non-delegable Git ownership

The developer exclusively owns Git write operations and pull-request creation.
Agents MUST NOT stage, commit, create or switch branches, push, merge, rebase,
tag, or create pull requests. Read-only Git inspection is allowed.

A developer may request suggested commit messages or commands without
authorizing their execution. This policy changes only through an explicit
update to this file.

## Testing and completion

`.agents/rules/quality-gates.md` is the only testing and completion policy.

## Project-specific language rule

When generating or updating translation constants, prioritize Japanese unless
the developer specifies another language.
