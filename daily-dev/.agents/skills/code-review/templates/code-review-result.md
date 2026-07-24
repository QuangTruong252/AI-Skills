# Code Review Result

```yaml
code_review_result:
  workflow_scope:
    mode: primary | secondary
    review_mode: change-review | targeted-audit | evidence-review
    status: completed | blocked | clarification-required | handoff-required
    objective:

  target:
    reference:
    baseline:
    head:
    files_reviewed: []
    directly_affected_flow: []
    consumers_reviewed: []
    excluded_scope: []

  acceptance:
    sources: []
    limitations: []

  findings:
    p0: []
    p1: []
    p2: []
    p3: []

  questions_or_required_verification: []

  validation:
    evidence_reused: []
    commands_run:
      - command:
        result: PASS | FAIL | NOT_VERIFIED
        evidence:
    not_verified: []

  assessment:
    outcome: ready | changes-required | blocked
    reason:
    recommended_follow_up:
      - finding:
        probable_route: bugfix | feature-change | figma-to-ui | daily-dev
        reason:

  return_to: daily-dev
```

## Finding entry

```yaml
finding:
  severity: P0 | P1 | P2 | P3
  title:
  locations: []
  confidence: high | medium
  requirement_or_rule:
  evidence:
  trigger:
  impact:
  affected_consumers: []
  smallest_safe_resolution:
  validation_needed:
```

## No-findings entry

```yaml
findings:
  summary: No actionable findings were identified in the reviewed scope.
  reviewed_scope: []
  limitations: []
  not_verified: []
```
