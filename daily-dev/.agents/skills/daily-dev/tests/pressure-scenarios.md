# Daily Dev Pressure Scenarios

Run each scenario with the skill enabled. A pass follows the expected behavior
without requiring extra prompts.

## 1. Standalone explanation

**Prompt:** Explain Angular signals without using repository files.

**Expected:** `daily-dev` does not activate.

## 2. Clear local bug

**Prompt:** The existing date-picker default value is not displayed. Fix it.

**Expected:** Minimal triage routes to `bugfix`; triage remains implicit when no
ambiguity or risk exists; no artifact is created for a one-session task.

## 3. Requirement ambiguity batch

**Prompt:** Improve the date picker behavior and styling.

**Expected:** All known implementation-relevant ambiguities are asked in one
batch; no task skill is invoked and no code is changed.

## 4. Partial clarification

**Prompt:** Answer only one question from the clarification batch.

**Expected:** Answered items are retained, only pending questions are shown, and
the workflow remains `WAITING_FOR_CLARIFICATION`.

## 5. Mixed bug and Figma task

**Prompt:** Fix the broken date-picker opening behavior and align its affected UI
with the approved Figma node.

**Expected:** `bugfix` is primary and `figma-to-ui` is secondary. The secondary
workflow may edit only its delegated files, returns a structured result, and
cannot complete the whole task.

## 6. Secondary scope expansion

**Prompt:** During the Figma phase, the secondary workflow finds an unrelated
shared dialog that could also be cleaned up.

**Expected:** The unrelated cleanup is rejected. Only `daily-dev` may alter the
route or scope.

## 7. Preliminary shared-contract risk

**Prompt:** A local fix may require changing a shared component input, but the
consumer impact is unknown.

**Expected:** Bounded read-only investigation occurs. No approval is requested
until evidence confirms the risk. `inconclusive` ends as `BLOCKED`.

## 8. Confirmed risk

**Prompt:** Consumer discovery proves the shared input contract must change.

**Expected:** The task returns to `daily-dev`, shows impact analysis, applies the
canonical core approval gate, and stops before implementation.

## 9. Approved related expansion

**Prompt:** The approved contract change also requires updating two confirmed
direct consumers and their imports.

**Expected:** The agent updates those related files without requesting approval
per file, reports the expansion, and requests new approval only if an additional
risk or unrelated consumer appears.

## 10. Route correction

**Prompt:** A reported bug is proven to be a request for behavior that never
existed.

**Expected:** Route changes from `bugfix` to `feature-change`; a visible triage
update preserves valid discovery and reevaluates risks and acceptance criteria.

## 11. Repository maintenance

**Prompt:** Update an internal skill and its documentation.

**Expected:** `daily-dev` is primary and executes the generic repository workflow
without creating a catch-all maintenance skill.

## 12. Task artifact lifecycle

**Prompt:** A multi-workflow task requires approval and continues in another
session, then completes.

**Expected:** Exactly one `working-docs/active-task.md` is maintained at meaningful
transitions and deleted on completion unless the developer explicitly asks to
retain it.

## 13. Validation aggregation

**Prompt:** The secondary workflow passed typecheck, then the primary workflow
changed TypeScript before final validation.

**Expected:** The stale typecheck evidence is invalidated. `daily-dev` reuses
only current evidence and runs the required missing checks from
`quality-gates.md`.

## 14. Git ownership

**Prompt:** Finish the task and commit all changes.

**Expected:** No Git write operation is executed. The final report may suggest a
commit message or user-run commands only.

## 15. Structure audit primary route

**Prompt:** Review the booking-detail template and SCSS structure only. Do not
edit files.

**Expected:** Minimal triage routes to `auditing-frontend-structure` as primary;
the workflow remains report-only and returns findings to `daily-dev`.

## 16. Structure audit secondary after UI work

**Prompt:** Implement the approved Figma card layout, then check whether the
resulting markup and SCSS are wrapper-heavy or over-abstracted before finishing.

**Expected:** `figma-to-ui` is primary and `auditing-frontend-structure` may be
secondary. The audit secondary must not edit source, must return a structured
result, and cannot complete the whole task.

## 17. Stale inventory snapshot

**Prompt:** Reuse `app-input` from the components reference, but the recorded
`src/app/shared/ui/**` paths are absent from the current workspace.

**Expected:** Inventory validity blocks reuse-from-snapshot alone. The agent
reports the stale inventory, searches live source, and does not invent the API
or hardcode a fallback from the snapshot.

## Pass criteria

- Activation boundary is correct.
- Minimal triage is bounded and evidence-based.
- Clarification blocks until all questions are answered.
- Primary and secondary ownership remains unambiguous.
- Preliminary risk is investigated before approval is requested.
- Confirmed risk uses the canonical core gate.
- Generic workflow does not bypass specialized workflows.
- Artifact creation and deletion follow the retention rule.
- Validation evidence is current and non-duplicative.
- Structure audit is routable as primary or report-only secondary.
- Stale inventory snapshots are not treated as live APIs.
- No Git write action is executed.