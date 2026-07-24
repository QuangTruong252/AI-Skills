# Core Project Rules

These rules apply to every repository change. This file is the canonical owner
of scope, reuse, approval gates, conflict handling, and repository safety. It
does not own testing, validation, or completion policy; those belong to
`quality-gates.md`.

## Rule language

- **MUST / MUST NOT**: mandatory. An exception requires explicit developer
  approval before implementation.
- **SHOULD / SHOULD NOT**: preferred guidance. A deviation is valid only when
  the final report names the exact guidance, concrete reason, affected files or
  scope, alternative considered, and maintenance or compatibility risk.
- **MAY**: optional.

Terms such as “when appropriate,” “when needed,” or “the task requires it” are
not decision criteria unless observable conditions are stated.

## Required preflight

Before editing, the agent MUST:

1. Read objective repository configuration relevant to the task, including
   installed versions, actual scripts, compiler/workspace configuration, and
   schemas.
2. Inspect the complete directly affected flow: implementation, callers,
   templates, styles, public contracts, and relevant existing tests.
3. Search for existing components, APIs, tokens, utilities, patterns, and
   supported extension points that can satisfy the requirement.
4. Define the smallest coherent change boundary. When more than one file or
   public surface is involved, state the intended boundary before editing.
5. Check the approval gates below.

Objective repository facts describe what the project can execute. Existing code
patterns are lower-priority evidence and MUST NOT override mandatory rules.

## Scope and reuse

- The agent MUST make the smallest coherent change that satisfies the approved
  requirement.
- The agent MUST reuse an existing correct component, API, token, or pattern
  before creating a new one.
- The agent MUST NOT reformat, rename, migrate, reorganize, or clean unrelated
  code.
- The agent MUST NOT replace an established compatible pattern merely because a
  newer framework API exists.
- Refactoring MAY occur only when the directly edited code cannot satisfy the
  requirement correctly or maintainably without it, and the refactor remains
  inside the approved boundary.
- The agent MUST NOT create speculative abstractions, configuration, or public
  APIs for possible future reuse.

<a id="high-risk-changes"></a>

## High-risk changes

This is the canonical and complete approval-trigger list. Other rules and skills
MUST link here and MUST NOT reproduce a separate trigger list. No workflow mode,
including an explicitly requested `auto` mode, may bypass these gates.

The agent MUST stop before implementation when a proposed change would:

- Create, rename, move, change, or delete a design token.
- Add or change a breakpoint.
- Add global CSS, a global utility, or an application-wide override.
- Change a public component, directive, pipe, service, route, or shared
  interface contract.
- Change a selector, input, output, model, event payload, content-projection
  contract, route parameter, or public state value.
- Change authentication, authorization, security, persistence, an API contract,
  or primary data flow.
- Add, remove, or upgrade a dependency.
- Change build, compiler, lint, test, generator, or workspace configuration.
- Perform a broad refactor outside the directly affected feature.
- Restructure DOM in a way that changes semantic or interactive hierarchy,
  projection slots, selector dependencies, focus order, automation hooks, or
  more than one known consumer.
- Introduce a cross-feature abstraction or shared component.
- Choose between architectural alternatives that differ in public contracts,
  ownership boundaries, dependencies, data flow, migration burden, or behavior
  across multiple features.

### Approval request format

Before requesting approval, provide:

```markdown
## Approval required

- Proposed change:
- Why it is required:
- Confirmed affected files and consumers:
- Candidate consumers not fully verified:
- Smallest safe proposal:
- Alternatives considered:
- Compatibility and migration risks:
```

Do not implement the gated part until the developer approves it. Unaffected
work MAY continue only when it does not create an inconsistent or partially
broken result.

<a id="shared-component-changes"></a>

## Shared-component changes

Before classifying a shared-artifact change as safe and internal, the agent MUST
search every applicable consumer dimension:

- Component selector usage in templates.
- Class, directive, pipe, service, interface, or exported symbol names.
- Direct import paths and barrel import paths.
- Public inputs, outputs, models, projected-content selectors, event payloads,
  and public state values.
- Helper/demo pages, tests, stories, routes, feature wrappers, and other
  verification surfaces.

The agent MUST inspect relevant matches instead of relying only on match counts.
The impact analysis MUST list searches performed and summarize confirmed
consumers. Incomplete or ambiguous consumer discovery is consumer-impacting and
requires approval.

### Safe internal change

The agent MAY proceed without a separate approval only when all are true:

- Public API and selector are unchanged.
- Projected-content and DOM contracts are unchanged.
- DOM semantics, focus order, keyboard behavior, and automation hooks are
  unchanged.
- Existing consumers retain the same observable behavior, visual contract, and
  responsive behavior.
- No token, breakpoint, global-style, dependency, or configuration change is
  required.

Examples include a local bug fix, task-required internal cleanup, or an
accessibility-metadata correction that preserves structure, focus, behavior,
and public contracts.

### Consumer-impacting change

The agent MUST stop and request approval when any consumer may observe a changed
API, DOM contract, state behavior, event payload, visual behavior, responsive
behavior, token dependency, or focus behavior.

<a id="inventory-validity"></a>

## Inventory validity

Project references under `.agents/references/` are inventory snapshots. They
are not automatic permission to reuse a recorded API.

Before treating a recorded token, component, selector, import, or pattern as
available, the agent MUST:

1. Confirm a recorded source path for that inventory exists in the current
   workspace, or discover the live equivalent path.
2. Prefer live source and objective configuration over the snapshot text.
3. When recorded paths are missing or the snapshot conflicts with live source,
   report the discrepancy, treat the entry as stale, and continue from live
   evidence only.

The agent MUST NOT implement from a stale snapshot, invent the missing surface,
or conceal the gap with a hardcoded fallback.

## Missing APIs, tokens, and project capabilities

- The agent MUST NOT invent an API, input, output, token, breakpoint, utility,
  component, or configuration entry and present it as existing.
- The agent MUST NOT conceal a missing design capability with a raw hardcoded
  value, fallback, local pseudo-token, or unsupported private API.
- The agent MUST report the searched areas, the missing capability, the smallest
  proposed resolution, and affected scope.
- A proposal that triggers a high-risk condition MUST use the approval request
  format above.

## Conflict handling

When source code, references, rules, or developer requirements disagree, the
agent MUST:

1. Identify the exact conflict.
2. Separate objective repository facts from inferred conventions.
3. Name affected files, consumers, and behavior.
4. Apply instruction precedence from `../../AGENTS.md`.
5. Stop for developer approval when resolution changes a high-risk surface.

The agent MUST NOT silently choose the interpretation that produces the easiest
implementation.

## Repository safety

- Git write operations are non-delegable. The agent MUST NOT stage, commit,
  create or switch branches, push, merge, rebase, tag, or create pull requests.
  Read-only Git inspection is allowed.
- Do not overwrite or discard user-authored changes.
- Do not modify generated files unless repository workflow explicitly requires
  it and the source-of-truth change is inside the approved scope.
- Do not add dependencies when the current stack can satisfy the requirement.
- Do not access secrets or copy sensitive values into code, logs, or reports.
