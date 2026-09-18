# Verification

Run before reporting the task done. Report honestly what you checked and what you couldn't.

## Functional

- [ ] Enter animation plays on first appearance.
- [ ] Exit animation plays and the element actually leaves the DOM afterwards.
- [ ] **Rapid toggle**: open/close 5× fast. No stuck element, no doubled node, no state desync, no element left at `opacity: 0`.
- [ ] **Interrupt**: close while opening. Motion resolves from its current value rather than snapping (only required where the interaction is reversible).
- [ ] **Re-open**: the element is in its correct starting state, not frozen at the previous exit values.
- [ ] **Resting state after the enter class is removed**: the element is still visible and correct. Angular strips `animate.enter` classes on completion — a base rule of `opacity: 0` makes it animate in and then vanish. Check child animations too (a drawn checkmark must stay drawn).
- [ ] No leftover inline styles after the animation ends (inspect the element).
- [ ] Works when the component is rendered more than once on a page.
- [ ] Works with the list re-ordered / re-keyed, if it's in a `@for`.

## Angular

- [ ] `animate.leave` handlers call `animationComplete()` on **every** path, including reduced-motion and early returns.
- [ ] No `setTimeout` deciding lifecycle.
- [ ] No `document.querySelector`.
- [ ] No `@angular/animations` added to new code; no mixing with `animate.*` in one component.
- [ ] `gsap.context()` reverted in `DestroyRef.onDestroy`.
- [ ] Destroy the component mid-animation (navigate away while it plays) — no console error, no orphaned timeline, no leaked listener.
- [ ] Nothing runs on the server (`afterNextRender` used for anything touching `window`).
- [ ] Signals still own state; the animation reads state, it doesn't own it.

## Accessibility

- [ ] Reduced motion enabled → the interaction is still comprehensible, not just faster.
- [ ] The reduced branch was reasoned about per-property, not set to `duration: 0` wholesale.
- [ ] Focus moves at state-change time; a dialog is focused immediately on open.
- [ ] Focus returns to the trigger on close.
- [ ] `Escape` dismisses instantly.
- [ ] Tab order is unaffected by animation; nothing invisible is focusable.
- [ ] `aria-live` / `role` behavior is tied to state, not to animation completion.
- [ ] Nothing flashes >3×/second.

## Performance

- [ ] Only `transform` / `opacity`, or a justified exception.
- [ ] No `transition: all`.
- [ ] No permanent `will-change`.
- [ ] Layout reads batched; rects cached for pointer-driven motion.
- [ ] Pointer handlers passive and allocation-free; `quickTo` not per-event tweens.
- [ ] No infinite tween without an owner.
- [ ] No per-frame change detection.
- [ ] Profile once on a throttled CPU (6× slowdown) if the motion is continuous or involves >10 elements.

## Scope

- [ ] Only files the motion required were touched.
- [ ] No component API change, no state refactor, no unrelated SCSS migration.
- [ ] No new dependency added without asking.
- [ ] No second token system, no new motion framework directory.
- [ ] Existing project conventions followed.

## Report

Close with the decision line and anything you couldn't verify:

```
Level 2 — modal enter/leave via animate.enter/leave + CSS, tokens from src/styles/_motion.scss.
Verified: rapid toggle, destroy-mid-animation, reduced motion, Escape.
Not verified: low-end mobile profiling (no device).
```
