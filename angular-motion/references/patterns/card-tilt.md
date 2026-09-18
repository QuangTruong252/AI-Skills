# Card tilt / pointer-following motion

## Intent

A surface responding continuously to pointer position. The motion says *"this is a physical object you're touching"*. Feature cards, product tiles, hero images, magnetic buttons, custom cursors, spotlight/glow effects.

## Do not use when

- The surface is a dense content card the user is reading — tilting text is hostile.
- It's a form control, a table row, or anything in a workflow. This is a marketing/showcase pattern.
- The primary input is touch. Coarse pointers get nothing from it.
- It's the only motion on the page and there's no design rationale for it.

## Motion characteristics

| | Value |
|---|---|
| Rotation | ±8–12° maximum |
| Perspective | 600–1000px on the parent |
| Follow duration | 0.3–0.5s (`power3` out) — a lag, not a delay |
| Return on leave | `fast`–`medium`, same easing |
| Scale on hover | optional, `scale-tiny`–`scale-small` inverse (1 → 1.02) |
| Glare/spotlight | a positioned radial gradient, opacity `quick` |

The "lag" is what sells it: the card chases the pointer rather than being welded to it. That's what `quickTo`'s duration provides. A zero-duration follow feels mechanical.

Beyond ~15° the card looks broken and text becomes unreadable.

## Preferred implementation

1. **Level 3** — GSAP with `quickTo`. This is the canonical gate case: high-frequency pointer input plus runtime geometry.
2. **Level 1** — a CSS-only variant is possible with a `pointermove` handler writing two custom properties and a `transition` on `transform`. It works, but the transition fights the continuous updates and the result is mushier. Acceptable if GSAP isn't available.
3. **Level 4** — no. There is no sequence.

## Angular lifecycle considerations

- A **directive** is the right shape here if more than one component needs it — check for an existing one first. One consumer: keep it in the component.
- Gate everything behind `gsap.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')`. On coarse pointers the listeners should never be attached at all.
- Listeners on the **host element**, not `document`. `{ passive: true }`.
- Cache the bounding rect on `pointerenter`; refresh on `ResizeObserver`, never per move.
- Remove listeners in the `matchMedia` callback's returned cleanup **and** on destroy (`mm.revert()` runs both).
- Never write pointer position into a signal. See `performance.md`.
- The card must remain fully keyboard-accessible; tilt is decorative and has no keyboard equivalent, which is fine.

## GSAP considerations

- `gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' })` — created **once** per property, reused every event.
- Use `quickSetter` only for things that must sit exactly under the pointer (a custom cursor).
- `transformPerspective` on the element, or `perspective` on the parent. Both work; be consistent.
- `gsap.set(el, { transformStyle: 'preserve-3d' })` if children need to sit at different depths.
- `ctx.revert()` / `mm.revert()` clears the inline transforms so the card returns to its CSS resting state.
- One `matchMedia` instance per component, not per card in a grid — attach the directive per card instead.

## Reduced motion

**Disabled entirely.** No tilt, no parallax, no glare tracking. A static hover effect (shadow, border, a 2px lift) is the correct substitute. Also disable on `(pointer: coarse)` regardless of motion preference.

## Common mistakes

- `gsap.to()` inside the `pointermove` handler — a new tween 60×/s.
- `getBoundingClientRect()` inside the move handler — layout read per frame.
- Listeners on `document` instead of the element.
- Listeners never removed; the card is destroyed and the handler still fires.
- Rotation beyond 15°.
- Tilting a card full of body text.
- No `(pointer: fine)` gate — mobile pays the cost for nothing.
- Object allocation per event (a `{ x, y }` literal, a `map`, a closure).
- A signal write per frame.
- Running it on 40 cards in a grid simultaneously.

## Example

```ts
@Directive({ selector: '[appTilt]' })
export class TiltDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxTilt = input(10, { alias: 'appTilt', transform: numberAttribute });

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const mm = gsap.matchMedia(el);

      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const max = this.maxTilt();
        const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
        const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });

        gsap.set(el, { transformPerspective: 800 });

        let rect = el.getBoundingClientRect();
        const ro = new ResizeObserver(() => (rect = el.getBoundingClientRect()));
        ro.observe(el);

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e: PointerEvent) => {
          rotY(((e.clientX - rect.left) / rect.width  - 0.5) * 2 * max);
          rotX(((e.clientY - rect.top)  / rect.height - 0.5) * -2 * max);
        };
        const onLeave = () => { rotX(0); rotY(0); };

        el.addEventListener('pointerenter', onEnter, { passive: true });
        el.addEventListener('pointermove',  onMove,  { passive: true });
        el.addEventListener('pointerleave', onLeave, { passive: true });

        return () => {
          ro.disconnect();
          el.removeEventListener('pointerenter', onEnter);
          el.removeEventListener('pointermove',  onMove);
          el.removeEventListener('pointerleave', onLeave);
        };
      });

      this.destroyRef.onDestroy(() => mm.revert());
    });
  }
}
```

Two setters created once; the handler does arithmetic only — no allocation, no layout read, no tween construction. Outside `(pointer: fine)` with motion allowed, nothing is attached at all.
