# Figma-to-UI Result

```yaml
figma_to_ui_result:
  workflow_scope:
    mode: primary | secondary
    objective:
    status: completed | approval-required | blocked | handoff-required

  source:
    kind: live-figma | exported-spec | screenshot
    reference:
    inspected_nodes: []
    unavailable_data: []

  visual_contract:
    supplied_viewports: []
    variants: []
    states: []
    responsive_evidence: []

  ui_change_authorization:
    required: true | false
    mode: full-scope-sync | partial-sync | reference-only | not-required
    source_identity:
      figma_file_and_node:
      inspected_version_or_timestamp:
      approved_scope:
    material_deltas: []

  mappings:
    components: []
    tokens: []
    assets: []
    responsive: []
    states: []

  implementation:
    files_changed: []
    behavior_changed: []
    reused: []
    approved_high_risk_decisions: []
    exceptions: []

  validation:
    typecheck:
      status: PASS | FAIL | NOT RUN
      evidence: []
    lint:
      status: PASS | FAIL | NOT RUN
      evidence: []
    build:
      status: PASS | FAIL | NOT RUN
      evidence: []
    existing_tests:
      status: PASS | FAIL | NOT RUN
      evidence: []
    runtime_ui:
      status: PASS | FAIL | NOT RUN
      evidence: []
    visual_discrepancies: []

  remaining_risks: []
  recommended_task_state: COMPLETED | WAITING_FOR_CLARIFICATION | APPROVAL_REQUIRED | BLOCKED | HANDOFF_REQUIRED
  return_to: daily-dev
```
