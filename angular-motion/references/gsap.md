# GSAP

Read only after `implementation-selection.md` put the task at level 3 or 4.

GSAP animates. Angular decides existence and lifecycle. Every GSAP object created in a component must die with it.

## Availability

Check `package.json` first. If GSAP is absent, do **not** install it as a side effect of an animation ticket — see `project-audit.md` → *Dependency decisions*.

## API selection

| Need | API |
|---|---|
| One-shot animation to a target state | `gsap.to(el, {…})` |
| Animate in from an off state, element already visible | `gsap.from(el, {…})` |
| Both ends explicit (enter animations, replayable) | `gsap.fromTo(el, from, to)` |
| Sequenced / overlapping / staggered set | `gsap.timeline()` |
| High-frequency single property (pointer, scroll) | `gsap.quickTo(el, 'x', {…})` |
| High-frequency with no tweening at all | `gsap.quickSetter(el, 'x', 'px')` |
| Conditional motion by media query / capability | `gsap.matchMedia()` |
| Scoping + cleanup | `gsap.context(fn, scopeEl)` |
| Scroll-driven | `ScrollTrigger` (registered once, created inside a context) |

### Tween

```ts
gsap.fromTo(el,
  { opacity: 0, y: 8 },
  { opacity: 1, y: 0, duration: MOTION_DURATION.fast, ease: MOTION_EASE.smoothOut }
);
```

Prefer `fromTo` for enter animations — `from` leaves the element's resting state implicit and misbehaves when it re-runs.

### Timeline

One sequence = one timeline. Not three tweens with hand-tuned `delay`s.

```ts
const tl = gsap.timeline({ defaults: { ease: MOTION_EASE.smoothOut } });
tl.to(backdrop, { opacity: 1, duration: MOTION_DURATION.quick })
  .fromTo(dialog, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: MOTION_DURATION.fast }, '-=0.05')
  .fromTo(rows, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: MOTION_DURATION.stagger }, '<0.05');
```

Position parameters (`'<'`, `'-=0.05'`, `'>'`) express overlap. Keep the whole thing reversible: build it **paused** and drive it with `play()` / `reverse()` when the interaction is a toggle. That gives correct behavior on rapid open/close for free.

```ts
this.tl = gsap.timeline({ paused: true }) /* … */;
// open  → this.tl.play()
// close → this.tl.reverse()
```

### quickTo / quickSetter

A new `gsap.to()` per `pointermove` allocates a tween 60+ times a second and fights itself. Create the setter once:

```ts
const xTo = gsap.quickTo(card, 'x', { duration: 0.4, ease: 'power3' });
const yTo = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power3' });
// in the handler:
xTo(dx); yTo(dy);
```

`quickSetter` when there should be no easing at all (cursor that must sit exactly under the pointer).

Pair with a passive listener and let GSAP's ticker do the throttling — do not add your own `requestAnimationFrame` loop on top.

### matchMedia

Use for anything conditional: reduced motion, breakpoint, pointer capability. Each block's animations are reverted automatically when its condition stops matching.

```ts
const mm = gsap.matchMedia();
mm.add({
  desktop: '(min-width: 768px) and (pointer: fine)',
  reduced: '(prefers-reduced-motion: reduce)',
}, (ctx) => {
  const { desktop, reduced } = ctx.conditions as Record<string, boolean>;
  if (reduced) { gsap.set(el, { opacity: 1, clearProps: 'transform' }); return; }
  gsap.fromTo(el, { opacity: 0, y: desktop ? 24 : 8 }, { opacity: 1, y: 0, duration: 0.25 });
});
this.destroyRef.onDestroy(() => mm.revert());
```

Do not hand-roll `window.matchMedia` listeners when `gsap.matchMedia` is available — it handles revert on condition change, which manual listeners almost always get wrong.

### context

```ts
const ctx = gsap.context(() => {
  gsap.to('.row', { opacity: 1, stagger: 0.04 }); // '.row' is scoped to the host
}, this.host.nativeElement);

this.destroyRef.onDestroy(() => ctx.revert());
```

Two jobs: selector scoping (so string selectors cannot escape the component) and one-call cleanup. `revert()` also removes the inline styles GSAP wrote — use it over `kill()`.

`gsap.matchMedia()` can take a scope too: `gsap.matchMedia(this.host.nativeElement)`.

## Rules

1. Durations in **seconds** (GSAP), milliseconds in CSS. `MOTION_DURATION` in `motion-tokens.md` is in seconds. The two representations live in one file and are edited together — see `motion-tokens.md` → *Fallback definitions*.
1b. **GSAP does not parse `cubic-bezier()` strings.** `ease: 'cubic-bezier(0.22, 1, 0.36, 1)'` silently falls back to the default ease. Use GSAP's named eases (`power4.out`, `back.out(1.4)`, `none`), or register `CustomEase` if exact parity with a CSS curve is required.
2. Animate `x`/`y`/`scale`/`rotation`/`opacity` — GSAP's transform shorthands compose correctly. Do **not** write `transform: 'translateX(…)'` as a string.
3. `overwrite: 'auto'` when a tween can be re-triggered before it finishes.
4. Register plugins once at app bootstrap or in a shared module file, never per-component: `gsap.registerPlugin(ScrollTrigger)`.
5. Never animate a `signal()` value from a tween's `onUpdate` on every frame — that triggers change detection 60×/s. Write to the DOM via GSAP and keep Angular out of the frame loop.
6. `clearProps: 'transform'` (or `ctx.revert()`) when the element must return to CSS-owned styling afterwards, otherwise inline transforms shadow your stylesheet forever.
7. Infinite tweens (`repeat: -1`) need an owner that kills them. A shimmer loop is almost always better as CSS.
8. Don't use GSAP's `delay` to sequence things that belong in one timeline.

## Cleanup

Every level-3/4 component ends with this shape:

```ts
private readonly host = inject(ElementRef<HTMLElement>);
private readonly destroyRef = inject(DestroyRef);

constructor() {
  afterNextRender(() => {
    const ctx = gsap.context(() => { /* … */ }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  });
}
```

If the component is destroyed mid-timeline, `ctx.revert()` kills it and unwinds the inline styles. Nothing is left running and nothing is left frozen.

→ `examples/gsap-context.md`, `examples/gsap-timeline.md`, `examples/gsap-match-media.md`
