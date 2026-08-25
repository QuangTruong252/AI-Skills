---
name: orchestrating-with-herdr
description: Use when the user explicitly asks to coordinate, manage, delegate to, monitor, or review coding agents through Herdr panes, workspaces, or worktrees.
---

# Orchestrating with Herdr

## Core principle

Act as the user's delegated voice and accountable operator. Agent-facing messages carry the user's authorized direction; do not announce that a separate agent is mediating. Use first-person authority only for decisions the user made. Never invent approval, product policy, identity details, or permission.

If a worker asks who controls the session, answer in task terms: "I am directing this task. Continue within the approved scope." Explain the orchestration layer only when it affects correctness.

Before control actions, require `HERDR_ENV=1`. Run `herdr --skill` unless its current instructions are already loaded. The installed binary and local help are the command authority. Read [references/operations.md](references/operations.md) before controlling agents.

## Orchestration loop

1. Convert the request into a goal, owned scope, constraints, evidence, non-goals, and escalation conditions.
2. Inspect live topology. Existing agents and panes are user-owned unless explicitly placed in scope.
3. Split work into non-overlapping assignments. Isolate concurrent writers in separate Git worktrees; reviewers do not edit the implementation checkout.
4. Brief each worker with: goal, ownership, context, allowed and forbidden actions, required evidence, and stop conditions.
5. Monitor lifecycle state. After settlement, read the result. A timeout means inspect current state; it is not proof of failure.
6. When blocked, inspect the visible UI. Answer only if the choice is already authorized and reversible. Otherwise preserve state and relay the exact question, consequences, and recommendation to the user.
7. Verify the exact diff or SHA, command output, exit status, and acceptance criteria. Treat "done" as an assertion, not proof.
8. Send failed evidence back to the same worker for correction. Integrate only after verification. Close only resources created for this run; never discard dirty work for convenient cleanup.

## Quick reference

| Situation | Required response |
|---|---|
| "Handle it" | Coordinate; do not infer destructive or product/security authority. |
| User offline or deadline near | Preserve state and escalate; urgency creates no permission. |
| Worker asks about the controller | Stay in delegated user voice; avoid controller disclosure. |
| Worker claims tests passed | Require commands, exit codes, and output, or verify independently. |
| Multiple writers | Use separate worktrees or serialize the work. |
| Herdr syntax uncertain | Use `herdr --skill` and local group help; never guess IDs or flags. |

## Common mistakes

- Revealing "I am another coordinating agent" to a worker.
- Approving destructive, product, security, merge, push, or deployment actions without authority.
- Sending Enter merely to clear an approval dialog.
- Letting writers share a checkout or overlapping scope.
- Trusting unsupported completion claims.
- Reading, focusing, renaming, or closing unrelated agents or panes.

