# Code Review Result

```yaml
workflow_result:
  workflow: code-review
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed:
    - review_mode: change-review | targeted-audit | evidence-review
      target:
      baseline:
      head:
      files_reviewed: []
      directly_affected_flow: []
      consumers_reviewed: []
      excluded_scope: []
      findings:
        p0: []
        p1: []
        p2: []
        p3: []
      assessment:
        outcome: ready | changes-required | blocked
        reason:
  files_changed: []
  validation:
    - command_or_observation:
      result: PASS | FAIL | NOT VERIFIED
      evidence:
  open_items:
    - type: clarification | blocker | handoff | limitation | finding-follow-up
      detail:
      probable_route: bugfix | feature-change | figma-to-ui | daily-dev
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

Report-only work must keep `files_changed` empty.
