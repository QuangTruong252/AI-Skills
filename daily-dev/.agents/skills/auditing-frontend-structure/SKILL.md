---
name: auditing-frontend-structure
description: Use when reviewing Angular templates and component SCSS after AI-generated or Figma-driven UI work, when markup is wrapper-heavy or repetitive, styles appear duplicated or dead, or before completing frontend changes whose structure or reuse is in question.
---

# Auditing Frontend Structure

## Role

`auditing-frontend-structure` is a report-only workflow for template and
component SCSS structure. It receives ownership from `daily-dev` as a primary
audit route or as a bounded secondary after frontend implementation.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and precedence.
- [`core.md`](../../rules/core.md): scope, approval gates, shared consumers,
  inventory validity, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): testing, validation, and
  completion evidence.
- [`angular.md`](../../rules/angular.md) and [`scss.md`](../../rules/scss.md):
  domain implementation policy.

`daily-dev` retains whole-task ownership. This workflow MUST NOT reroute the
task, invoke another workflow, edit source, or declare the whole task complete.

## Activation and ownership

Use as primary when the dominant requested outcome is a structure audit without
implementation.

Use as secondary when `daily-dev` delegates a bounded post-implementation
structure review after `figma-to-ui`, `feature-change`, or similar frontend work
and markup structure, SCSS reuse, wrapper weight, or dead styles are in question.

Return findings to `daily-dev`. A later fix is a separately routed change.

## Required context

Read:

- `../../rules/core.md`
- `../../rules/angular.md`
- `../../rules/scss.md`
- `../../rules/quality-gates.md`
- Inventory references only after path verification:
  `../../references/TOKENS.md`, `COMPONENTS.md`, `PATTERNS.md`

Inspect the complete target component flow: template, SCSS, TypeScript needed
to understand the template, relevant consumers, tests, and the approved Figma
source when available. Keep business-logic review outside scope unless it
directly explains a structural finding.

## Report-only contract

- Do not edit, format, generate, delete, stage, or commit source.
- Return findings and suggestions only.
- Do not broaden a structural audit into business logic, data correctness, or
  feature design.
- Do not claim a selector is dead, a wrapper is removable, or an abstraction
  is safe until applicable consumers, automation hooks, semantics, and
  responsive behavior are checked.
- Distinguish a CSS selector with no matching markup from a class attribute with
  no CSS rule. The latter is not proof that the class can be removed; inspect
  template consumers, directives, tests, and automation hooks first.
- Mark missing evidence `VERIFY`; never invent a token, Figma intent, consumer,
  or runtime result.

## Audit workflow

1. Define the exact files and change boundary. Separate pre-existing user work
   from the reviewed change.
2. Search existing local and feature patterns before proposing a new class,
   mixin, component, or utility.
3. Audit:
   - semantic elements, accessibility relationships, focus order, and wrappers
     around Angular control flow;
   - repeated markup with the same meaning and change cadence;
   - duplicate, overridden, unreachable, or dead selectors and declarations;
   - BEM block/modifier contracts, nesting, specificity, `!important`, and
     `::ng-deep`;
   - semantic tokens, hardcoded design values, responsive mechanics, overflow,
     localization, zoom, and content growth.
4. Compare the current structure with the abstraction ladder below.
5. Report only evidence-backed findings using the output contract.

## Abstraction ladder

Stop at the first option that reduces total concepts:

1. Keep explicit markup when repetition carries different business meaning or
   branching.
2. Delete a needless wrapper, selector, or declaration.
3. Reuse an existing local pattern.
4. Introduce one component-local class when repeated structures share semantics
   and should change together.
5. Introduce a feature pattern only when multiple confirmed consumers share
   ownership.
6. Propose a component only when it owns reusable behavior or a stable semantic
   API and reduces repository-wide complexity.
7. Propose shared/global reuse only after consumer discovery and the approval
   gate in `core.md`.

Repeated static section chrome on one page, line-count reduction, or
repository-wide break-even is not sufficient evidence for a new component.
Visual similarity without shared meaning is `KEEP`.

## Actions and priority

| Action | Use when |
| --- | --- |
| `DELETE` | Proven dead or unnecessary structure |
| `MERGE` | Same semantics, ownership, and change cadence |
| `KEEP` | Explicit duplication is clearer than the proposed abstraction |
| `VERIFY` | Evidence, Figma mapping, token, consumer, or runtime behavior is incomplete |

Priority (structure audit vocabulary):

- `P1`: mandatory-rule violation or likely behavior, accessibility, responsive,
  or selector-contract regression.
- `P2`: material duplication or structure likely to diverge.
- `P3`: local naming or readability cleanup.

Confidence:

- `HIGH`: direct source and consumer evidence.
- `MEDIUM`: runtime, Figma, or responsive confirmation remains.
- `LOW`: substantial evidence is missing; action must be `VERIFY`.

When returning into a `code-review` or whole-task summary, map priorities as:

| Structure audit | code-review severity |
| --- | --- |
| `P1` | `P1` (or `P0` only if the finding proves a production-critical break) |
| `P2` | `P2` |
| `P3` | `P3` |

Do not invent a `P0` from structural preference alone.

## Output contract

Start with:

```text
Verdict: CLEAN | CLEAN_WITH_SUGGESTIONS | NEEDS_ATTENTION
Scope: <files and components inspected>
Evidence gaps: None | <unverified evidence>
```

For each finding provide: `ID · ACTION · PRIORITY · CONFIDENCE`, location,
evidence, impact, smallest suggestion, and approval or verification gate. Use
`KEEP` only to reject a tempting abstraction. If no actionable finding exists,
return `CLEAN`; do not manufacture advice.

A confirmed `P1` yields `NEEDS_ATTENTION`. `P2` and `P3` yield
`CLEAN_WITH_SUGGESTIONS`.

Default to chat. Return the complete report content to `daily-dev`.
`auditing-frontend-structure` does not write a report or task artifact. When the
developer requests persistence, `daily-dev` writes the returned content using
the verified Task ID and links it from the matching task artifact. Do not
return raw tool output or duplicate the report.

## Return to daily-dev

```yaml
workflow_result:
  workflow: auditing-frontend-structure
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed:
    - verdict: CLEAN | CLEAN_WITH_SUGGESTIONS | NEEDS_ATTENTION
  files_changed: []
  validation: []
  open_items: []
  return_to: daily-dev
```

This report-only workflow must keep `files_changed` empty. `completed` applies
only to the assigned audit scope.

Recommended follow-up for confirmed structural defects is a separately routed
`feature-change` or `bugfix` task. This workflow never implements the fix.

## Common rationalizations

| Rationalization | Response |
| --- | --- |
| "Five repeated shells deserve a component." | A single consumer and break-even total complexity mean `KEEP`; prefer explicit markup or a local class. |
| "A generic grid utility is more reusable." | Keep ownership local until confirmed consumers share semantics. |
| "While here, review the data and feature behavior too." | Stay inside structural scope and report unrelated concerns only when they block structural evidence. |
| "The selector looks unused." | Search templates, TypeScript, tests, helpers, and automation hooks before `DELETE`. |
| "The class has no SCSS rule." | That proves only missing styling; it does not prove the template class is removable. |
| "The cleanup is obvious, so apply it now." | This skill is report-only; return the finding and stop. |
