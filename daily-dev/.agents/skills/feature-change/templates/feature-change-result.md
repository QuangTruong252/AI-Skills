# Feature Change Result

```yaml
workflow_result:
  workflow: feature-change
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed:
    - current_behavior:
      requested_behavior:
      authoritative_sources: []
      acceptance_criteria:
        - id:
          statement:
          result: PASS | FAIL | NOT RUN
          evidence: []
      directly_affected_flow: []
      consumers_checked: []
      reused_capabilities: []
      selected_design:
      behavior_changed: []
      preserved_behavior: []
  files_changed: []
  validation:
    - check:
      result: PASS | FAIL | NOT RUN
      evidence: []
      scope:
  open_items:
    - type: clarification | approval | blocker | handoff | risk | scope-deviation
      detail:
      exact_steps: []
      expected_result:
  return_to: daily-dev
```
