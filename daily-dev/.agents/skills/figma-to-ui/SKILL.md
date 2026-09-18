---
name: figma-to-ui
description: Use when Figma is the primary visual acceptance source, or when daily-dev delegates a bounded Figma visual implementation scope, and the UI must be mapped to repository components, semantic tokens, responsive behavior, assets, states, and validation evidence without inventing product behavior or design-system capabilities.
---

# Figma to UI

## Role

`figma-to-ui` converts an approved Figma visual contract into repository-compatible Angular UI. `daily-dev` retains whole-task ownership; this workflow owns only its routed primary or delegated visual scope.

It MUST NOT redefine policy owned by:

- [`AGENTS.md`](../../../AGENTS.md): routing and instruction precedence.
- [`core.md`](../../rules/core.md): scope, approval gates, shared consumers, conflict handling, missing capabilities, and repository safety.
- [`quality-gates.md`](../../rules/quality-gates.md): tests, validation, retries, completion evidence, and final reporting.
- Applicable domain rules such as [`angular.md`](../../rules/angular.md) and [`scss.md`](../../rules/scss.md).

## Activation and ownership

Use this workflow as primary only when Figma is the dominant acceptance source. When product behavior is primary and Figma supplies only visual acceptance, `feature-change` remains primary and `figma-to-ui` may run only as a bounded secondary workflow routed by `daily-dev`.

This workflow MUST NOT reroute the task, invoke another workflow, or declare the whole repository task complete.

Return to `daily-dev` when:

- the route or acceptance owner changes;
- material ambiguity remains;
- source access is insufficient;
- a canonical gate is confirmed;
- a blocker or handoff remains;
- the bounded UI scope is complete.

## Required reading

Before analysis or implementation:

1. Read `AGENTS.md`, `core.md`, and `quality-gates.md`.
2. Read `angular.md`, `scss.md`, `TOKENS.md`, `COMPONENTS.md`, and `PATTERNS.md` when applicable.
3. Inspect objective repository configuration and the complete directly affected flow.
4. Search existing components, APIs, tokens, assets, responsive APIs, and patterns before proposing new capability.
5. Define the smallest coherent visual change boundary.

## Workflow state machine

```text
INTAKE
→ LOAD CANONICAL RULES
→ RESOLVE INPUT SOURCE
→ INSPECT TARGET FIGMA SCOPE
→ INSPECT REPOSITORY FLOW
→ NORMALIZE VISUAL CONTRACT
→ AUTHORIZE UI CHANGE SCOPE WHEN NEEDED
→ CLASSIFY MATERIAL DELTAS
→ MAP COMPONENTS
→ MAP TOKENS
→ MAP ASSETS
→ MAP RESPONSIVE BEHAVIOR
→ MAP STATES AND ACCESSIBILITY
→ CHECK CANONICAL GATES
→ IMPLEMENT SMALLEST COHERENT BOUNDARY
→ STATIC VALIDATION
→ RUNTIME/UI VALIDATION
→ RETURN RESULT TO DAILY-DEV
```

Use only the canonical lower-case statuses defined by `daily-dev`.

## Source authority

Resolve input in this order:

1. Live Figma file and node through an available connector or MCP.
2. Exported JSON or YAML specification.
3. Screenshot with supporting context.

```yaml
source_authority:
  developer_instruction:
    owns: [objective, behavior, scope, intentional-ui-change]
  objective_repository_facts:
    owns: [installed-versions, scripts, configuration, schemas, public-contracts, runtime-capabilities]
  live_figma:
    owns: [approved-visual-contract, supplied-variants, visual-states, auto-layout, constraints]
  exported_spec:
    role: fallback-visual-contract
  screenshot:
    role: visual-evidence-only
```

A screenshot does not define interaction, responsive behavior, hidden states, or business rules. Apply repository precedence to conflicts and identify the exact disagreement. Do not silently choose the easiest implementation.

## Targeted Figma inspection

Inspect only what is required for the assigned visual scope:

- the target node;
- related component sets and variants;
- referenced variables and styles;
- the nearest parent required to understand constraints;
- directly used assets;
- prototype data only when interaction belongs to the approved scope.

Do not persist raw connector or MCP payloads. Normalize findings:

```yaml
figma_source:
  file:
  node:
  input_kind: live-figma | exported-spec | screenshot
  viewport:
  variants: []
  states: []
  variables: []
  assets: []
  explicit_constraints: []
  unavailable_data: []
```

## Input sufficiency

```yaml
input_status:
  sufficient: continue
  material-ambiguity: clarification-required
  inaccessible-without-fallback: blocked
  missing-optional-detail: continue-with-recorded-limitation
```

Collect all currently known material questions into one clarification batch. Preserve answered decisions and ask only what remains unresolved.

## UI change authorization

When the target UI already exists, obtain one scope-level authorization instead of confirming every visual difference.

```yaml
ui_change_authorization:
  required_when: target-ui-already-exists
  modes:
    full-scope-sync: continue-without-per-difference-confirmation
    partial-sync: batch-material-differences-for-selection
    reference-only: preserve-existing-visual-contract
  identity:
    - figma-file-and-node
    - inspected-version-or-timestamp
    - approved-scope
```

After `full-scope-sync`, continue without renewed confirmation only when every difference is:

- inside the approved scope;
- visual only;
- behavior-preserving;
- public-contract-preserving;
- shared-consumer-preserving;
- free of canonical approval triggers.

## Material delta batching

Create one review batch when a difference changes:

- content or meaningful hierarchy;
- a user-visible state;
- interaction;
- major responsive presentation;
- component identity;
- accessibility semantics, focus, or keyboard behavior;
- the approved Figma source after authorization.

Token, breakpoint, global CSS, shared-component, public-contract, dependency, and consumer-impacting changes are canonical handoffs to `daily-dev`, not workflow-local confirmations. Link the evidence to [`core.md#high-risk-changes`](../../rules/core.md#high-risk-changes) or [`core.md#shared-component-changes`](../../rules/core.md#shared-component-changes) as applicable.

## Mapping classification

```yaml
mapping_status:
  exact: continue
  equivalent: continue-with-recorded-evidence
  ambiguous: clarification-required
  missing: propose-smallest-resolution
```

- `exact`: same semantic purpose and observable visual role.
- `equivalent`: different name or structure but equivalent observable contract.
- `ambiguous`: more than one defensible mapping exists.
- `missing`: no suitable repository capability exists.

An assumption does not authorize implementation.

## Token mapping

Map by semantic purpose, not by matching raw values.

Search in this order:

1. Approved semantic `--app-*` token.
2. Comparable component with the same semantic UI role.
3. Candidate behavior across every supported theme.
4. Missing-capability flow.

Do not use raw design fallbacks, local pseudo-tokens, arbitrary hardcoded values, or unsupported private APIs to conceal missing token support. Creating or changing a token is handled through the canonical gate.

## Component mapping and reuse

Do not map Figma frames or groups one-to-one into Angular components. Create a component only when it has a clear responsibility, state or public contract, or demonstrated reuse.

Determine:

- component responsibility;
- inputs, outputs, and event ownership;
- local versus shared state;
- reusable primitives;
- feature-local composition;
- accessibility boundary.

Reuse an existing component only when behavior, accessibility, visual role, and responsive contract are compatible. Before changing a shared artifact, inspect selectors, direct and barrel imports, models, public contracts, projected content, tests, demos, routes, wrappers, and relevant consumers according to [`core.md#shared-component-changes`](../../rules/core.md#shared-component-changes). Incomplete consumer discovery is not proof of safety.

## Assets and icons

Resolve assets in this order:

1. Existing repository asset.
2. Existing repository icon system.
3. Figma export.

Reuse only when shape and semantic role are equivalent. Export design-specific assets when repository equivalents cannot meet the approved fidelity.

Do not:

- draw complex icons with CSS;
- substitute Unicode characters;
- add an icon dependency without approval;
- use a merely similar fallback without confirmation;
- use inline base64 when the repository supports an appropriate asset workflow.

If an acceptance-critical asset cannot be obtained, return `blocked`.

## Responsive behavior

Use supplied viewports, Figma auto layout and constraints, repository responsive APIs, and compatible local patterns as evidence.

Allowed controlled inference:

- intrinsic sizing;
- fluid width;
- natural wrapping;
- `min-width: 0`;
- `max-width: 100%`;
- evidence-backed flex or grid behavior;
- evidence-backed obvious stacking.

Forbidden inference:

- new breakpoint values;
- new hide or show rules;
- changed content order;
- new mobile navigation;
- modal-to-drawer transformation;
- changed interaction by viewport.

Figma frame widths are visual references, not automatic breakpoints.

## Fixed dimensions and content resilience

Use fixed dimensions only for semantically fixed elements such as icons, avatars, badges, or explicitly bounded controls, and only through approved tokens. Verify localization, zoom, validation messages, smaller viewports, and page overflow.

Prefer `min-height` to `height` for variable-label controls, cards, and text containers unless a bounded viewport is explicitly approved.

## Visual states and behavior

Figma owns the visual appearance of supplied states such as default, hover, focus, disabled, selected, loading, and error.

Developer instructions and repository contracts own:

- inputs, outputs, and event payloads;
- forms and validation rules;
- submit behavior;
- business state transitions;
- authorization and API behavior;
- overlay and navigation flow.

Prototype information is evidence, not automatic business authority. When a required runtime state is missing, reuse an equivalent repository state only when semantics match; otherwise request a design decision.

## Accessibility

Accessibility is mandatory and cannot be traded for pixel fidelity. Touched UI must preserve or provide semantic HTML, logical DOM order, accessible names and labels, keyboard reachability, visible focus, valid ARIA state, overlay focus behavior, Escape/backdrop/return focus, and approved contrast.

The implementation may differ from the Figma layer tree when accessibility requires it. Preserve the approved visual result as closely as possible and report the divergence.

## Content, localization, and themes

Content authority:

1. Developer-provided copy.
2. Existing translation or product contract.
3. Figma copy confirmed as final.
4. Placeholder only when explicitly allowed.

Do not change wording merely to fit a layout. Prioritize Japanese translation constants unless the developer requests another language.

Theme-aware values must resolve through approved semantic tokens. Validate every supported theme affected by the change. Do not create local theme overrides to compensate for unclear token semantics.

## Overlays and navigation

Reuse established overlay, dialog, date-picker, tooltip, drawer, and navigation patterns. Preserve focus management, Escape behavior, backdrop handling, and return focus.

Do not infer a new route, navigation flow, modal-to-drawer transformation, or interaction solely from a visual frame.

## Missing capability

```yaml
missing_capability:
  searched_areas: []
  capability:
  why_existing_options_fail:
  smallest_resolution:
  affected_scope:
  approval_required:
```

Do not conceal a missing token, breakpoint, component API, utility, or configuration entry with a hardcoded value, fallback, pseudo-token, or unsupported private API. Return concrete evidence and the smallest proposal to `daily-dev`.

## Dependency and scope boundaries

Prefer installed and repository-native capabilities. A new or upgraded UI, icon, Figma-parsing, or visual-regression dependency is proposal-only until the applicable canonical decision is approved.

Read-only discovery may follow direct evidence to shared components, token definitions, nearest consumers, APIs, responsive utilities, and overlay patterns. Similarity alone is not permission to edit outside the approved boundary.

Unrelated legacy issues stay out of scope unless they create a concrete correctness, accessibility, compatibility, security, or validation risk for the requested UI.

## Implementation boundary

Implement only the approved smallest coherent visual change. A touched file is not blanket refactor scope. Do not restructure unrelated code or migrate nearby legacy patterns for consistency.

If acceptance, source identity, scope, or a material UI decision changes during implementation, stop at a safe file-based checkpoint, invalidate stale mappings and validation evidence, and return the updated decision packet to `daily-dev`.

## Tests and validation

Testing, validation, retries, completion evidence, and final reporting are owned exclusively by [`quality-gates.md`](../../rules/quality-gates.md).

Before implementation, map each visual and behavioral acceptance criterion to a feasible evidence path. Do not create or modify tests unless permitted by the canonical policy. Do not infer runtime or visual success from typecheck, lint, build, or tests. A design-driven UI requires comparison with the exact approved source when the environment supports it; unavailable required evidence must be returned with the exact blocker or handoff steps.

## Result and return

Use [`templates/figma-to-ui-result.md`](templates/figma-to-ui-result.md).

```yaml
workflow_result:
  workflow: figma-to-ui
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed: []
  files_changed: []
  validation: []
  open_items: []
  return_to: daily-dev
```

Nest visual mapping and acceptance evidence under the canonical fields; do not
emit a separate recommended task state. `completed` verifies only the assigned
visual scope. `daily-dev` owns the whole-task status.

## Repository safety

Do not edit generated, vendor, or third-party output. Identify the source generator or upstream owner and return the evidence to `daily-dev`.

Do not inspect, copy, or persist secrets, credentials, session data, sensitive personal data, unnecessary production payloads, or raw Figma/MCP payloads.

Do not execute Git write operations. The developer owns staging, commits, branches, pushes, merges, rebases, tags, and pull requests.
