---
name: angular-motion
description: Use when implementing or reviewing animation, transition, or motion in an Angular application — modal/dropdown/accordion/drawer/toast/tooltip/tabs enter-leave motion, hover and micro-interactions, staggered reveals, page transitions, pointer-driven effects, loading/skeleton/streaming states, success/error feedback, GSAP tweens or timelines, `animate.enter`/`animate.leave`, or reduced-motion and animation-performance fixes. Routes the task to a motion pattern first, then to the lowest-complexity engine (CSS, Angular lifecycle, GSAP tween, GSAP timeline). Not for general Angular component work, layout, styling, or state management that has no motion requirement.
---

# Angular Motion

## Purpose

Decide **what should move**, then **how little machinery it takes to move it**.

This skill is pattern-first and engine-second. `Modal` is a motion pattern; GSAP is a motion engine. Never let the engine pick the pattern.

Ownership model — this is the axis everything else hangs on:

```
Angular owns the DOM lifecycle.
CSS / GSAP owns the visual motion.
```

## When to use

Any task whose deliverable includes movement: animation, transition, enter/leave, reveal, stagger, hover motion, scroll motion, page transition, micro-interaction, loading motion, motion polish, motion review, or a Figma motion spec.

## When NOT to use

- Static styling, layout, or responsive work with no movement.
- Adding `@angular/animations` triggers to a legacy codebase as a migration task (that is a migration, not a motion task).
- Non-Angular frontends.
- Tasks where the user asked for a behavior change and animation is your own idea. Don't volunteer motion.

## Mandatory workflow

Do not skip step 1. Do not skip step 5.

1. **Audit the project.** Angular version, existing motion tokens, existing easing vars, GSAP presence, existing shared motion utilities, existing reduced-motion convention, nearest similar implementation in the repo. → `references/project-audit.md`
2. **Classify the interaction** into a motion pattern before writing anything. → `references/decision-rules.md`
3. **Read the pattern spec.** → `references/patterns/<pattern>.md`
4. **Select the lowest engine that can express it.** → `references/implementation-selection.md`
5. **Verify.** Functional, Angular lifecycle, accessibility, performance. → `references/verification.md`

If step 1 and this skill disagree, step 1 wins — see *Precedence* below.

## Decision hierarchy

Pick the **first** level that can express the required motion. Climbing a level requires naming the specific capability the level below lacks.

| Level | Engine | Use when |
|---|---|---|
| **1** | CSS `transition` / `animation` | Hover, focus, active, pressed, checked. Single element. Opacity / transform / color / border. Motion is triggered by a state class or pseudo-class, not by DOM insertion. |
| **2** | Angular `animate.enter` / `animate.leave` + CSS | Element enters or leaves the DOM, but the motion itself is still a plain transition or keyframe. |
| **3** | Angular lifecycle + GSAP tween | Runtime-measured values, dynamic geometry, interruptible or reversible motion, high-frequency pointer input, SVG, transforms CSS cannot express cleanly. |
| **4** | Angular lifecycle + GSAP timeline | Multiple elements or multiple phases with a timing *relationship*: sequencing, overlap, stagger, coordinated enter/leave, multi-stage feedback. |

Rules that bind this table:

- GSAP being installed is **not** a reason to use GSAP.
- GSAP **not** being installed is not a reason to hand-roll a timeline out of `requestAnimationFrame`. Say the requirement needs it and ask.
- Levels 3 and 4 still use level 2 for DOM insertion/removal. GSAP animates; Angular decides existence.

## Critical rules

1. **Never use `setTimeout` to decide when an element may be removed.** Use `animate.leave` and `event.animationComplete()`.
2. **Never introduce `@angular/animations`** (`trigger`/`state`/`style`/`animate`) into new code. It is deprecated as of v20.2. Touch it only if the file already uses it and migrating is out of scope — and then never mix it with `animate.*` in the same component.
3. **No `document.querySelector`.** Use `viewChild`/`viewChildren` signal queries, `ElementRef`, or the `event.target` handed to you. Global lookups need a written rationale (e.g. `document.body` scroll lock).
4. **Every GSAP animation is cleaned up.** `gsap.context()` scoped to the host, reverted in `DestroyRef.onDestroy`. Reverting must also remove GSAP's inline styles.
5. **Reduced motion is not optional** and rarely means `duration: 0`. Reduce distance, drop scale/parallax/stagger, keep a short opacity change so state changes remain legible.
6. **Tokens before numbers.** Reuse the project's motion tokens. If none exist, use the semantic scale in `references/motion-tokens.md`. Pick by intent, never by nearest number.
7. **Enter and exit are not symmetric.** Exit is usually faster; a dismiss must never make the user wait. Reversible motions (tabs, accordion, toggle, icon swap) are the exception.
8. **Animate `transform` and `opacity`.** Anything else needs a reason. → `references/performance.md`
9. **Scope discipline.** An animation task does not rewrite component state, change a public API, restructure SCSS, or migrate unrelated animations.
10. **No new motion architecture** if the project already has one. Reuse `shared/motion`, `motion.tokens.ts`, `_motion.scss`, an existing directive or service.
11. **No abstraction before the second use.** A directive/service for one hover effect is over-engineering.
12. **Do not animate a difference just because it exists.** Two Figma frames differing does not imply a transition between them.

## Precedence

```
task requirements
  ↓
project architecture & rules (angular.md, scss.md, lint, existing conventions)
  ↓
design system / Figma motion spec
  ↓
this skill
  ↓
this skill's fallback defaults (motion-tokens.md)
```

Project conventions win over this skill's defaults **unless** they cause a correctness or accessibility defect. If they do, implement correctly and say why in one line.

## Reference routing

Read only what the task needs.

| Situation | Read |
|---|---|
| Starting any motion task | `references/project-audit.md`, `references/decision-rules.md` |
| Choosing CSS vs Angular vs GSAP | `references/implementation-selection.md` |
| Element enters/leaves the DOM | `references/angular-lifecycle.md`, `examples/angular-enter-leave.md` |
| GSAP is the chosen engine | `references/gsap.md`, `examples/gsap-context.md` |
| Sequence, stagger, overlap | `examples/gsap-timeline.md` |
| Responsive / capability-dependent motion | `examples/gsap-match-media.md` |
| Durations, easings, distances | `references/motion-tokens.md` |
| Reduced motion, focus, keyboard | `references/accessibility.md`, `examples/reduced-motion.md` |
| Jank, layout thrash, pointer lag | `references/performance.md` |
| Reviewing or polishing existing motion | `references/anti-patterns.md`, `references/motion-tokens.md` |
| Motion spec came from Figma | `references/figma-motion.md` |
| Before reporting done | `references/verification.md` |
| A specific UI element | `references/patterns/README.md` → the matching pattern |

A typical modal task reads five: `project-audit`, `decision-rules`, `patterns/modal`, `angular-lifecycle`, `verification`. The first two and the last are the mandatory spine of every motion task; everything else is loaded on demand. Do not read the whole catalog.
