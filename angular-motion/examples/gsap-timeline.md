# Level 4 — GSAP timeline

Use when two or more animations share a timing relationship. One sequence = one timeline.

## Coordinated enter/leave with Angular owning the DOM

```ts
import {
  AnimationCallbackEvent, ChangeDetectionStrategy, Component, DestroyRef, inject, signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { MOTION_DURATION as D, MOTION_EASE as E } from '../motion.tokens';

@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="cp" (animate.enter)="onEnter($event)" (animate.leave)="onLeave($event)">
        <div class="cp__backdrop" (click)="open.set(false)"></div>
        <div class="cp__dialog" role="dialog" aria-modal="true" aria-label="Commands">
          @for (row of rows(); track row.id) { <div class="cp__row">{{ row.label }}</div> }
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly open = signal(false);
  protected readonly rows = signal<{ id: string; label: string }[]>([]);

  private tl?: gsap.core.Timeline;

  constructor() {
    // Registered ONCE. Registering inside onEnter would add a callback per open,
    // each closing over a this.tl that a later open has already overwritten.
    this.destroyRef.onDestroy(() => this.tl?.revert());
  }

  protected onEnter(e: AnimationCallbackEvent): void {
    // Query within the event's own node. viewChild.required() would throw during
    // leave (the view is being destroyed) — use the same source on both paths.
    const root = e.target;
    const backdrop = root.querySelector<HTMLElement>('.cp__backdrop')!;
    const dialog = root.querySelector<HTMLElement>('.cp__dialog')!;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.cp__row'));

    this.tl?.kill();
    this.tl = gsap.timeline({
      defaults: { ease: E.smoothOut },
      onComplete: () => e.animationComplete(),
    })
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: D.quick })
      .fromTo(dialog,
        { opacity: 0, scale: 0.96, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: D.fast }, '-=0.05')
      .fromTo(rows,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: D.quick, stagger: { amount: 0.16 } }, '<0.05');
  }

  protected onLeave(e: AnimationCallbackEvent): void {
    const root = e.target;
    const backdrop = root.querySelector<HTMLElement>('.cp__backdrop')!;
    const dialog = root.querySelector<HTMLElement>('.cp__dialog')!;

    this.tl?.kill();                       // stop a half-finished enter
    // Exit is one step faster and does not re-stagger the rows out.
    this.tl = gsap.timeline({ defaults: { ease: E.smoothOut }, onComplete: () => e.animationComplete() })
      .to(dialog, { opacity: 0, scale: 0.96, duration: D.quick }, 0)
      .to(backdrop, { opacity: 0, duration: D.quick }, 0);
  }
}
```

Points that matter:

- Angular still decides whether the node exists. The timeline only reports when it's safe to remove it.
- `onComplete → animationComplete()` replaces every `setTimeout(duration)` you would otherwise write.
- **Elements come from `e.target`, not `viewChild.required()`.** By the time `animate.leave` fires, the `@if` is already false and the view is being torn down; a required query throws. The event hands you the node that is actually still there. `querySelector` scoped to that node is not the global-selector anti-pattern — it can't escape the element being animated.
- **`destroyRef.onDestroy` is registered once in the constructor.** Registering it inside a callback that runs on every open leaks one callback per open, and each one closes over a stale `this.tl`.
- `this.tl?.kill()` before building the next one — otherwise a rapid open/close leaves two timelines fighting over the same nodes.
- Position parameters (`'-=0.05'`, `'<0.05'`) express overlap. A sequence built from separate tweens with `delay` cannot be reversed, seeked, or killed as a unit.
- Exit runs both tweens at position `0` — simultaneous, fast. Staggering an exit makes a dismiss feel slow.
- `stagger: { amount: 0.16 }` fixes the **start spread**: with 4 rows or 40, the last one starts 160ms after the first. The group finishes 160ms + `D.quick` after the step begins, not at 160ms.

## Reversible sequence (no DOM change)

```ts
this.tl = gsap.timeline({ paused: true, defaults: { ease: E.smoothOut } })
  .to('.fab__icon',  { rotate: 45, duration: D.quick })
  .to('.fab',        { width: 240, duration: D.fast }, '<')
  .fromTo('.fab__item', { opacity: 0, x: -8 },
                        { opacity: 1, x: 0, duration: D.quick, stagger: D.stagger }, '-=0.1');

effect(() => (this.expanded() ? this.tl!.play() : this.tl!.reverse()));
```

Reversing a single timeline handles interruption correctly at any point. Two independent open/close sequences do not.

## Success sequence

```ts
gsap.timeline({ defaults: { ease: E.smoothOut } })
  .to(button, { scale: 0.98, duration: D.micro })
  .to(button, { scale: 1, duration: D.quick, ease: E.bounce })
  .fromTo(check, { drawSVG: '0%' }, { drawSVG: '100%', duration: D.fast }, '-=0.1')
  .fromTo(label, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: D.quick }, '-=0.15');
```

(`drawSVG` is a GSAP plugin; the plugin-free equivalent animates `strokeDashoffset`.)

## Rules

- **One timeline per sequence.** If you're writing `delay:` on a second tween to line it up with the first, you want a timeline.
- **Independent animations are not a timeline.** Two unrelated fades are two tweens.
- `defaults: { ease }` instead of repeating the ease on every step.
- Build it **paused** whenever the interaction is a toggle.
- Store the instance if you need to reverse/kill it; otherwise let the context own it.
- `tl.revert()` or the enclosing `ctx.revert()` on destroy — always.
- Don't nest timelines more than one level; it becomes unreadable and hard to reverse.
