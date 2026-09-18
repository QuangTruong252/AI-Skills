# Level 3 — GSAP tween in an Angular component

The canonical shape. Copy the skeleton, replace the tweens.

## Skeleton

```ts
import {
  afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { MOTION_DURATION, MOTION_EASE } from '../motion.tokens';

@Component({
  selector: 'app-thing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #target class="thing"><ng-content /></div>`,
})
export class Thing {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const ctx = gsap.context(() => {
        gsap.fromTo('.thing',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: MOTION_DURATION.fast, ease: MOTION_EASE.smoothOut });
      }, this.host.nativeElement);

      this.destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
```

`gsap.context(fn, scope)` does two things: string selectors inside resolve **within the host only**, and `revert()` kills every animation created inside *and* removes the inline styles GSAP wrote.

`afterNextRender` guarantees the DOM exists and never runs on the server.

## Pointer-driven — `quickTo`

The wrong version creates a tween 60 times a second:

```ts
// ✗
onMove(e: PointerEvent) { gsap.to(this.card, { x: e.clientX, duration: 0.4 }); }
```

The right version creates two setters once and caches the rect:

```ts
export class TiltCard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const mm = gsap.matchMedia(el);

      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
        const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });
        let rect = el.getBoundingClientRect();

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e: PointerEvent) => {
          rotY(((e.clientX - rect.left) / rect.width  - 0.5) * 12);
          rotX(((e.clientY - rect.top)  / rect.height - 0.5) * -12);
        };
        const onLeave = () => { rotX(0); rotY(0); };

        el.addEventListener('pointerenter', onEnter, { passive: true });
        el.addEventListener('pointermove',  onMove,  { passive: true });
        el.addEventListener('pointerleave', onLeave, { passive: true });

        // matchMedia cleanup: returned fn runs on revert or when the query stops matching
        return () => {
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

The rect is read on `pointerenter` and never inside the move handler — no layout read per frame. The handler allocates nothing.

## Driving a tween from a signal

```ts
export class ProgressRing {
  readonly value = input.required<number>();           // 0–1
  private readonly arc = viewChild.required<ElementRef<SVGCircleElement>>('arc');

  constructor() {
    const length = 2 * Math.PI * 20;
    effect(() => {
      const v = this.value();
      gsap.to(this.arc().nativeElement, {
        strokeDashoffset: length * (1 - v),
        duration: MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
        overwrite: 'auto',      // a new value mid-flight resolves from the current position
      });
    });
  }
}
```

`overwrite: 'auto'` is what makes rapid updates behave. Without it the tweens fight.

## Interruptible toggle

Build once, paused; play and reverse. This is free interruption handling.

```ts
private tl?: gsap.core.Timeline;

constructor() {
  // effect() needs an injection context — declare it in the constructor body,
  // not inside the afterNextRender callback.
  effect(() => (this.open() ? this.tl?.play() : this.tl?.reverse()));

  afterNextRender(() => {
    const ctx = gsap.context(() => {
      this.tl = gsap.timeline({ paused: true })
        .fromTo('.menu', { opacity: 0, y: -8 },
                         { opacity: 1, y: 0, duration: MOTION_DURATION.fast, ease: MOTION_EASE.smoothOut });
    }, this.host.nativeElement);

    if (this.open()) this.tl?.play();          // catch up if it opened before first render
    this.destroyRef.onDestroy(() => ctx.revert());
  });
}
```

`effect()`, `afterNextRender()`, and `inject()` all require an injection context — the constructor body, or a field initialiser. Calling them inside an `afterNextRender` callback throws (or, with an `Injector` passed explicitly, works but is harder to read). The `destroyRef.onDestroy()` call above is fine there because `destroyRef` was injected in a field initialiser.

The element stays mounted here. If it must leave the DOM, combine with `animate.leave` and call `animationComplete()` in the reverse's `onReverseComplete`.

## Cleanup rules

- `revert()`, not `kill()` — `kill()` leaves the element frozen with GSAP's inline styles.
- One context per component. Nested contexts are rarely needed.
- `matchMedia` gets its own `revert()`; the callback's returned function is its per-condition cleanup.
- Listeners created inside a context are **not** auto-removed — remove them yourself (inside the matchMedia cleanup, or via `DestroyRef`).
- Register plugins once, app-wide, not per component.
