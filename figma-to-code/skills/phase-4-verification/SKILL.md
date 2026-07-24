# Phase 4 — Verification Skill

## Goal

Executable quality gate for implemented UI.

## Check groups

1. Build and compile  
2. Token lint  
3. Component compliance  
4. Responsive layout (viewport matrix from config)  
5. Light/Dark theme  
6. Accessibility basics  
7. Interaction/states  
8. Visual comparison  

## Commands

```bash
cd figma-to-code
npm run verify:automatable
npm run tokens:validate -- --fixture
npm test
```

API:

```ts
import { runVerification, isExitGatePass } from '../../src/verification/verify.js';
```

## Viewport matrix

Use `breakpoints.viewports` from `figma-to-code.config.json` (mobile, wide-mobile, tablet, laptop, large, desktop). Do not hardcode a separate list when config exists.

## Visual issues shape

Each issue: category, severity, viewport/theme, expected, actual, evidence path, suggested correction.

## Blocking criteria

- Build fail  
- Unresolved used token  
- Serious layout break  
- Missing required state  
- Dark theme unreadable  
- Basic keyboard/focus failure  
- Visual deviation over threshold  

## External

Pixel visual comparison / browser screenshots: `PENDING_EXTERNAL_VERIFICATION` — `reports/manual-verification/visual-verification.md`.
