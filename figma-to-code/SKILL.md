# Figma-to-Code Token Pipeline Skill

## When to use

Use this skill to synchronize Figma design tokens with the Angular/SCSS production token system and to drive UI analysis, implementation, and verification workflows.

## Source of truth

| Data | Owner | Editable by hand? |
|---|---|---|
| Figma variable definitions | Figma Design System file | via Figma only |
| `generated/figma-variables.snapshot.json` | Plugin export | no (re-export) |
| Production SCSS under `styles/` | Codebase | yes (humans) |
| `token-map.json` | Humans | **yes — only approved mappings** |
| `generated/token-registry.generated.json` | `tokens:sync` | **never** |
| `generated/mapped.generated.scss` | `tokens:sync` | **never** |
| `generated/ui-spec.generated.json` | Phase 1 analyzer | **never** |

On `VALUE_DRIFT`, do not overwrite either side. Report and escalate.

## Commands

From `figma-to-code/`:

```bash
npm install
npm run plugin:build
npm run tokens:bootstrap # Initialize token SCSS files from Figma snapshot
npm run tokens:scan
npm run tokens:resolve
npm run tokens:validate
npm run tokens:sync
npm run tokens:check-stale
npm test
npm run typecheck
npm run build
```

`tokens:bootstrap` = reads Figma snapshot + bootstrap rules in config, and generates initial SCSS files and mapping.
`tokens:sync` = scan → resolve → validate → generate.

Fixture mode (CI / offline):

```bash
npm run tokens:sync -- --fixture
npm run tokens:check-stale -- --fixture
```

## Agent workflow

1. **Bootstrapping a new project or set of variables**: Place the Figma snapshot in the path configured in `figma-to-code.config.json`, configure `bootstrap` rules, and run `npm run tokens:bootstrap`. This generates the starting token SCSS files and sets up approved mappings.
2. **If Figma variables changed in an existing project**: run plugin in Figma Desktop → save snapshot to `generated/figma-variables.snapshot.json` (or path in config). See `reports/manual-verification/figma-plugin-desktop.md`.
3. If only SCSS or `token-map.json` changed: re-use existing snapshot; run `npm run tokens:sync`.
4. Inspect diagnostics:
   - **error** → blocking (exit 1). Fix mapping/SCSS/schema before continuing.
   - **warning** → non-blocking (VALUE_DRIFT, unused unmapped, etc.). Report them.
   - **info** → suggestions only; **never auto-approve**.
5. Never rename production tokens (preserve names like `--alias-primay-*`).
6. Never edit generated files by hand.
7. For UI work: follow `skills/phase-1-ui-analyzer`, then `skills/phase-3-implementation`, then `skills/phase-4-verification`.


## Quality gates

- Typecheck + unit/integration tests pass.
- Real `styles/tokens` scan does not crash; private `--_*` excluded by default.
- Used unmapped Figma tokens block resolve.
- Two-run sync produces no content diff.
- `tokens:check-stale` fails when generated outputs are dirty.
