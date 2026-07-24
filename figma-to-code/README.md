# figma-to-code

Production-grade Figma → Angular/SCSS token synchronization and UI skills pipeline.

## Prerequisites

- Node.js 20+
- npm 10+
- (Optional) Figma Desktop for plugin export

## Setup

```bash
cd figma-to-code
npm install
npm run typecheck
npm test
npm run build
npm run plugin:build
```

## Architecture

```text
Figma plugin export → figma-variables.snapshot.json
SCSS scanner        → system token registry (+ dependency graph)
token-map.json      → human-approved mappings only
resolve/validate    → token-registry.generated.json + mapped.generated.scss
Phase 1/3/4 skills  → ui-spec, implementation plan, verification report
```

## Daily workflows

### Refresh tokens after Figma change

1. Build plugin: `npm run plugin:build`
2. Import `plugin/figma-token-export` in Figma Desktop (see manual verification doc)
3. Scan → Download snapshot into `generated/figma-variables.snapshot.json`
4. Update `token-map.json` with **approved** mappings as needed
5. `npm run tokens:sync`
6. Commit generated outputs if your process requires them

### Refresh after SCSS-only change

```bash
npm run tokens:sync
npm run tokens:check-stale
```

### CI offline

```bash
npm run ci
```

## Config reference

`figma-to-code.config.json` — paths, token namespaces, private prefix `--_`, breakpoints/viewports, value-drift policy. Schema: `schemas/figma-to-code.config.schema.json`.

## Diagnostics

Stable codes include `MAPPING_TARGET_MISSING`, `FIGMA_TOKEN_UNMAPPED_USED`, `TOKEN_CIRCULAR_REFERENCE`, `VALUE_DRIFT`, `GENERATED_OUTPUT_STALE`, etc. See `src/contracts/diagnostics.ts`.

## Troubleshooting

| Symptom | Action |
|---|---|
| `Snapshot not found` | Export plugin snapshot or use fixture mode |
| exit 1 on resolve | Read error diagnostics; fix map/SCSS |
| stale generated | `npm run tokens:sync` |
| private vars in registry | Ensure `includePrivate: false` and namespaces configured |
| parse error | Fix SCSS or file diagnostic; do not mutate production values to silence tests |

## Versioning

- `schemaVersion` currently `1.0.0`
- Unsupported versions fail closed
- Breaking schema changes require a migration note in reports

## Documentation

Detailed guides for new developers:
- **[Workflow & Phases Deep Dive](docs/WORKFLOW_DEEP_DIVE.md)** — Step-by-step inputs, outputs, mechanisms, and CLI commands for Phase 1 to Phase 4.
- **[Architecture Guide](docs/ARCHITECTURE.md)** — Codebase directory layout, module roles, and global data flow.
- **[Diagnostics Reference](docs/DIAGNOSTICS.md)** — Comprehensive list of error codes, warnings, and remediation steps.
- **[Getting Started](docs/GETTING_STARTED.md)** — Environment setup and daily development workflows.

## Skills

- `SKILL.md` — orchestration
- `skills/phase-1-ui-analyzer`
- `skills/phase-3-implementation`
- `skills/phase-4-verification`
