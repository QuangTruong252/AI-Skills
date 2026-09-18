# Performance

## Property cost

**Prefer** — compositor-only, no layout, no paint:

```
transform (translate / scale / rotate)
opacity
```

**Be careful with** — these cost layout and/or paint every frame. Not banned; understand the cost and keep the animated area small.

| Property | Cost | Cheaper alternative |
|---|---|---|
| `width` / `height` | Layout | `transform: scale()`, or `grid-template-rows: 0fr → 1fr` for intrinsic height |
| `top` / `left` / `right` / `bottom` | Layout | `transform: translate()` |
| `margin` / `padding` | Layout | `transform`, or animate an inner wrapper |
| `filter: blur()` | Paint, GPU-heavy | Small areas only; drop under reduced motion |
| `box-shadow` | Paint | Animate `opacity` on a pseudo-element holding the shadow |
| `background-position` | Paint | Fine for shimmer on a small element; not full-page |
| `border-radius` | Paint | Usually fine, small elements |
| `clip-path` | Paint | Acceptable for reveals; avoid on large surfaces |

`grid-template-rows` and `height: auto` interpolation (`interpolate-size: allow-keywords` + `calc-size()`) do cost layout — but for an accordion that is the correct trade, because the alternative is measuring in JS and getting it wrong.

## Rules

1. **Never `transition: all`.** List the properties. `all` animates things you didn't intend, including properties a future stylesheet adds.
2. **`will-change` is a last resort.** Apply it to at most a handful of elements, only when profiling shows a problem, and remove it when the animation ends. A permanent `will-change: transform` on every card creates a compositor layer per card and costs memory.
3. **Animate the smallest element that produces the effect.** Move the badge dot, not the button. Move the panel's inner content, not the scroll container.
4. **Don't animate inside a scroll container** during scroll unless the animation is the scroll effect.
5. **One compositor layer per moving thing**, not per child. Staggering 200 items creates 200 layers — virtualize or cap the animated set to what's in view.
6. **Cap staggered sets.** More than ~20 simultaneously animating elements is a smell. Animate the visible window.

## Layout reads

If you must measure:

```ts
// Read all, then write all. Never interleave.
const rects = items.map((el) => el.getBoundingClientRect()); // reads
gsap.set(items, { y: (i) => rects[i].top - target });        // writes
```

Interleaving `getBoundingClientRect()` and a style write in the same loop forces a synchronous layout per iteration — the classic thrash.

- Measure once, cache, invalidate on resize (debounced) — not on every pointer move.
- Use `afterNextRender({ read: … })` so the read happens in Angular's read phase.
- `ResizeObserver` beats polling `offsetWidth`.

## Pointer-driven motion

- One `pointermove` listener, `{ passive: true }`.
- Compute from a **cached** `getBoundingClientRect()`, refreshed on `pointerenter` and on resize.
- Use `gsap.quickTo` / `quickSetter`. Never construct a tween per event.
- No allocation in the handler: no object literals passed to GSAP, no array `map`, no closures created per event.
- Remove the listener on `pointerleave` for hover-scoped effects, and always on destroy.
- Disable entirely on `(pointer: coarse)` — touch devices get no benefit and pay the cost.

## Angular-specific

- **Never write to a signal from a per-frame `onUpdate`.** That runs change detection 60×/s. GSAP writes to the DOM directly; keep Angular out of the frame loop.
- Components hosting continuous motion should use `ChangeDetectionStrategy.OnPush` (they should anyway).
- Don't bind a template expression to a value that changes every frame (`[style.transform]="computeTilt()"`) — that's a change-detection-driven animation.
- Long `animate.leave` animations delay node removal. Keep exits short; that also matches the token guidance.

## Loops

- Prefer infinite CSS `animation` over a GSAP `repeat: -1` for shimmer/pulse/spin. It runs off the main thread when it only touches `transform`/`opacity`, and browsers *may* throttle or skip it when the element isn't rendered — that is an optimisation, not a guarantee. Don't rely on it: if the loop is expensive, gate it with an `IntersectionObserver` and measure.
- An infinite GSAP tween runs until killed, on the main thread, whether or not it's visible. If you must use one, kill it on destroy and pause it when off-screen.
- Never animate a skeleton for a list of 500 rows. Animate a container gradient, or virtualize.

## When it's slow

1. Record a Performance profile while the animation runs.
2. Green frames with long "Recalculate Style" / "Layout" bars → you're animating a layout property, or reading layout in the loop.
3. Long "Paint" → filter, shadow, or a large repainting area.
4. Long "Scripting" → per-frame JS, signal writes, or per-event tween creation.
5. Dropped frames only on low-end/mobile → cut the animated element count, or gate the effect behind `(pointer: fine)` / a breakpoint.

## Checklist

- [ ] `transform` / `opacity` unless justified.
- [ ] No `transition: all`.
- [ ] No permanent `will-change`.
- [ ] Layout reads batched and cached.
- [ ] Pointer handlers passive, allocation-free, using `quickTo`.
- [ ] No per-frame signal writes.
- [ ] Infinite animations owned and killed.
- [ ] Animated element count bounded.
