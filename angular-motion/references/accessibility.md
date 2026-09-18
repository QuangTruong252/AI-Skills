# Accessibility

Motion that is inaccessible is not done. This is a requirement, not a polish step.

## Reduced motion is a spectrum, not an off switch

`duration: 0` everywhere is the lazy answer and it is often the wrong one: state changes become instantaneous jump-cuts, and users lose the cue that told them something appeared.

Decide per interaction:

| Motion component | Under `prefers-reduced-motion: reduce` |
|---|---|
| Large translation | Remove, or cut to ≤4px |
| Scale | Remove |
| Rotation / 3D / tilt | Remove |
| Parallax, scroll-linked movement | Remove |
| Stagger | Remove — all items appear together |
| Blur | Remove |
| Auto-playing loops (shimmer, pulse, spin) | Replace with a static or very low-contrast state; a spinner may keep rotating, a shimmer should not |
| Opacity | **Keep**, shortened to `quick` |
| Color / background transitions | Keep |
| Position changes that carry meaning (drawer arriving from the left) | Keep a short opacity change so the arrival is still perceptible |

The test: with reduced motion on, can the user still tell *what changed and where it came from*? If not, you removed too much.

## CSS

Scope the guard to the motion, not to the whole stylesheet.

```css
.dialog-enter {
  animation: dialog-in var(--duration-fast) var(--ease-smooth-out);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter { animation: dialog-in-reduced var(--duration-quick) var(--ease-out); }
}

@keyframes dialog-in          { from { opacity: 0; transform: scale(.96) translateY(8px); } }
@keyframes dialog-in-reduced  { from { opacity: 0; } }
```

Do **not** ship the blanket `* { animation-duration: 0.01ms !important }` reset into an app stylesheet. It is a demo-page hack; it breaks `animate.leave` timing detection and any legitimate loading indicator.

## GSAP

`gsap.matchMedia()` — the reduced branch reverts automatically if the user changes the OS setting mid-session.

```ts
const mm = gsap.matchMedia(this.host.nativeElement);
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.fromTo(rows, { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.25 });
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.fromTo(rows, { opacity: 0 }, { opacity: 1, duration: 0.15 }); // no travel, no stagger
});
this.destroyRef.onDestroy(() => mm.revert());
```

In an `animate.leave` handler, the reduced branch **must still call `animationComplete()`**:

```ts
protected onLeave(e: AnimationCallbackEvent): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to(e.target, { opacity: 0, duration: 0.15, onComplete: () => e.animationComplete() });
    return;
  }
  /* full animation … */
}
```

Never early-return without completing — the node will hang for 4 seconds.

## Beyond reduced motion

### Focus

- Focus moves **immediately**. Never wait for an enter animation to finish before focusing a dialog. Move focus on open; let the motion play around the already-focused element.
- Return focus to the trigger on close, at the moment of close, not after the exit animation.
- Never animate `outline` or `:focus-visible` away, and never `transition: all` over a focus ring.
- An element being animated must remain focusable throughout. `opacity: 0` elements still receive focus — use `visibility` or remove them from the DOM.

### Keyboard

- `Escape` must dismiss instantly. If a close animation is playing, the state is already closed — the animation is cosmetic.
- Rapid keyboard toggling must not corrupt state (see `verification.md`).
- Motion must never add latency between keypress and the state change. Animate the result, don't gate it.

### Screen readers

- An element animating **in** should already be in the accessibility tree with its final semantics. Don't toggle `aria-hidden` on animation completion.
- `aria-live` announcements fire when the state changes, not when the animation ends.
- Toasts: `role="status"` (polite) for informational, `role="alert"` for errors. The animation does not affect this.

### Vestibular safety

Avoid, unless a design explicitly requires it and the reduced-motion branch removes it:

- Full-viewport movement or zoom.
- Parallax with large displacement.
- Spinning, rotating, or flipping large surfaces.
- Repeated looping motion in the user's peripheral vision.

### Photosensitivity

Nothing flashes more than three times per second. Applies to skeleton pulses, notification badges, and error shakes — which should run once, not repeat.

## Checklist

- [ ] A reduced-motion branch exists and was reasoned about, not copy-pasted.
- [ ] The interaction is still comprehensible with reduced motion on.
- [ ] `animationComplete()` is called on every path, including the reduced one.
- [ ] Focus moves at state-change time, not animation-end time.
- [ ] `Escape` / close is instant.
- [ ] No flashing above 3Hz.
- [ ] Focus indicators are never animated out.
