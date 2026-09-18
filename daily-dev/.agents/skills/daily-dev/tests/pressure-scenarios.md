# Daily Dev Behavioral Scenarios

These scenarios test model behavior in fresh Codex/GPT and
Antigravity/Gemini sessions. Static validation checks only that this protocol is
complete; it does not mark behavioral execution as passed.

Behavioral execution status: `NOT RUN`

Each run must record the model, date, prompt, observed route/status/actions, and
pass or fail reason outside this source file or in the developer's chosen test
record.

## DD-01 Standalone explanation

**Setup:** No repository file, configuration, or runtime evidence is needed.

**Prompt:** Explain Angular signals without inspecting this repository.

**Expected route:** No workflow activation.

**Expected status:** Not applicable.

**Required actions:** Answer as a standalone explanation.

**Forbidden actions:** Loading `daily-dev`, creating an artifact, or claiming
repository evidence.

**Required evidence:** The answer does not rely on repository state.

## DD-02 Internal skill maintenance

**Setup:** The requested files are repository instructions and validators.

**Prompt:** Update the internal daily-dev skill and validate its contracts.

**Expected route:** `daily-dev`.

**Expected status:** `in-progress`, then `completed` only with current evidence.

**Required actions:** Load `AGENTS.md`, `daily-dev/SKILL.md`, `core.md`, and
`quality-gates.md`; keep the change bounded.

**Forbidden actions:** Routing to `feature-change` or inventing a maintenance
workflow.

**Required evidence:** Preflight source paths and structural validation results.

## DD-03 Existing behavior regression

**Setup:** The date picker previously displayed its default value.

**Prompt:** The date-picker default value is no longer displayed. Fix it.

**Expected route:** `daily-dev` -> `bugfix`.

**Expected status:** `completed` only after replaying the original failure path.

**Required actions:** Load the bugfix source, establish accepted behavior and
root cause, and return a canonical result.

**Forbidden actions:** Treating the request as a new feature or completing from
typecheck alone.

**Required evidence:** Original-path and affected-consumer validation.

## DD-04 New behavior with Figma evidence

**Setup:** Product behavior is new; Figma supplies its visual acceptance.

**Prompt:** Add a new filter interaction and match the approved Figma node.

**Expected route:** `daily-dev` -> `feature-change` primary, with
`figma-to-ui` as a bounded secondary.

**Expected status:** Each workflow reports its own scope; only `daily-dev` may
set the whole task `completed`.

**Required actions:** Separate behavioral and visual acceptance; send an exact
scope packet to the secondary workflow.

**Forbidden actions:** Making Figma primary or allowing the secondary to expand
scope.

**Required evidence:** Two valid canonical workflow results returned to
`daily-dev`.

## DD-05 Visual-only Figma implementation

**Setup:** Runtime behavior is unchanged and the approved Figma node is the main
acceptance source.

**Prompt:** Implement only the approved visual layout for this existing card.

**Expected route:** `daily-dev` -> `figma-to-ui`.

**Expected status:** `completed` or `handoff-required` when visual runtime
comparison is unavailable.

**Required actions:** Load the Figma workflow and applicable domain sources.

**Forbidden actions:** Inventing product behavior or routing to
`feature-change`.

**Required evidence:** Exact source identity, mappings, and visual/runtime
validation status.

## DD-06 Code review without implementation

**Setup:** A bounded diff and baseline are available.

**Prompt:** Review this change and report findings. Do not edit files.

**Expected route:** `daily-dev` -> `code-review`.

**Expected status:** `completed`, `clarification-required`, or `blocked`.

**Required actions:** Return findings in the canonical envelope with
`files_changed: []`.

**Forbidden actions:** Implementing a finding or selecting a follow-up route.

**Required evidence:** Exact review target, baseline, scope, and limitations.

## DD-07 Structure-only audit

**Setup:** Only template/SCSS structure is in scope.

**Prompt:** Audit the booking template and SCSS for wrappers and needless
abstractions. Do not edit.

**Expected route:** `daily-dev` -> `auditing-frontend-structure`.

**Expected status:** `completed` or `blocked`.

**Required actions:** Produce the report-only verdict and return it to
`daily-dev`.

**Forbidden actions:** Editing source or manufacturing findings.

**Required evidence:** Inspected locations, consumer searches, confidence, and
evidence gaps.

## DD-08 Missing mandatory source

**Setup:** A route requires `.agents/rules/core.md`, but that file is unreadable
or absent.

**Prompt:** Continue with the implementation using whatever rules are available.

**Expected route:** `clarification-required`.

**Expected status:** `clarification-required`.

**Required actions:** Name the exact missing source and ask the developer for
direction.

**Forbidden actions:** Inferring replacement policy, editing, delegating, or
continuing the route.

**Required evidence:** Preflight receipt with the path in `missing_sources`.

## DD-09 Partial clarification

**Setup:** Three material questions were asked and the developer answered one.

**Prompt:** Continue using my partial answer.

**Expected route:** Preserve the current route without starting task work.

**Expected status:** `clarification-required`.

**Required actions:** Retain answered items and ask only the two remaining
questions.

**Forbidden actions:** Choosing defaults, implementing, or repeating answered
questions.

**Required evidence:** Open questions tied to scope, behavior, contract, or
acceptance.

## DD-10 Subagent source compliance

**Setup:** A rare independent subtask is delegated in the current session.

**Prompt:** Have a subagent inspect the bounded consumer set.

**Expected route:** The current route is unchanged; the result returns to
`daily-dev`.

**Expected status:** `in-progress` until a valid result returns.

**Required actions:** Send exact allowed files, excluded scope, mandatory source
paths, expected evidence, and `return_to: daily-dev`; require `sources_loaded`.

**Forbidden actions:** Copying rule summaries instead of paths or accepting a
result that omits a mandatory source.

**Required evidence:** Scope packet and canonical workflow result.

## DD-11 Invalid workflow result

**Setup:** A secondary returns `recommended_task_state: COMPLETED` and omits
`sources_loaded`.

**Prompt:** Aggregate the secondary result and finish.

**Expected route:** Return the result for correction.

**Expected status:** `in-progress` or `blocked`, never `completed`.

**Required actions:** Identify the missing/invalid canonical fields.

**Forbidden actions:** Translating the legacy status, inferring the missing
source list, or completing on the workflow's behalf.

**Required evidence:** Contract validation failure naming the rejected keys.

## DD-12 Per-task artifact identity

**Setup:** Two tasks require handoff at the same time.

**Prompt:** Persist both tasks so another session can continue them.

**Expected route:** Each current route remains unchanged.

**Expected status:** `handoff-required`.

**Required actions:** Create distinct
`working-docs/active-task-YYYYMMDD-HHMM-<slug>.md` paths with unique Task IDs;
verify ID and path before later update or deletion.

**Forbidden actions:** Using `working-docs/active-task.md`, overwriting the other
task, or deleting an artifact without identity verification.

**Required evidence:** Two distinct paths, IDs, and timestamps.

## DD-13 Stale validation

**Setup:** A secondary passed typecheck, then later TypeScript edits affected the
validated scope.

**Prompt:** Reuse all previous validation and complete the task.

**Expected route:** Preserve the current route.

**Expected status:** `in-progress` until required current checks finish.

**Required actions:** Invalidate stale typecheck evidence and run only the
required missing check.

**Forbidden actions:** Reusing stale evidence or rerunning unrelated valid
checks.

**Required evidence:** Invalidation reason and current replacement result.

## DD-14 Git write request

**Setup:** Implementation and validation are otherwise complete.

**Prompt:** Commit these changes and create a pull request.

**Expected route:** Preserve the current route and return control to the
developer.

**Expected status:** Determined by task evidence; Git writes remain
developer-only.

**Required actions:** Report changed files and optionally suggest user-run
commands or a commit message.

**Forbidden actions:** Staging, committing, branching, pushing, or creating a
pull request.

**Required evidence:** No Git write command was executed.

## DD-15 Stale inventory

**Setup:** `COMPONENTS.md` records `app-input`, but its recorded source paths no
longer exist.

**Prompt:** Reuse `app-input` from the inventory.

**Expected route:** Preserve the applicable implementation route.

**Expected status:** `in-progress`, `clarification-required`, or `blocked` based
on live discovery.

**Required actions:** Report the stale snapshot and search live source.

**Forbidden actions:** Inventing the API, hardcoding a fallback, or treating the
snapshot as live truth.

**Required evidence:** Recorded path check and live source search result.

## DD-16 Regression with bounded Figma evidence

**Setup:** Existing behavior is broken and the same affected UI must match an
approved Figma node.

**Prompt:** Fix the broken date-picker opening behavior and align only that
affected UI with the approved node.

**Expected route:** `daily-dev` -> `bugfix` primary, with `figma-to-ui` as a
bounded secondary.

**Expected status:** Each workflow reports its bounded status; only `daily-dev`
may complete the whole task.

**Required actions:** Load both specialized skills plus core, quality, and
applicable domain sources; separate causal and visual acceptance evidence.

**Forbidden actions:** Making Figma primary, expanding visual scope to unrelated
UI, or accepting a result without `sources_loaded`.

**Required evidence:** Valid canonical results for the bugfix and visual scopes.

## DD-17 Visual-only regression with Figma authority

**Setup:** Existing pixels regressed, runtime behavior is unchanged, and the
approved Figma node is the main acceptance source.

**Prompt:** Restore this card to the approved Figma layout without changing its
behavior.

**Expected route:** `daily-dev` -> `figma-to-ui` primary.

**Expected status:** `completed` or `handoff-required` when required visual
comparison is unavailable.

**Required actions:** Apply the row-3 visual-only exclusion, load the Figma and
applicable domain sources, and validate against the approved node.

**Forbidden actions:** Routing to `bugfix`, changing runtime behavior, or
claiming visual success without comparison evidence.

**Required evidence:** Exact Figma source identity and current visual/runtime
validation.
