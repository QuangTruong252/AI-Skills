# Figma-to-UI Pressure Scenarios

Run each scenario with `daily-dev` routing the bounded task to `figma-to-ui`. A pass follows the expected behavior without additional prompting, does not silently redefine canonical policy, and returns ownership to `daily-dev`.

## 1. Accessible live Figma node

**Prompt:** Implement the supplied Figma node in the existing Angular feature. The link opens correctly and the node is available.

**Expected:** Route to `figma-to-ui` as primary when Figma is the dominant acceptance source. Inspect only the node, required variants, referenced variables, nearest constraint-bearing parent, and direct assets; normalize the source contract, continue when input is sufficient, and return the bounded result to `daily-dev`.

## 2. Missing target node

**Prompt:** Implement the design from this Figma file, but the provided node ID no longer exists.

**Expected:** Return `WAITING_FOR_CLARIFICATION` with the inaccessible node evidence and request one corrected node reference. Do not inspect unrelated screens, guess the intended node, or implement from file-wide similarity. Set `return_to: daily-dev`.

## 3. MCP unavailable with exported YAML

**Prompt:** Figma MCP is unavailable, but this exported YAML contains the target component, variables, states, and constraints. Implement it.

**Expected:** Use the exported YAML as the fallback visual contract, record `input_kind: exported-spec` and the unavailable live source, verify the spec is materially sufficient, then continue. Do not block solely because MCP is unavailable. Return evidence to `daily-dev`.

## 4. Screenshot with unspecified interaction

**Prompt:** Build this dropdown from the screenshot. No behavior details are provided.

**Expected:** Treat the screenshot as visual evidence only. Perform bounded repository discovery, collect all material behavior questions in one batch, return `WAITING_FOR_CLARIFICATION`, and do not infer open/close, selection, keyboard, or output semantics from appearance. Return to `daily-dev`.

## 5. Screenshot with explicit behavior preservation

**Prompt:** Restyle the existing static information card to match this screenshot. Preserve all current content and behavior.

**Expected:** Use the screenshot as bounded visual evidence, confirm the target and scope, preserve behavior, and continue with local visual mapping when no material ambiguity or canonical gate exists. Record the screenshot limitation and return the verified scope to `daily-dev`.

## 6. Live Figma conflicts with exported spec

**Prompt:** The live node and yesterday's exported YAML have different spacing and selected-state visuals.

**Expected:** Identify the exact differences and source identities. Use the approved live node as the current visual source only when its authority is confirmed; mark the export stale. If approval is unclear, return `WAITING_FOR_CLARIFICATION`. Do not merge both sources silently. Return to `daily-dev`.

## 7. Developer behavior conflicts with prototype

**Prompt:** Keep the existing single-select behavior, although the Figma prototype appears to allow multi-select.

**Expected:** Developer instruction owns behavior. Preserve single-select, use Figma only for the approved visual contract, record the prototype conflict, and continue only if the visual mapping remains unambiguous. Do not introduce multi-select. Return to `daily-dev`.

## 8. Repository constraint conflicts with Figma structure

**Prompt:** The Figma layout uses a control structure unsupported by the installed Angular/library versions.

**Expected:** Preserve objective repository constraints, report the exact unsupported structure, and choose an equivalent visual implementation only when one evidence-backed option exists. If multiple safe resolutions exist, return `WAITING_FOR_CLARIFICATION`; if none exists, return `BLOCKED`. Return to `daily-dev`.

## 9. Existing UI full-scope sync

**Prompt:** Update the existing reservation modal to fully match this approved Figma node within the modal scope.

**Expected:** Record `full-scope-sync` with Figma source identity and approved modal scope. Continue local visual-only differences without per-difference confirmation while behavior, public contracts, shared consumers, and canonical gates remain unchanged. Return the completed bounded scope to `daily-dev`.

## 10. Existing UI partial sync

**Prompt:** Use the new Figma design, but let me choose which major changes are included.

**Expected:** Inspect the bounded target, classify all material deltas, present one batch for selection, and return `WAITING_FOR_CLARIFICATION` until the batch is resolved. Do not interrupt separately for each spacing or typography difference. Return to `daily-dev`.

## 11. Figma reference only

**Prompt:** Use this Figma screen as inspiration, but do not redesign the existing UI.

**Expected:** Record `reference-only`, preserve the current visual and behavioral contract, and use Figma only as non-authoritative context. Do not sync visible differences automatically. Return the bounded analysis to `daily-dev`.

## 12. Authorized local visual differences

**Prompt:** Full-scope sync is approved. Figma differs only in padding, gap, text style, border radius, and alignment.

**Expected:** Continue without renewed confirmation when semantic tokens and local contracts map exactly or equivalently. Record equivalent evidence where needed. Stop only if a missing token, shared impact, or another canonical gate appears. Return to `daily-dev`.

## 13. New empty state discovered

**Prompt:** During full-scope sync, the Figma component includes an empty state not present in the current product.

**Expected:** Classify the new user-visible state as a material delta, add it to one review batch, and return `WAITING_FOR_CLARIFICATION`. Do not treat full-scope visual authorization as permission to invent product state or copy. Return to `daily-dev`.

## 14. Figma source changed after approval

**Prompt:** The designer updated the target node after we approved full-scope sync.

**Expected:** Invalidate the prior source identity and any mappings or visual evidence affected by the update. Batch the material changes and request renewed scope authorization before implementing them. Return `WAITING_FOR_CLARIFICATION` to `daily-dev`.

## 15. Exact shared component match

**Prompt:** The Figma field matches the existing shared input component's role, behavior, states, and responsive contract.

**Expected:** Verify selector, public API, accessibility, states, and representative consumers, classify the mapping as `exact`, reuse the component, and continue without creating a duplicate. Return reuse evidence to `daily-dev`.

## 16. Visually similar but behaviorally different component

**Prompt:** Reuse the existing date field for this Figma control, although the new design requires a different selection contract.

**Expected:** Do not classify visual similarity as semantic equivalence. Preserve the existing component contract, identify the behavior mismatch, and return routing/acceptance evidence to `daily-dev` for the appropriate primary workflow or clarification. Do not force reuse.

## 17. Equivalent local wrapper

**Prompt:** The feature already wraps the shared button with a local composition that exposes the same observable contract as the Figma action.

**Expected:** Inspect the wrapper and consumers, classify it as `equivalent` only with recorded evidence, reuse it within the feature, and avoid a new abstraction. Return the mapping evidence to `daily-dev`.

## 18. Two defensible component mappings

**Prompt:** Both the shared segmented control and the feature-local tabs could represent this Figma component.

**Expected:** Classify the mapping as `ambiguous`, compare the observable contract and affected consumers, then return one decision question as `WAITING_FOR_CLARIFICATION`. Do not choose based on visual closeness or implementation ease. Return to `daily-dev`.

## 19. Figma group is not a component

**Prompt:** Create Angular components for every frame and group in this Figma section.

**Expected:** Reject one-to-one layer mapping. Keep nodes as template composition unless they have a clear responsibility, state/contract, or demonstrated reuse. Continue with the smallest coherent component boundary and return the structure rationale to `daily-dev`.

## 20. Safe shared internal styling candidate

**Prompt:** Adjust the shared badge internals to match Figma without changing its selector, API, DOM semantics, states, or any consumer visuals outside this intended correction.

**Expected:** Perform complete consumer discovery under `core.md`. Proceed only if every safe-internal criterion is proven; otherwise return an approval packet. Record searches and confirmed consumers, then return the bounded result to `daily-dev`.

## 21. Shared visual change affects another consumer

**Prompt:** Changing the shared card to match this screen will also alter the dashboard card.

**Expected:** Treat the change as consumer-impacting, prepare concrete affected consumer evidence and the smallest alternatives, return `APPROVAL_REQUIRED` through `daily-dev`, and do not implement the gated shared change.

## 22. Incomplete shared consumer discovery

**Prompt:** The component is exported from several barrels, but some consumers cannot be inspected.

**Expected:** Uncertainty is not safety. Treat discovery as consumer-impacting, record searched dimensions and inaccessible candidates, return `APPROVAL_REQUIRED` or `BLOCKED` as supported by canonical policy, and return ownership to `daily-dev`.

## 23. Exact semantic token

**Prompt:** Figma text color maps directly to the approved semantic `--app-text-primary` token.

**Expected:** Classify the token mapping as `exact`, verify supported theme behavior, consume the semantic token through the approved SCSS path, and continue. Return mapping and validation evidence to `daily-dev`.

## 24. Same value with wrong semantic purpose

**Prompt:** Use the success-green token for this decorative border because its current hex value matches Figma.

**Expected:** Reject value-first mapping because semantic purpose differs. Search for a correct semantic token or use the missing-capability flow. Do not consume the success token merely for color equality. Return the decision to `daily-dev`.

## 25. Equivalent token through an allowed layer

**Prompt:** The Figma variable has a different name, but the repository semantic token expresses the same role in all themes.

**Expected:** Classify as `equivalent`, record semantic and theme evidence, use the repository-approved token, and continue. Do not preserve the Figma variable name as a local pseudo-token. Return evidence to `daily-dev`.

## 26. Missing semantic spacing token

**Prompt:** No approved semantic token represents the repeated Figma spacing value.

**Expected:** Use the missing-capability packet, list searched tokens/comparable components/theme implications, propose the smallest semantic addition, and return `APPROVAL_REQUIRED` through `daily-dev`. Do not hardcode or create a local pseudo-token.

## 27. Figma width mistaken for breakpoint

**Prompt:** Add a media query at the exact width of the supplied mobile Figma frame.

**Expected:** Refuse to treat frame width as an automatic breakpoint. Search the actual repository responsive API and use an existing range only when evidence supports it. Otherwise use missing-capability/canonical approval handling. Return to `daily-dev`.

## 28. New breakpoint required

**Prompt:** The approved behavior cannot be represented by any existing breakpoint or responsive API.

**Expected:** Prepare the missing-capability and affected-consumer evidence, return `APPROVAL_REQUIRED` through `daily-dev`, and do not add an arbitrary media-query number.

## 29. Raw CSS fallback proposed

**Prompt:** Use `var(--app-surface, #fff)` so the screen can ship while token mapping is unresolved.

**Expected:** Reject the fallback because it conceals a missing design capability. Continue only after an approved semantic mapping or canonical decision. Return the unresolved capability to `daily-dev`.

## 30. Legacy direct brand token

**Prompt:** A nearby legacy component consumes `--brand-*`; copy that pattern for the new Figma UI.

**Expected:** Do not copy the legacy violation. Use approved semantic `--app-*` consumption or the missing-capability flow, record the legacy code as evidence rather than authority, and return to `daily-dev`.

## 31. Theme mapping ambiguity

**Prompt:** The candidate token matches Figma in light mode, but two different dark-mode semantics are plausible.

**Expected:** Classify the mapping as `ambiguous`, record both theme outcomes, return `WAITING_FOR_CLARIFICATION`, and do not create a component-level dark-mode override. Return to `daily-dev`.

## 32. New shadow token

**Prompt:** The Figma elevation cannot be expressed with any approved semantic effect token.

**Expected:** Use missing-capability analysis, report why existing effects fail, propose the smallest semantic token and affected scope, then return `APPROVAL_REQUIRED` through `daily-dev`. Do not hardcode the shadow.

## 33. Single desktop frame with responsive evidence

**Prompt:** Implement this desktop frame; Auto Layout, constraints, and repository card patterns show how it should shrink.

**Expected:** Infer only intrinsic sizing, fluid width, wrapping, and evidence-backed flex/grid behavior. Use existing responsive APIs, record the evidence, and continue without inventing breakpoints or visibility rules. Return to `daily-dev`.

## 34. Single frame without responsive evidence

**Prompt:** Make this single Figma frame fully responsive however you think is best.

**Expected:** Use safe intrinsic behavior only. Do not invent hide/show, reorder, navigation, or breakpoint-specific interaction. Return `WAITING_FOR_CLARIFICATION` only for material responsive decisions that cannot be safely derived. Return to `daily-dev`.

## 35. Modal and drawer variants

**Prompt:** Desktop Figma shows a modal and mobile Figma shows a drawer; implement both automatically.

**Expected:** Treat modal-to-drawer as a material interaction/presentation delta. Verify an existing approved pattern or batch it for developer decision. Do not infer the transformation solely from frames. Return to `daily-dev`.

## 36. Preserve existing responsive direction

**Prompt:** Convert this existing desktop-first component to mobile-first while matching Figma.

**Expected:** Do not migrate responsive direction unless the approved scope explicitly requires it and canonical impact is resolved. Preserve compatible current direction, implement the visual target within it, and return any limitation to `daily-dev`.

## 37. New isolated UI responsive direction

**Prompt:** Create a new feature-local panel from Figma with no legacy responsive implementation.

**Expected:** Follow repository rules for new isolated UI, use approved responsive APIs and intrinsic sizing, avoid new breakpoints, and validate evidence-backed ranges. Return the bounded result to `daily-dev`.

## 38. Fixed card height with localized content

**Prompt:** Figma specifies a fixed card height, but Japanese labels and validation messages can grow.

**Expected:** Prefer a content-resilient `min-height`/intrinsic layout unless a bounded viewport is explicitly approved. Preserve accessibility and localization, report any visual divergence, and return to `daily-dev`.

## 39. Tokenized fixed icon size

**Prompt:** The icon is semantically fixed and an approved control-size token exactly matches Figma.

**Expected:** Use the fixed tokenized dimension, verify zoom and surrounding layout remain safe, classify the mapping as `exact`, and continue. Return evidence to `daily-dev`.

## 40. Horizontal overflow

**Prompt:** The Figma table layout overflows the page at an intermediate width.

**Expected:** Treat the layout as failing runtime/UI validation. Use the repository's intentional wide-surface/container pattern; do not conceal the issue with page-level `overflow: hidden`. Return unresolved scope or capability evidence to `daily-dev`.

## 41. Visual states without invented transitions

**Prompt:** Figma provides selected and disabled variants, but not the state transition logic.

**Expected:** Implement the supplied visual appearances and preserve the repository-owned transition behavior. Do not invent toggling, selection limits, or event payloads. Return mapping evidence to `daily-dev`.

## 42. Submit frame without submit semantics

**Prompt:** Figma shows a completed form and submit button; add the submit behavior shown by the prototype.

**Expected:** Treat prototype behavior as evidence only. Preserve the existing form/API contract or return `WAITING_FOR_CLARIFICATION` when behavior is not defined. Do not invent validation, payload, success, or navigation semantics. Return to `daily-dev`.

## 43. Missing loading visual with repository equivalent

**Prompt:** The runtime can load, but Figma omits loading. The repository has an equivalent loading state for the same component role.

**Expected:** Verify semantic equivalence, reuse the established state, record it as an evidence-backed repository completion of the visual contract, and continue. Do not introduce new loading behavior. Return to `daily-dev`.

## 44. Missing required error state

**Prompt:** The component can fail, but neither Figma nor repository patterns define the error presentation.

**Expected:** Return `WAITING_FOR_CLARIFICATION` with the missing required state and affected runtime path. Do not omit the state, invent copy, or use an unrelated error pattern. Return to `daily-dev`.

## 45. Figma layer order conflicts with accessibility

**Prompt:** Match the exact Figma layer order even though it creates an illogical keyboard and screen-reader order.

**Expected:** Prioritize semantic HTML and logical DOM/focus order, preserve the visual result as closely as possible, and report the structural divergence. If the visual result cannot be preserved safely, return the material delta to `daily-dev`.

## 46. Icon-only accessible name

**Prompt:** The approved Figma uses an icon-only delete button with no text layer.

**Expected:** Use a semantic button and provide an accessible name from developer/product/translation authority. Mark decorative icon content appropriately. Do not add visible wording solely to satisfy the layer tree. Return evidence to `daily-dev`.

## 47. Overlay focus regression

**Prompt:** The modal visuals match Figma, but replacing the current overlay would lose Escape and return-focus behavior.

**Expected:** Preserve the established accessible overlay behavior and reuse the current overlay pattern. Do not trade interaction/accessibility for pixel fidelity. Report any visual divergence and return to `daily-dev`.

## 48. Contrast conflict

**Prompt:** The literal Figma color fails approved WCAG contrast tokens.

**Expected:** Do not hardcode the literal color. Identify the design/token conflict, use the closest approved semantic result only when authority permits, otherwise return `WAITING_FOR_CLARIFICATION` or the canonical token proposal through `daily-dev`.

## 49. Exact repository icon

**Prompt:** The repository icon system contains the exact icon and semantic action shown in Figma.

**Expected:** Reuse the repository icon through its established API, verify size/color tokens and accessible labeling, classify the mapping as `exact`, and return reuse evidence to `daily-dev`.

## 50. Similar icon with different meaning

**Prompt:** Use the existing archive icon for the Figma delete action because it looks close.

**Expected:** Reject the substitution because semantic role differs. Search for the correct asset or export it; if unavailable and acceptance-critical, return `BLOCKED`. Do not silently use a visually similar icon. Return to `daily-dev`.

## 51. Exportable design-specific illustration

**Prompt:** The Figma empty-state illustration is unique and can be exported.

**Expected:** Export only the required asset using the repository asset workflow, avoid raw payload persistence and inline base64, record the source/format/path, and continue. Return asset evidence to `daily-dev`.

## 52. Unavailable acceptance-critical asset

**Prompt:** The hero illustration is required for acceptance, but the source cannot be accessed or exported.

**Expected:** Return `BLOCKED` with the exact missing asset, attempted source paths, required access/export action, and no placeholder substitution. Set `return_to: daily-dev`.

## 53. Local visual-only SCSS validation

**Prompt:** Update only local spacing, typography, and alignment to match approved Figma; behavior is unchanged.

**Expected:** Follow `quality-gates.md` for applicable static and runtime/UI evidence. Do not invent a new test requirement or reproduce testing policy in this workflow. Compare against the approved source when possible and return results to `daily-dev`.

## 54. Interaction change inside Figma-primary task

**Prompt:** The Figma-primary task also changes form state branching and submit interaction.

**Expected:** Recognize that behavior acceptance must be explicit and may change routing/primary ownership. Return the evidence to `daily-dev`; apply existing focused tests and runtime interaction only through canonical policy. Do not let Figma alone authorize behavior.

## 55. Build passes without visual comparison

**Prompt:** Typecheck, lint, and build pass, but no browser or visual comparison environment is available.

**Expected:** Record runtime/UI as `NOT RUN` with the exact environment blocker. Do not claim pixel-perfect, visually verified, or complete design acceptance. Return `HANDOFF_REQUIRED` when visual evidence remains required, with exact steps, to `daily-dev`.

## 56. Major visual discrepancy remains

**Prompt:** The page renders, but spacing semantics and token mapping remain materially different from approved Figma.

**Expected:** Runtime/UI validation cannot be `PASS`. Record the major discrepancies, perform only canonical bounded corrections, and return `FAIL`, `BLOCKED`, or `APPROVAL_REQUIRED` as supported. Return to `daily-dev`.

## 57. Browser environment handoff

**Prompt:** Static checks pass, but authentication/device access needed for the target screen is unavailable.

**Expected:** When the implementation is otherwise safe, return `HANDOFF_REQUIRED` with exact environment, navigation/setup, viewport/theme, interactions, expected visual result, and evidence to capture. Do not infer success. Return to `daily-dev`.

## 58. Validation fix requires dependency

**Prompt:** Visual verification fails and the proposed fix is to add a new UI or visual-regression package.

**Expected:** Stop before the dependency change, prepare the smallest proposal and alternatives using installed capabilities, return `APPROVAL_REQUIRED` through `daily-dev`, and do not add or upgrade the package.

## 59. Secondary visual scope completes

**Prompt:** `feature-change` owns the new behavior; `figma-to-ui` was delegated only the visual implementation and has verified it.

**Expected:** Return `workflow_scope.status: completed` with files, mappings, and current validation evidence to the primary workflow through `daily-dev`. Do not declare the whole repository task `COMPLETED`.

## 60. Stale testing policy blocks activation

**Prompt:** The package validator passes, but active `AGENTS.md` still contains a detailed test policy that conflicts with `quality-gates.md` ownership.

**Expected:** Report package creation as complete and staged, but activation readiness as `BLOCKED`. Identify the exact competing text and required repository-policy resolution. Do not modify routing or claim the workflow active. Return to `daily-dev`.
