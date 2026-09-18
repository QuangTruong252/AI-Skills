# Project audit

Run before writing any motion code. Cheap — a few greps. Skipping it is how duplicate token systems and second animation frameworks get born.

## The ten checks

| # | Check | How | What it changes |
|---|---|---|---|
| 1 | Angular version | `package.json` → `@angular/core` | `< 20.2` means no `animate.enter`/`animate.leave`. See *Version fallbacks*. |
| 2 | Existing animation strategy | grep `@angular/animations`, `trigger(`, `animate.enter`, `animate.leave` | Legacy present in the target component → stay legacy in that component, do not mix. |
| 3 | GSAP installed | `package.json` → `gsap`; also grep `from 'gsap'` | Not installed = levels 3–4 are unavailable without a dependency decision. |
| 4 | Motion tokens | grep `duration`, `--duration`, `motion.tokens`, `_motion`, `$transition` in `styles/`, `tokens/`, `shared/` | Reuse. Never define a second scale. |
| 5 | Easing variables | grep `cubic-bezier`, `--ease`, `$ease` | Reuse the project's curve names even if the values differ from this skill's defaults. |
| 6 | Component conventions | Read 1–2 neighbouring components | Standalone vs NgModule, signals vs decorators, `viewChild()` vs `@ViewChild`, template syntax. Match it. |
| 7 | Shared motion utilities | `ls` `shared/`, `core/`, `utils/` for `motion`, `animation`, `*.directive.ts` with animation intent | Reuse a directive/service that already does this. |
| 8 | Accessibility conventions | grep `prefers-reduced-motion`, `reduced-motion`, `a11y` | There may already be a global guard or a `ReducedMotionService`. Hook into it. |
| 9 | SCSS architecture | Where do globals live? Is there a mixin file? Is BEM in use? | Where your CSS goes and what it is named. |
| 10 | Nearest similar implementation | grep for an already-animated sibling (another modal, another dropdown) | Strongest signal available. Copy its shape, not its bugs. |

One command covers most of it:

```bash
grep -rEn "prefers-reduced-motion|--duration|--ease|cubic-bezier|animate\.(enter|leave)|@angular/animations|from 'gsap'" src/ | head -40
```

## Recording the result

Before implementing, state the audit outcome in one or two lines. Example:

> Angular 22, GSAP 3.13 installed, tokens in `src/styles/_motion.scss` (`--duration-fast`, `--ease-out-expo`), existing `ScrollRevealDirective` in `shared/motion/`. Reusing tokens; no new files.

This is what makes two different agents converge on the same implementation.

## Version fallbacks

| Angular | Enter/leave approach |
|---|---|
| **≥ 20.2** | `animate.enter` / `animate.leave`. Default. |
| **17 – 20.1** | Keep the element mounted and animate a state class; or `@angular/animations` **only if already used in that component**; or GSAP driving a signal-owned `isVisible` flag with the removal driven by GSAP's `onComplete`, not a timer. |
| **< 17** | Follow whatever the codebase already does. Do not modernise as a side effect. |

## Dependency decisions

If the requirement genuinely needs GSAP and GSAP is absent:

1. Re-check whether levels 1–2 truly cannot express it. Most cannot-express claims are wrong.
2. If confirmed, **stop and ask** before adding the dependency. Offer the CSS-only degraded version as the alternative and say what it loses.
3. Never add a dependency silently inside an "add an animation" task.

The same applies in reverse: do not remove or replace a motion library the project already uses.

## Preserve existing architecture

If the repo has any of:

```
shared/motion/            motion.tokens.ts
animation.service.ts      _motion.scss
```

use it. Creating `motion-framework/`, `MotionEngine`, or a second token file to implement one interaction is a defect, not an improvement.

Extend an existing utility only when the new case is a genuine second consumer. One consumer = inline it.
