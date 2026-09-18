# Text reveal / staggered entry

## Intent

A group of elements appearing with rhythm rather than all at once. The motion says *"read this in this order"*. Hero copy, feature lists, card grids, dashboard sections, search results.

## Do not use when

- The content is above the fold on every load and the user is trying to *use* it, not read it — a staggered settings form is an obstacle.
- The items are a single semantic unit → fade them together.
- The list is long or virtualized → animate nothing, or only the first screenful.
- Content streams in over time → [streaming-text](streaming-text.md).

## Motion characteristics

| | Value |
|---|---|
| Per-item offset | `stagger` (40ms) |
| Item duration | `fast` (250ms) |
| Easing | `smoothOut` |
| Opacity | 0 → 1 |
| Translate | `distance-base`–`medium` up |
| Blur | optional `blur-small` → 0 |
| Start spread | **≤ 300ms** regardless of item count |
| Wall-clock total | start spread + item duration (≈300 + 250 = 550ms) |

The cap on the **start spread** is the rule that matters. With 12 items at 40ms each the last one *starts* at 440ms — too late. `stagger: { amount: 0.3 }` fixes the spread at 300ms however many items there are.

Be precise about which number you mean: `amount` distributes the **start times** over that window. The last item still runs for its own duration afterwards, so the group finishes at `amount + duration`, not at `amount`.

Exit: no stagger. Groups leave together, fast.

## Preferred implementation

1. **Level 1** — CSS `animation-delay` per `:nth-child`, when the item count is fixed and the list never re-orders. Zero JS.
2. **Level 4** — GSAP timeline with `stagger`, when the count is dynamic, items re-order, the reveal is scroll-triggered, or a follow-on step depends on completion.
3. **Level 2** — `animate.enter` with a CSS delay works for a `@for` list, but each item's delay would have to come from its index via a style binding. Acceptable for small static lists; prefer level 4 for real ones.

## Angular lifecycle considerations

- `@for` with a stable `track`. Index tracking plus stagger produces visibly wrong animations when the list changes.
- **Don't re-run the reveal on every list change.** Reveal on first appearance only; subsequent items entering use a plain fade. Guard with a flag or use `animate.enter` per item (which naturally only fires on insertion).
- `viewChildren` gives you the elements; the signal updates when the list changes.
- Scroll-triggered reveals: `IntersectionObserver` (level 1/2) is enough for "fade in when visible". ScrollTrigger is for scrubbed, progress-linked motion. Disconnect the observer on destroy.
- Never reveal content that is already visible on load below a spinner — the user sees it twice.

## GSAP considerations

- `stagger: { amount: 0.3 }` (fixed start spread) over `stagger: 0.04` (fixed per-item offset) for variable-length lists. `amount` is the spread, not the wall-clock total.
- `stagger: { amount: 0.3, from: 'start' }`; `from: 'center'` / grid staggers exist but need a design reason.
- Use `fromTo`, not `from` — `from` breaks when the tween re-runs.
- One timeline for the whole group, not one tween per item.
- `ctx.revert()` on destroy, or items destroyed mid-reveal keep `opacity: 0` inline.

## Reduced motion

All items appear **together**, one short opacity fade (`quick`). No stagger, no travel, no blur. The rhythm is decorative; the appearance is not.

## Common mistakes

- Total stagger over ~300ms.
- Re-running the reveal whenever the array reference changes.
- Staggering a form or a data table the user needs to act on.
- Items stuck at `opacity: 0` because the tween never ran (component destroyed, observer never fired, or the element was off-screen).
- A `from` tween that leaves the resting state undefined.
- Staggering 200 rows — 200 compositor layers.
- Staggering the exit of a group.
- Scroll reveal with no rationale, on content the user scrolled to deliberately.

## Example

Static list — CSS only:

```scss
.reveal > * {
  animation: reveal var(--duration-fast) var(--ease-smooth-out) both;
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) { animation-delay: calc(#{$i - 1} * var(--duration-stagger)); }
  }
}
@keyframes reveal { from { opacity: 0; transform: translateY(var(--distance-base)); } }

@media (prefers-reduced-motion: reduce) {
  .reveal > * { animation: fade-in var(--duration-quick) both; animation-delay: 0s !important; }
}
```

Dynamic list — GSAP, revealed once on entry:

```ts
export class CardGrid {
  readonly cards = input.required<Card[]>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly items = viewChildren<ElementRef<HTMLElement>>('card');

  constructor() {
    afterNextRender(() => {
      const mm = gsap.matchMedia(this.host.nativeElement);
      const els = this.items().map((i) => i.nativeElement);

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(els,
          { opacity: 0, y: MOTION_DISTANCE.medium },
          { opacity: 1, y: 0, duration: MOTION_DURATION.fast,
            ease: MOTION_EASE.smoothOut, stagger: { amount: 0.3 } });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: MOTION_DURATION.quick });
      });

      this.destroyRef.onDestroy(() => mm.revert());
    });
  }
}
```

Runs once after the first render. Items added later enter via their own `animate.enter` fade — no re-stagger.
