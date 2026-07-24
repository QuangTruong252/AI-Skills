# Feature Change Result

```yaml
feature_change_result:
  workflow_scope_result:
    status: completed | approval-required | blocked | handoff-required
    scope_completed: []
    scope_not_completed: []
    reason:

  recommended_task_state:
    status: COMPLETED | WAITING_FOR_CLARIFICATION | APPROVAL_REQUIRED | BLOCKED | HANDOFF_REQUIRED
    reason:
    pending_workflows: []
    unresolved_acceptance: []

  intake:
    current_behavior:
    requested_behavior:
    motivation:
    affected_users_or_roles: []
    constraints: []
    authoritative_sources: []
    initial_scope: []
    approved_implementation_boundary: []

  acceptance_criteria:
    - id:
      statement:
      source_kind: explicit | derived
      source_reference:
      affected_behavior:
      implementation_scope: []
      validation_strategy:
      validation_status: PASS | FAIL | NOT RUN
      evidence: []
      dependencies: []

  discovery:
    directly_affected_flow: []
    direct_consumers: []
    objective_configuration: []
    existing_contracts: []
    reusable_capabilities: []
    similar_but_out_of_scope: []
    scope_expansion_evidence: []

  design:
    selected_design:
    candidate_designs: []
    reused_capabilities: []
    new_capabilities: []
    rejected_options: []
    preserved_behavior: []

  canonical_handoffs:
    risk_status: none | preliminary | confirmed
    triggered_gates: []
    approval_decisions: []
    requested_decisions: []

  compatibility:
    required: false
    strategy:
    affected_consumers: []
    owner:
    lifecycle: temporary | permanent | not-applicable
    removal_condition:

  migration:
    required: false
    current_schema:
    target_schema:
    affected_data: []
    strategy:
    data_loss_risk:
    rollback:
    real_data_execution: NOT RUN

  implementation:
    behavior_changed: []
    files_changed: []
    internal_cleanup: []
    requirement_changes: []
    invalidation_map:
      reusable: []
      requires_modification: []
      must_be_removed: []
      newly_required: []
      validation_invalidated: []

  validation:
    acceptance_summary:
      PASS: []
      FAIL: []
      NOT_RUN: []
    quality_gates: []
    tests_proposed: []
    tests_approved: []
    tests_run: []
    unavailable_environments: []
    evidence_invalidated_and_rerun: []

  security_and_data:
    sensitive_data_collected: false
    frontend_role_controls:
    backend_authorization: verified | not-verified | not-applicable
    production_like_instrumentation: none | approved | not-run

  remaining_risks: []

  developer_actions:
    - action:
      exact_steps: []
      required_environment_or_access:
      expected_result:
      evidence_to_record:

  git_actions_executed: false
  suggested_commit_message:
  return_to: daily-dev
```
