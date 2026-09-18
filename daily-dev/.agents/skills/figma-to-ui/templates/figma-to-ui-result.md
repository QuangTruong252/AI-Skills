# Figma-to-UI Result

```yaml
workflow_result:
  workflow: figma-to-ui
  role: primary | secondary
  status: in-progress | completed | clarification-required | approval-required | blocked | handoff-required
  sources_loaded: []
  scope_completed:
    - objective:
      figma_source:
      inspected_nodes: []
      supplied_viewports: []
      variants_and_states: []
      component_mappings: []
      token_mappings: []
      asset_mappings: []
      responsive_evidence: []
      behavior_changed: []
      visual_exceptions: []
  files_changed: []
  validation:
    - check: runtime-ui | visual-comparison | typecheck | lint | build | existing-tests
      result: PASS | FAIL | NOT RUN
      evidence: []
      discrepancies: []
  open_items:
    - type: clarification | approval | blocker | handoff | risk | missing-capability | scope-deviation
      detail:
      exact_steps: []
      expected_result:
  return_to: daily-dev
```
