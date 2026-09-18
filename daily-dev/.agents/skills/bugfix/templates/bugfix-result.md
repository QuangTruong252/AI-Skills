# Bugfix Result

```yaml
workflow_result:
  workflow: bugfix
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed:
    - expected_behavior:
      observed_behavior:
      acceptance_source:
      reproduction:
        status: reproduced | evidence-backed | not-established
        evidence: []
      root_cause:
        status: confirmed | strong-hypothesis | disproved
        hypothesis:
        evidence: []
      selected_fix:
      consumers_checked: []
      diagnostic_changes_removed: true
  files_changed: []
  validation:
    - check: original-failure-path
      result: PASS | FAIL | NOT RUN
      evidence: []
    - check: affected-behavior
      result: PASS | FAIL | NOT RUN
      evidence: []
    - check: applicable-quality-gates
      result: PASS | FAIL | NOT RUN
      evidence: []
  open_items:
    - type: clarification | approval | blocker | handoff | risk | scope-deviation
      detail:
      exact_steps: []
      required_environment_or_access:
      expected_result:
      remaining_uncertainty:
  return_to: daily-dev
```
