# Grok Build `/goal` Prompt — Build the Complete Figma-to-Code Skills Pipeline

Store this file at the repository root beside `AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md`.

Start the autonomous run from Grok Build with:

```text
/goal Read @GROK_BUILD_GOAL_FIGMA_TO_CODE_PROMPT.md and @AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md completely. Execute the full Figma-to-Code pipeline through Milestones 0-9. Continue until every automatable Definition of Done criterion passes. Pause only for a true blocker explicitly defined in the goal contract. --budget 450000
```

Use these Grok Build controls while the goal is running:

```text
/goal status
/goal pause
/goal resume
/goal clear
```

---

You are responsible for completing a production-grade Figma-to-Code skills and token synchronization pipeline for an Angular + SCSS codebase.

## Governing contract

Read `AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md` completely before changing any file. Treat that document as the governing implementation contract for architecture, milestones, source-of-truth rules, test strategy, diagnostics, and Definition of Done.

When this Goal conflicts with the guide, apply these precedence rules:

1. Safety, repository policy, and explicit user constraints.
2. This Goal's continuous-execution and completion rules.
3. `AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md` technical contracts.
4. Existing repository conventions.

The guide's instruction to stop after each milestone is overridden for this Goal. You must continue automatically through all milestones whose prerequisites are available. Still produce a milestone report and run its quality gate before moving to the next milestone.

## Durable objective

Build, test, document, and validate the complete pipeline:

1. Phase 1 — Figma UI Analyzer skill.
2. Phase 2A — Figma Token Snapshot Exporter Plugin.
3. Phase 2B — SCSS Codebase Token Scanner.
4. Phase 2C — Token Resolver, Validator, and Adapter Generator.
5. Phase 2 orchestration commands and skill instructions.
6. Phase 3 — Component-Aware Angular/SCSS Implementation skill.
7. Phase 4 — Verification and quality-gate skill.
8. CI checks, documentation, examples, fixtures, and release-readiness validation.

Execute Milestones 0 through 9 from the guide in order. Do not wait for approval between milestones.

## Required working mode

### 1. Inspect before editing

Before implementation:

- Inspect the repository tree, package manager, workspace configuration, TypeScript configuration, linting, test frameworks, build scripts, CI configuration, Angular structure, SCSS entry points, and existing skill conventions.
- Read every file that you plan to modify and its direct dependencies.
- Search for existing utilities and patterns before creating new ones.
- Establish the baseline status by running the existing relevant checks before changing code.
- Record pre-existing failures separately from regressions introduced by this work.

Do not assume the proposed paths in the guide are the repository's actual paths. Resolve real paths from the repository and configure them rather than hardcoding machine-specific locations.

### 2. Maintain persistent progress

Create and continuously update:

`reports/goal-progress.md`

It must contain:

- Current milestone and state.
- Completed milestones.
- Pending milestones.
- Files changed per milestone.
- Commands and validation results.
- Decisions and assumptions.
- Known warnings and external verification gates.
- Next action.

Update this file after every meaningful checkpoint and before large changes. It is a progress ledger, not a replacement for milestone reports.

Create one milestone report per milestone under:

`reports/milestones/`

Use the reporting contract from the guide. Continue automatically after a milestone reaches its exit gate.

### 3. Test-first and fixture-first execution

For each behavior:

- Add or identify a focused failing test, fixture, schema assertion, or golden-output assertion before implementing the behavior whenever practical.
- Make the smallest coherent implementation that satisfies the current contract.
- Run focused tests first, then package-level checks, then integration checks.
- For generators, run twice and prove byte-stable output except for explicitly controlled metadata.
- Do not update snapshots blindly. Explain meaningful golden-file differences in the milestone report.

### 4. Autonomous failure recovery

Do not stop for ordinary implementation errors, compilation failures, failing tests, parser edge cases, missing imports, formatting issues, or configuration mistakes that can be resolved safely inside the agreed architecture.

When a check fails:

1. Capture the failure.
2. Identify whether it is pre-existing or introduced by the current change.
3. Diagnose the root cause.
4. Apply the narrowest safe correction.
5. Re-run the focused check.
6. Re-run the relevant broader suite.
7. Record the evidence.

Do not bypass tests, weaken assertions, suppress diagnostics, remove fixtures, or change canonical production token values merely to obtain a passing result.

### 5. Scope discipline

You may create or modify files required to implement Milestones 0–9, including tooling, plugin code, schemas, fixtures, tests, generated examples, skill documentation, reports, package scripts, and CI configuration.

The following are protected unless a milestone strictly requires a compatible integration change:

- Canonical production SCSS token values.
- Existing production token names.
- Existing Angular feature behavior unrelated to the pipeline.
- Secrets, credentials, environment files containing secrets, and personal machine configuration.
- Unrelated dependencies, build systems, or formatting across the repository.

In particular:

- Preserve existing names such as `--alias-primay-*`.
- Do not perform opportunistic cleanup or migration.
- Do not edit generated artifacts manually.
- Do not auto-approve mapping suggestions.
- Do not flatten Figma or SCSS alias relationships when traceability is required.
- Do not use a simplistic regex-only SCSS parser as the primary parser.
- Do not treat every CSS custom property as a global design token.
- Exclude private/local properties such as `--_*` by default unless configuration explicitly includes them.
- Preserve selector, theme, at-rule, media, source-file, source-position, multiline-value, and dependency contexts.

Do not push, publish packages, create remote releases, open pull requests, rewrite Git history, or expose repository content externally unless explicitly authorized by repository instructions. Do not commit secrets.

## Milestone execution loop

For every milestone from 0 through 9, perform this loop without requesting approval:

1. Read the milestone contract from the guide.
2. Discover relevant repository context.
3. Restate input, output, invariants, error cases, expected changes, and protected files in the milestone report draft.
4. Add fixtures/tests first where practical.
5. Implement the smallest complete solution for the milestone.
6. Run the milestone's required verification.
7. Perform adversarial review.
8. Fix all blocking issues caused by this work.
9. Run the complete milestone gate again.
10. Produce the final milestone report.
11. Update `reports/goal-progress.md`.
12. Continue immediately to the next milestone.

A milestone may be marked `PASS WITH WARNINGS` only when all blocking acceptance criteria pass and remaining warnings are explicitly non-blocking under the guide.

## Mandatory validation matrix

Use the actual commands and frameworks discovered in the repository. Ensure the final equivalent of all applicable checks passes:

- Dependency installation from a clean, documented state.
- Type checking.
- Linting.
- Formatting check if the repository uses one.
- Unit tests.
- Fixture/golden tests.
- Integration tests.
- JSON Schema validation.
- Figma plugin build.
- CLI/package build.
- SCSS scanner run against focused fixtures.
- SCSS scanner run against the supplied real token files.
- Resolver success fixture.
- Resolver failure fixtures for missing mapping, missing target, type mismatch, mode mismatch, broken reference, and cycles.
- End-to-end `tokens:sync` happy path.
- End-to-end failing paths with correct non-zero exit status.
- Two-run determinism check.
- Generated-output stale/diff check.
- CI configuration validation where locally possible.
- Documentation command examples checked against real scripts.

Run adversarial cases required by the guide, including malformed JSON, unsupported schema version, malformed SCSS, unknown syntax, duplicate declarations, legitimate theme overrides, multiline values, `color-mix()`, modern color syntax, multiple shadows, Sass maps/mixins, private local variables, broken references, circular dependencies, alias chains, missing modes, incompatible token types, input reordering, and value drift.

## Milestone-specific completion expectations

### Milestone 0

Produce a reliable discovery baseline without changing production SCSS or Angular behavior.

### Milestone 1

Provide one shared set of typed contracts, runtime validation, JSON Schemas, schema-version policy, and deterministic serialization.

### Milestone 2

Build the Figma development plugin and test all transform logic outside the Figma runtime using mocks/fixtures. Preserve collections, variables, modes, aliases, and available metadata.

### Milestone 3

Build an AST-based SCSS scanner that preserves declaration context and constructs a traceable dependency graph without modifying source SCSS.

### Milestone 4

Build exact human-approved mapping resolution, validation, diagnostics, suggestions that remain unapproved, deterministic registry generation, and minimal adapter generation.

### Milestone 5

Provide working commands equivalent to:

- `plugin:build`
- `tokens:scan`
- `tokens:resolve`
- `tokens:validate`
- `tokens:sync`

The exact package-manager syntax may follow repository conventions.

### Milestone 6

Create the Figma UI Analyzer skill contract, schemas, templates, validation, fixtures, and instructions needed to produce `ui-spec.generated.json` from Figma MCP context plus screenshot evidence. Do not invent unavailable live Figma data.

### Milestone 7

Create the Component-Aware Implementation skill and validation protocol for Angular + SCSS, including component reuse, token resolution, responsive layout, state handling, and accessibility rules.

### Milestone 8

Create the verification skill and executable checks that are feasible in the repository, including build, token lint, responsive/theme matrices, component compliance, accessibility basics, state coverage, and visual-report contracts.

### Milestone 9

Complete CI, setup instructions, architecture documentation, diagnostics reference, troubleshooting, versioning/migration policy, clean-install validation, and release-readiness audit.

## External and manual verification policy

Some checks may require Figma Desktop, a live Figma document, Figma MCP access, a browser runtime, screenshots, or credentials not available in the execution environment.

For an unavailable external check:

- Do not fabricate a PASS.
- Complete all code, mock tests, build checks, fixtures, and static validation that are possible.
- Create a precise manual verification document under `reports/manual-verification/` containing prerequisites, exact steps, expected results, failure indicators, and evidence to capture.
- Mark the item `PENDING_EXTERNAL_VERIFICATION`.
- Continue all independent milestones instead of stopping the Goal.

An external verification gate is not permission to skip automatable work.

## Decision and blocker policy

Make safe, repository-grounded implementation decisions autonomously and document them. Do not ask for preferences that can be resolved from the guide, repository conventions, existing tests, or the narrowest compatible design.

Pause only when continuing would require one of the following:

- A secret, credential, paid account action, or unavailable authenticated service.
- An irreversible or destructive external action.
- A source-of-truth policy change.
- Renaming or migrating production tokens.
- A breaking schema change for an already-consumed public contract with no compatible path.
- Choosing between multiple equally valid canonical mappings that require product/design ownership.
- Editing files explicitly prohibited by repository policy.
- A legal or licensing decision that cannot be inferred safely.

Before declaring a blocker:

1. Verify the blocker is real.
2. Search the repository for an existing decision or convention.
3. Attempt non-destructive alternatives.
4. Continue every independent task.
5. Record the minimal decision required from a human.

Do not stop merely because the task is large or because one optional integration is unavailable.

## Final Definition of Done

Do not declare the Goal complete until all of the following are true or explicitly identified as unavailable external verification:

- Milestones 0–9 have reports.
- All automatable milestone exit gates pass.
- All introduced code type-checks, lints, builds, and passes tests.
- The Figma plugin builds and its transform logic is covered by tests.
- The SCSS scanner handles the real supplied SCSS files without crashing or losing required context.
- Resolver diagnostics and exit statuses behave as specified.
- Used-token unresolved mappings are blocking.
- Mapping suggestions never become approved automatically.
- `tokens:sync` reproduces generated outputs deterministically.
- Running generation twice creates no new diff.
- CI detects stale generated output.
- Skill documents contain executable workflows, not vague recommendations.
- Phase boundaries and sources of truth are preserved.
- Existing token names and canonical values are not silently changed.
- No secret is committed.
- No unrelated production behavior is modified.
- Setup and troubleshooting are sufficient for another developer to use the pipeline from a clean clone.
- Remaining warnings, technical debt, pre-existing failures, and external verification items are explicitly documented.

## Final audit

After Milestone 9:

1. Review the entire diff for scope creep, duplicated contracts, dead code, accidental token changes, secret exposure, and generated files edited by hand.
2. Run the broadest feasible clean validation suite.
3. Delete temporary debugging artifacts that are not part of the documented system.
4. Verify documentation paths and commands against the repository.
5. Verify all reports agree with actual command results.
6. Update `reports/goal-progress.md` to its final state.
7. Produce `reports/final-goal-report.md`.

The final report must include:

- Final status: `PASS`, `PASS_WITH_EXTERNAL_VERIFICATION_REQUIRED`, or `BLOCKED`.
- Architecture delivered.
- Milestone status table.
- Files added/modified grouped by purpose.
- Commands executed and summarized results.
- Test counts and failing checks, if any.
- Determinism evidence.
- Diagnostics behavior demonstrated.
- Production files intentionally unchanged.
- Pre-existing failures separated from introduced failures.
- External/manual verification checklist.
- Remaining risks and exact remediation.
- A concise usage guide for the next developer.

## Anti-premature-completion rule

Do not treat generated code, a successful build, or a partial test suite as completion. Completion requires implementation, tests, integration, deterministic generation, documentation, reports, CI readiness, and final audit evidence.

Begin now by reading the guide and repository, establishing the baseline, creating the progress ledger, and executing Milestone 0. Continue through Milestone 9 without waiting for user approval unless a true blocker under this Goal is reached.
