# Phase 3 — Component-Aware Implementation Skill

## Goal

Plan and implement Angular + SCSS UI using existing components, registry tokens, and responsive rules from `ui-spec` + `token-registry`.

## Protocol before coding

Choose one strategy per node:

1. Existing component  
2. Extend existing component  
3. Compose existing components  
4. Create new component  
5. Plain semantic HTML  

API:

```ts
import { buildImplementationPlan, lintTokenUsage } from '../../src/implementation/plan-implementation.js';
```

## Token rules

- Use application/semantic tokens from the registry (`--app-*`, mapped semantic layers).
- Do not paste raw Figma hex/rgb.
- Do not use Figma token names when the registry maps to a different system token.
- Hardcoded values need an explicit reason in the implementation notes.

## Layout rules

Prefer: flex/grid, intrinsic sizing, fill container, `min/max-width`, `clamp()`, existing breakpoint mixins from `styles/tokens/_breakpoints.scss`.

Avoid: fixed width/height from desktop frames, absolute main layout, ad-hoc media queries when mixins exist, duplicate shared components.

## Verification before done

- Angular build / typecheck (host app)
- SCSS compile
- Unit/component tests
- Token lint via `lintTokenUsage`
- Viewport matrix from config breakpoints
- Light/Dark
- Overflow / long content
- Keyboard/focus basics

## Note on this repository

This repo ships the **protocol + tests**, not a full Angular product app. Wire the skill into the host Angular monorepo when present.
