# `gsap.matchMedia()` — conditional motion

For motion that differs by reduced-motion preference, breakpoint, or pointer capability. GSAP reverts a block's animations automatically when its condition stops matching — hand-rolled `window.matchMedia` listeners almost never get that right.

## Combined conditions

```ts
constructor() {
  afterNextRender(() => {
    const el = this.host.nativeElement;
    const mm = gsap.matchMedia(el);

    mm.add({
      desktop: '(min-width: 768px)',
      mobile:  '(max-width: 767px)',
      fine:    '(pointer: fine)',
      motion:  '(prefers-reduced-motion: no-preference)',
    }, (ctx) => {
      const { desktop, fine, motion } = ctx.conditions as Record<string, boolean>;

      if (!motion) {
        gsap.fromTo('.card', { opacity: 0 }, { opacity: 1, duration: D.quick });
        return;
      }

      gsap.fromTo('.card',
        { opacity: 0, y: desktop ? D_DIST.large : D_DIST.base },
        { opacity: 1, y: 0, duration: desktop ? D.medium : D.fast, ease: E.smoothOut,
          stagger: desktop ? D.stagger : 0 });

      if (desktop && fine) { /* pointer-driven extras only here */ }
    });

    this.destroyRef.onDestroy(() => mm.revert());
  });
}
```

`ctx.conditions` tells you which queries matched. The callback re-runs when the combination changes, and the previous run's animations are reverted first.

## Desktop popover → mobile sheet

The same component, two genuinely different interaction models. Don't scale one animation down; switch patterns.

```ts
mm.add('(min-width: 768px)', () => {
  // anchored surface: scale from the trigger
  gsap.fromTo(panel, { opacity: 0, scale: 0.97, y: -4 },
                     { opacity: 1, scale: 1, y: 0, duration: D.fast, ease: E.smoothOut });
});

mm.add('(max-width: 767px)', () => {
  // bottom sheet: travel from the edge
  gsap.fromTo(panel, { yPercent: 100 },
                     { yPercent: 0, duration: D.slow, ease: E.smoothOut });
});
```

Anchoring, transform-origin, and travel distance all change. That is correct — see `references/decision-rules.md`.

## Per-condition cleanup

Return a function from the callback for anything GSAP doesn't own (listeners, observers):

```ts
mm.add('(pointer: fine)', () => {
  const onMove = (e: PointerEvent) => { /* … */ };
  el.addEventListener('pointermove', onMove, { passive: true });
  return () => el.removeEventListener('pointermove', onMove);
});
```

It runs when the condition stops matching **and** on `mm.revert()`.

## Rules

- Scope it: `gsap.matchMedia(hostElement)` so string selectors stay local.
- Always `mm.revert()` on destroy.
- Prefer `(prefers-reduced-motion: no-preference)` for the full branch and an explicit `reduce` branch over conditionals inside one block — it makes the reduced behavior reviewable.
- Gate pointer-driven effects on `(pointer: fine)`; coarse pointers gain nothing and pay the cost.
- Don't duplicate the same animation across branches just to change one number — use `ctx.conditions` and a ternary.
- CSS media queries are still the answer for level-1 motion. This is for JS-driven motion only.
