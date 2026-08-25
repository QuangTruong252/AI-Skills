# Herdr Operations

## Preflight

```powershell
if ($env:HERDR_ENV -ne '1') { throw 'Not inside a Herdr-managed pane.' }

herdr --skill
herdr pane current --current
herdr pane layout --pane $env:HERDR_PANE_ID
herdr pane list --workspace $env:HERDR_WORKSPACE_ID
herdr agent list
```

Do not run bare `herdr` for discovery; it opens the TUI. Parse opaque IDs from JSON. Prefer `--current`, an explicit pane ID, or a unique agent name over UI focus.

## Surfaces

| Need | Use |
|---|---|
| Layout or isolated checkout | `workspace`, `tab`, `worktree` |
| Shell command, test, or server | `pane` |
| Recognized coding agent | `agent` |

`agent start` needs an existing idle shell pane; it does not create layout.

## Start a worker

Inspect layout first. Split a wide pane right and a narrow or tall pane down; preserve cwd and focus.

```powershell
$split = herdr pane split --current --direction down --cwd (Get-Location).Path --no-focus | ConvertFrom-Json
$workerPane = $split.result.pane.pane_id
herdr agent start auth-impl --kind codex --pane $workerPane --timeout 120000
```

For a concurrent writer, create a worktree-backed workspace:

```powershell
$tree = herdr worktree create --cwd (Get-Location).Path --branch agent/auth-impl --base HEAD --label auth-impl --no-focus | ConvertFrom-Json
$workerPane = $tree.result.root_pane.pane_id
$workerWorkspace = $tree.result.workspace.workspace_id
herdr agent start auth-impl --kind codex --pane $workerPane --timeout 120000
```

Use separate worktrees for concurrent writers. Give reviewers a clean checkout and read-only scope.

## Brief and prompt

A bounded brief contains:

- goal;
- exact owned paths, subsystem, branch, or commit range;
- relevant context and constraints;
- permitted and forbidden actions;
- required diff/SHA, commands, exit codes, output, risks, and blockers;
- conditions that require stopping and asking.

For a long brief, create a temporary Markdown file with file-editing tools, then send its path in a short prompt. This avoids fragile native-shell quoting.

```powershell
herdr agent prompt auth-impl "Read <absolute-brief-path> and complete that assignment." --wait --timeout 600000
```

Use `--until` only for a state-specific wait; normal prompt waits already settle on idle, done, or blocked.

## Monitor and read

```powershell
herdr agent get auth-impl
herdr agent wait auth-impl --timeout 600000
herdr agent read auth-impl --source recent-unwrapped --lines 160
```

`working` is active; `idle` is ready; `done` is unseen settled work; `blocked` is a recognized question or approval; `unknown` is uncertain, never success.

On timeout, inspect with `agent get` and read `visible`. Wait again if still working. If blocked, apply the authorization boundary. If unknown or stalled, use `herdr agent explain <target>` before interrupting.

For incomplete alternate-screen history, ask the settled agent to write its result to a temporary Markdown file and return the path.

## Blocked UI

```powershell
herdr agent read auth-impl --source visible
```

- Ask the user when the choice is not already authorized.
- For an authorized menu choice, use logical keys through `agent send-keys`.
- Use raw pane input only when authorized exact text entry is required. Never use it to bypass `agent_blocked`.

## Verify and review

Require the worker's base and result SHAs or precise diff, `git status --short`, verification commands, exit codes, relevant output, and remaining risks. Re-run deterministic checks in a clean pane or worktree.

Give the reviewer the exact commit range. Require findings first, ordered by severity, with file and line references. Route fixes back to the implementer, then re-verify and review the new SHA.

## Cleanup

Track resources created for the run and close only those. Check worktree status before removal and prefer removal without `--force`. If Git refuses because the checkout is dirty, preserve it and report the blocker.

Never stop the Herdr server, kill the main process, or close user-owned topology unless explicitly requested.
