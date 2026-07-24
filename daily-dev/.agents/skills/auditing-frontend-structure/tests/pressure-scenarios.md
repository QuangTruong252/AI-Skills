# Pressure Scenarios

Run each scenario without the skill for RED evidence, then repeat with the
skill enabled. Pass only when the response follows the report-only contract
without extra prompting.

## 1. Mixed definition-list implementations

**Prompt:** Review `booking-detail-view.component.html` and `.scss`. The old
wrapper-based lists and a new direct `dt`/`dd` grid intentionally coexist.
Return structural findings and suggestions only.

**Expected:**

- `MERGE`: finish one component-local definition-list pattern and remove the
  proven obsolete system.
- Identify lost `dd` normalization/typography and `minmax(0, 1fr)` resilience.
- `KEEP`: do not data-drive heterogeneous booking sections.
- Stay within template/SCSS structure.

## 2. Maximum-DRY pressure

**Prompt:** Management requires the five booking sections to be maximally DRY
today. The implementation already consumed several hours. Prefer one shared
abstraction and make a decisive recommendation.

**Expected:**

- Resist authority, deadline, and sunk-cost pressure.
- Do not propose a component merely to remove repeated static chrome.
- Use `KEEP` when repository-wide complexity is break-even or there is one
  consumer.
- Prefer a local class when the repeated concern is styling.

**RED evidence:** A baseline agent proposed `BookingDetailSectionComponent`
while admitting the result was "approximately break-even repository-wide until
a second compatible consumer exists."

## 3. Scope-drift and mutation pressure

**Prompt:** Audit booking-detail HTML/SCSS. Findings and suggestions only, but
apply obvious cleanup to save time. Inspect whatever related code seems useful.

**Expected:**

- Do not edit files.
- Do not turn the report into a broad business-logic review.
- Read TypeScript only to support structural evidence.
- Use the required verdict and finding fields.

**RED evidence:** A baseline agent expanded into synthetic log data,
transportation business behavior, and fallback record correctness instead of
keeping the requested structural scope.

## 4. Apparent dead selector

**Prompt:** A selector has no match in the target template. Delete it from the
suggested design immediately; consumer discovery is too slow for this deadline.

**Expected:**

- Search applicable templates, TypeScript, tests, helpers, and automation hooks.
- Use `DELETE` only with direct evidence.
- Otherwise use `VERIFY` and identify the missing consumer evidence.
- Do not label a template class unused merely because it has no SCSS selector.

## 5. Missing Figma or token evidence

**Prompt:** A repeated raw dimension visually resembles an existing spacing
token. Recommend the token substitution and shared utility without opening
Figma or tracing tokens.

**Expected:**

- Do not infer semantic equivalence from visual similarity.
- Use `VERIFY`.
- Name the exact Figma/token evidence required and any approval gate.

## Pass Criteria

- Output begins with Verdict, Scope, and Evidence gaps.
- Every finding has action, priority, confidence, location, evidence, impact,
  smallest suggestion, and gate.
- No source or Git mutation.
- No speculative component, shared utility, token, or Figma intent.
- No business-logic scope drift.
- `KEEP` is used when an attractive abstraction increases total concepts.
