# Bugfix Result

```yaml
bugfix_result:
  status: completed | approval-required | blocked | handoff-required

  expected_behavior:
  observed_behavior:
  acceptance_source:

  reproduction:
    status: reproduced | evidence-backed | not-established
    steps_or_conditions: []
    evidence: []
    environment_limitations: []

  root_cause:
    status: confirmed | strong-hypothesis | disproved
    hypothesis:
    supporting_evidence: []
    competing_explanations: []

  scope:
    inspected_flow: []
    consumers_checked: []
    files_changed: []
    scope_expansions: []

  implementation:
    selected_fix:
    rejected_candidates: []
    preventative_refactor_approved: false
    regression_test_approved: false
    browser_workaround:

  validation:
    original_failure_path: PASS | FAIL | NOT RUN
    affected_behavior: PASS | FAIL | NOT RUN
    quality_gates: []
    correction_cycles_used: 0

  diagnostic_changes_removed: true
  remaining_risks: []

  developer_verification_required:
    steps: []
    environment_or_access:
    expected_result:
    remaining_uncertainty:

  return_to: daily-dev
```
