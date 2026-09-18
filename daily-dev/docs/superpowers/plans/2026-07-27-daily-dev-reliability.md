# Daily Dev Reliability Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with TDD. The current
> repository forbids agent Git writes, so no step stages or commits changes.

**Goal:** Replace presence-only routing checks with a minimal, fail-closed
reading, routing, ownership, and validation contract for Codex and Antigravity.

**Architecture:** `AGENTS.md` owns the bootstrap and ordered routing contract.
`daily-dev` owns the preflight and canonical workflow result. One pack validator
checks deterministic structure; separate pressure scenarios remain the
behavioral evaluation surface.

**Tech Stack:** Markdown and Python standard library.

## Global Constraints

- Missing mandatory source means `clarification-required` and a developer
  question.
- `return_to` is always `daily-dev`.
- No dependency, runtime service, registry, schema framework, or model adapter.
- Preserve specialized workflow behavior outside result-envelope integration.
- Do not execute Git writes.

---

### Task 1: Create failing contract and mutation checks

**Files:**
- Create: `scripts/test-validator-mutations.py`
- Test: `scripts/test-validator-mutations.py`

**Interfaces:**
- Consumes: repository root containing `AGENTS.md` and `scripts/validate-all.py`
- Produces: a standard-library test command that exits nonzero when a known
  unsafe mutation is accepted

- [x] Add checks for the canonical invariant rows, exact `daily-dev` route path,
  canonical status ownership, task identity, and structured daily-dev
  scenarios.
- [x] Copy the pack with `tempfile` and mutate route path, clarification policy,
  Git ownership, result return owner, and scenario fields.
- [x] Run:
  `python scripts/test-validator-mutations.py`
- [x] Verify RED: current pack must fail because required contracts are absent
  or unsafe mutations are accepted.

### Task 2: Make `AGENTS.md` the fail-closed bootstrap

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: repository task intent
- Produces: mandatory-source matrix, ordered routing table, invariant table,
  and developer-only Git ownership

- [x] Add the bootstrap sequence and silent preflight requirement.
- [x] Add machine-readable invariant rows with stable rule IDs.
- [x] Replace overlapping routing rows with ordered predicates.
- [x] Make missing mandatory sources stop and ask the developer.
- [x] Keep inventory validity and instruction precedence without duplicating
  domain policy.

### Task 3: Reduce `daily-dev` to the orchestrator contract

**Files:**
- Modify: `.agents/skills/daily-dev/SKILL.md`
- Modify: `.agents/skills/daily-dev/templates/active-task.md`
- Modify: `.agents/skills/daily-dev/README.md`

**Interfaces:**
- Consumes: the bootstrap and route selected by `AGENTS.md`
- Produces: preflight receipt, scope packet, canonical `workflow_result`, task
  state, and conditional per-task artifact

- [x] Change frontmatter description to triggering conditions only.
- [x] Replace overlapping route prose with the ordered route contract.
- [x] Define the six canonical statuses and canonical workflow result envelope.
- [x] Require subagents to return `sources_loaded` and `return_to: daily-dev`.
- [x] Replace singleton artifacts with identity-bearing per-task artifacts.
- [x] Remove duplicated Git, approval, and final-report policy; link canonical
  owners instead.

### Task 4: Align specialized workflow returns

**Files:**
- Modify: `.agents/skills/bugfix/SKILL.md`
- Modify: `.agents/skills/bugfix/templates/bugfix-result.md`
- Modify: `.agents/skills/feature-change/SKILL.md`
- Modify: `.agents/skills/feature-change/templates/feature-change-result.md`
- Modify: `.agents/skills/figma-to-ui/SKILL.md`
- Modify: `.agents/skills/figma-to-ui/templates/figma-to-ui-result.md`
- Modify: `.agents/skills/code-review/SKILL.md`
- Modify: `.agents/skills/code-review/templates/code-review-result.md`
- Modify: `.agents/skills/auditing-frontend-structure/SKILL.md`

**Interfaces:**
- Consumes: canonical status and result contract from `daily-dev`
- Produces: workflow-specific evidence inside the canonical envelope

- [x] Remove specialized status enums and recommended whole-task states.
- [x] Use the canonical envelope and preserve workflow-specific details under
  `scope_completed`, `validation`, and `open_items`.
- [x] Update artifact references to the per-task filename pattern.
- [x] Keep whole-task completion owned by `daily-dev`.

### Task 5: Replace scenario quotas with structured evidence cases

**Files:**
- Modify: `.agents/skills/daily-dev/tests/pressure-scenarios.md`
- Modify: `.agents/skills/daily-dev/tests/validate_skill.py`
- Modify applicable specialized `tests/validate_skill.py` files

**Interfaces:**
- Consumes: scenario blocks with prompt, pressures, expected route/status,
  forbidden actions, and required evidence
- Produces: package validation that rejects malformed scenario documentation

- [x] Write the approved high-risk scenarios.
- [x] Remove heading-count-only acceptance.
- [x] Validate required scenario fields and the canonical daily-dev contract.
- [x] Keep package validators for compatibility, but make their output
  explicitly structural.

### Task 6: Harden pack validation

**Files:**
- Modify: `scripts/validate-all.py`

**Interfaces:**
- Consumes: the active pack
- Produces: `STRUCTURE VALIDATION PASSED` only when deterministic contracts hold

- [x] Parse exact frontmatter keys without a new YAML dependency.
- [x] Require exact routed skill paths, including `daily-dev`.
- [x] Parse and verify invariant and routing tables.
- [x] Resolve local Markdown links used by active policy files.
- [x] Reject legacy status/result definitions and non-daily return
  ownership.
- [x] Validate task identity and structured scenario fields.
- [x] Keep inventory and activation checks.

### Task 7: Verify RED, GREEN, and compatibility

**Files:**
- Verify all modified files

**Interfaces:**
- Consumes: final pack
- Produces: fresh structural and mutation evidence

- [x] Run `python scripts/test-validator-mutations.py`; expect all mutation
  checks to pass by rejecting unsafe copies.
- [x] Run `python scripts/validate-all.py`; expect
  `STRUCTURE VALIDATION PASSED`.
- [x] Run every retained package validator; expect structural pass.
- [x] Search for stale singleton artifact paths, `<primary workflow>`, duplicate
  status enums, and `recommended_task_state`.
- [x] Review the diff for unrelated edits and confirm Git status without
  staging or committing.
- [x] Report behavioral GPT/Gemini evaluation as `NOT RUN` until executed on
  real fresh model contexts.
