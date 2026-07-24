# Project Agent Guide

This file is the single entry point for repository instructions across Codex,
Antigravity, Gemini, and other coding agents. Read it first, then read only the
rules, references, and workflow skills explicitly routed by this file.

Custom metadata such as `trigger`, `glob`, or `model_decision` is descriptive
only. It is not an enforcement mechanism.

## Active instruction graph

Only the following sources are active by default:

- `.agents/rules/core.md`
- `.agents/rules/angular.md`
- `.agents/rules/scss.md`
- `.agents/rules/quality-gates.md`
- `.agents/references/TOKENS.md`
- `.agents/references/COMPONENTS.md`
- `.agents/references/PATTERNS.md`
- Workflow skills explicitly listed in the **Workflow routing** section below.

Files or folders prefixed with `_legacy-`, deprecated references, and skills not
explicitly routed below are inactive. Agents MUST NOT invoke or treat them as
instructions unless the developer explicitly asks to review or migrate them.

## Instruction precedence

Use this order when instructions disagree:

1. The developer's explicit instruction for the current task, except for the
   non-delegable Git-write restriction below.
2. Objective repository facts: installed dependency versions, actual scripts,
   compiler/workspace configuration, schemas, generated contracts, and runtime
   constraints. This level does **not** include conventions inferred from
   existing implementation code.
3. This `AGENTS.md` routing and ownership contract.
4. `.agents/rules/core.md`.
5. Applicable domain rules in `.agents/rules/`.
6. An applicable workflow skill explicitly routed by this file.
7. Project references in `.agents/references/`.
8. Established local feature patterns that do not conflict with mandatory
   rules.
9. General Angular, TypeScript, Sass, or CSS recommendations.

Existing code is evidence of current behavior, not automatic permission to copy
legacy patterns. Apply the legacy-code boundary in `angular.md` when existing
code conflicts with mandatory rules.

## Canonical ownership

| Concern | Canonical owner |
| --- | --- |
| Instruction routing and precedence | `AGENTS.md` |
| Scope, reuse, approval gates, conflict handling, repository safety | `.agents/rules/core.md` |
| Angular, TypeScript, templates, forms, reactivity, accessibility | `.agents/rules/angular.md` |
| SCSS architecture, tokens, responsive layout, style exceptions | `.agents/rules/scss.md` |
| Testing, validation, retries, completion evidence, final report | `.agents/rules/quality-gates.md` |
| Current token inventory | `.agents/references/TOKENS.md` |
| Current shared UI API inventory | `.agents/references/COMPONENTS.md` |
| Current composition inventory | `.agents/references/PATTERNS.md` |
| Task-specific process | An explicitly routed workflow skill |

A non-owner MAY link to the canonical owner but MUST NOT redefine its policy.

## Inventory validity

`.agents/references/TOKENS.md`, `COMPONENTS.md`, and `PATTERNS.md` are
**inventory snapshots**, not live source of truth.

Before reusing a recorded token, component, selector, import path, or pattern:

1. Confirm at least one recorded source path for that inventory still exists in
   the current workspace.
2. Prefer live source search and objective configuration over the snapshot.
3. If the recorded paths are absent or the entry conflicts with live source,
   treat the inventory as stale: report the discrepancy, do not invent the
   missing API, and do not implement from the snapshot alone.

Inventory documents MUST state their recorded source paths and verification
date. Stale inventory is a reporting concern, not permission to hardcode a
fallback.

## Context efficiency

Read only the sources required by the task-scope table and the active route.
Do not load every skill, reference, or domain rule by default.

- Load a specialized workflow only after `daily-dev` routes to it.
- Load domain rules only when the task touches that domain.
- Load inventory references only after path verification and only for the
  sections needed by the current search.
- Prefer progressive disclosure: skill `SKILL.md` owns executable policy;
  deep examples stay in references or templates.

## Required reading

| Task scope | Required source |
| --- | --- |
| Any repository-related task except a standalone explanation | `.agents/skills/daily-dev/SKILL.md` |
| Any repository change | `.agents/rules/core.md`, `.agents/rules/quality-gates.md` |
| Existing behavior is incorrect, broken, intermittent, or regressed | `.agents/skills/bugfix/SKILL.md` |
| New behavior or an intentional change to accepted behavior | `.agents/skills/feature-change/SKILL.md` |
| Evaluation without implementation | `.agents/skills/code-review/SKILL.md` |
| Template/SCSS structure audit without implementation | `.agents/skills/auditing-frontend-structure/SKILL.md` |
| Angular, TypeScript, routing, forms, services, directives, pipes, or templates | `.agents/rules/angular.md` |
| SCSS, visual styling, responsive layout, design values, or themes | `.agents/rules/scss.md`, `.agents/references/TOKENS.md` |
| Styled controls, directives, or shared UI | `.agents/references/COMPONENTS.md` |
| Existing forms, search, icons, dialogs, toasts, navigation, or other compositions | `.agents/references/PATTERNS.md` |
| Figma node/specification, mapping, or Figma-to-Angular work | `.agents/skills/figma-to-ui/SKILL.md` and every applicable canonical rule and reference |

## Workflow routing

`daily-dev` is the mandatory orchestrator for repository-related tasks. It owns
triage, routing, approval coordination, task-level validation aggregation, and
final completion. Specialized workflows own only the bounded scope delegated by
`daily-dev` and must return ownership to it.

| Dominant outcome or acceptance source | Active workflow route |
| --- | --- |
| Repository-aware development, debugging, review, design, maintenance, continuation, or handoff | `.agents/skills/daily-dev/SKILL.md` |
| Existing behavior is incorrect, broken, intermittent, or regressed | `daily-dev` → `.agents/skills/bugfix/SKILL.md` |
| New behavior or an intentional change to accepted behavior | `daily-dev` → `.agents/skills/feature-change/SKILL.md` |
| Figma is the main visual acceptance source | `daily-dev` → `.agents/skills/figma-to-ui/SKILL.md` |
| Evaluation without implementation | `daily-dev` → `.agents/skills/code-review/SKILL.md` |
| Template/SCSS structure audit without implementation | `daily-dev` → `.agents/skills/auditing-frontend-structure/SKILL.md` |
| Internal repository docs, rules, skills, or configuration maintenance | `.agents/skills/daily-dev/SKILL.md` |

`auditing-frontend-structure` is report-only. `daily-dev` MAY also route it as a
bounded secondary workflow after `figma-to-ui`, `feature-change`, or other
frontend implementation when markup structure, SCSS reuse, or wrapper weight is
in question before completion.

Only `daily-dev` may choose or change the route. Skip workflow activation only
for standalone explanations that require no repository files, configuration, or
runtime behavior. Legacy Daily Dev, legacy Figma workflows, Superpowers, and
Ponytail remain inactive unless the developer explicitly requests their review
or migration.

## Required process

1. Inspect objective repository configuration and the complete directly
   affected implementation before proposing edits.
2. Search for existing components, APIs, tokens, and patterns before creating
   anything. Apply **Inventory validity** before trusting reference snapshots.
3. Define the smallest coherent change boundary.
4. Check the canonical approval gates in
   `.agents/rules/core.md#high-risk-changes` and
   `.agents/rules/core.md#shared-component-changes`.
5. Stop before implementation when an approval gate is triggered. No `auto`
   workflow mode may bypass a core approval gate.
6. Make only approved, task-scoped changes.
7. Validate with real repository commands and runtime evidence according to
   `.agents/rules/quality-gates.md`.
8. Report failed or unavailable checks explicitly; never imply completion
   without evidence.

## Command and repository safety

- Run shell commands through `rtk` when it is available in the repository
  environment.
- For PowerShell cmdlets, use `rtk powershell -NoProfile -Command "<command>"`.
- Discover the package manager and real commands from repository configuration.
- Prefer repository-provided scripts over invented commands.
- Prefer `rg` for source and consumer discovery when available.
- Do not add dependencies when the installed stack can satisfy the task.
- Do not reformat, rename, reorganize, migrate, overwrite, or revert unrelated
  user changes.

### Non-delegable Git ownership

The user exclusively owns Git write operations and pull-request creation.
Agents MUST NOT execute staging, commits, branch creation or switching, pushes,
merges, rebases, tags, or pull-request creation. Read-only Git inspection is
allowed.

A task-level request may ask the agent to prepare a suggested commit message or
commands for the user, but it does not authorize executing Git writes. This
policy may be changed only by updating this file.

## Testing and completion

`.agents/rules/quality-gates.md` is the only testing and completion policy.
This file intentionally does not define when tests are created or run.

## Project-specific language rule

When generating or updating translation constants, prioritize Japanese
(日本語) unless the developer specifies another language.
