# Phase 1 — Figma UI Analyzer Skill

## Goal

Produce `ui-spec.generated.json` from Figma MCP design context + screenshot evidence. **Do not invent live Figma data.** **Do not emit Angular code.** **Do not decide token mappings.**

## Required inputs

1. Figma node URL or selected node id
2. MCP / design context payload (structured)
3. Screenshot path for the node (or documented absence)
4. Project config (`figma-to-code.config.json`)
5. Existing component registry list (project-provided)
6. Breakpoint definitions from config

## Executable steps

```bash
cd figma-to-code
# Validate an offline/fixture ui-spec:
npm run ui-spec:validate -- tests/fixtures/ui-spec/sample.ui-spec.json
```

Programmatic API (offline tests drive this path):

```ts
import { buildUiSpec } from '../../src/ui-analyzer/build-ui-spec.js';
const spec = buildUiSpec(designContextInput);
// write generated/ui-spec.generated.json via stableStringify
```

## Output contract

- Node tree with auto-layout, hug/fill/fixed, constraints
- Token references **with node id**
- Hard values with property/value/unit/severity
- Responsive classification: Intrinsic | Fluid | Fixed | Min/max constrained | Breakpoint-dependent | Content-dependent | Decorative absolute
- Component matches **require evidence** (not name-only)
- Diagnostics when screenshot contradicts MCP tree
- **Never** treat frame width as default fixed CSS rule

## Schema

`schemas/ui-spec.schema.json`

## External gate

Live Figma MCP capture: `PENDING_EXTERNAL_VERIFICATION` — see `reports/manual-verification/figma-ui-analyzer.md`.
