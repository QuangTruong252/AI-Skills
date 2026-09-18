# Reduced motion — worked variants

Rules live in `references/accessibility.md`. This file is the code.

## CSS — per-motion override

```scss
.dropdown-enter { animation: dd-in var(--duration-fast) var(--ease-smooth-out); }
@keyframes dd-in { from { opacity: 0; transform: scale(var(--scale-medium)) translateY(calc(-1 * var(--distance-base))); } }

@media (prefers-reduced-motion: reduce) {
  .dropdown-enter { animation: dd-in-reduced var(--duration-quick) var(--ease-out); }
}
@keyframes dd-in-reduced { from { opacity: 0; } }   // no scale, no travel — opacity survives
```

The reduced variant is not `animation: none`. The surface still *appears*, just without movement.

## CSS — transition variant

```scss
.card { transition: transform var(--duration-quick) var(--ease-out),
                    box-shadow var(--duration-quick) var(--ease-out);
        &:hover { transform: translateY(-4px); } }

@media (prefers-reduced-motion: reduce) {
  .card { transition-property: box-shadow; &:hover { transform: none; } }
}
```

Drop the transform, keep the affordance.

## GSAP — `matchMedia`

```ts
const mm = gsap.matchMedia(host);

mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.fromTo('.row', { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: D.fast, ease: E.smoothOut, stagger: D.stagger });
});

mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.fromTo('.row', { opacity: 0 }, { opacity: 1, duration: D.quick });  // together, no travel
});

this.destroyRef.onDestroy(() => mm.revert());
```

## `animate.leave` — the trap

```ts
protected onLeave(e: AnimationCallbackEvent): void {
  if (this.reducedMotion()) {
    gsap.to(e.target, { opacity: 0, duration: D.quick, onComplete: () => e.animationComplete() });
    return;                       // ← still completed. Forgetting this hangs the node for 4s.
  }
  gsap.to(e.target, {
    opacity: 0, scale: 0.96, y: 8, duration: D.quick, ease: E.smoothOut,
    onComplete: () => e.animationComplete(),
  });
}
```

## Reading the preference in TypeScript

Only when a template or a non-GSAP branch needs it. If GSAP is the engine, use `matchMedia` above instead.

```ts
// shared/motion/reduced-motion.ts
export function prefersReducedMotion(): Signal<boolean> {
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  const state = signal(query.matches);
  const onChange = (e: MediaQueryListEvent) => state.set(e.matches);
  query.addEventListener('change', onChange);
  inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
  return state.asReadonly();
}
```

Call it in an injection context. Guard with `afterNextRender` or an `isPlatformBrowser` check if the app is server-rendered.

Reuse an existing project service if one exists — don't add a second one.

## Per-pattern reduced behavior

| Pattern | Full | Reduced |
|---|---|---|
| Modal | opacity + scale 0.96 | opacity only |
| Dropdown | opacity + scale + 8px travel | opacity only |
| Drawer | slide from edge | short opacity fade — direction is conveyed by position, not travel |
| Accordion | height + content fade | height only, shortened; or instant with a fade |
| Toast | rise + fade | fade |
| Tabs indicator | slide between segments | instant move (the position *is* the information) |
| Stagger reveal | per-item offset | all at once, one fade |
| Counter | digit roll | set the final value |
| Card tilt | 3D follow | disabled |
| Parallax | scroll-linked movement | disabled |
| Skeleton shimmer | animated gradient | static base color |
| Streaming text | per-token fade | plain append |
| Error shake | 3 shake segments | static error styling + `aria-live` |
| Success check | draw + pop | static check, brief fade |

The pattern the table never contains: "same animation, `duration: 0`".

## Loops under reduced motion

```scss
@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; background: var(--skeleton-base); }
  .spinner { animation-duration: 1.6s; }   // a spinner may keep spinning — slower, non-strobing
}
```

Progress indicators are the one place continuous motion is often still correct: it communicates "working". Slow it, don't kill it.
