# Level 2 — `animate.enter` / `animate.leave` + CSS

Angular 20.2+. No import, no provider.

## Keyframe form — simplest

```ts
@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as text) {
      <div class="toast" role="status"
           animate.enter="toast-enter"
           animate.leave="toast-leave">{{ text }}</div>
    }
  `,
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  protected readonly message = signal<string | null>(null);
}
```

```scss
.toast-enter { animation: toast-in  var(--duration-fast)  var(--ease-smooth-out); }
.toast-leave { animation: toast-out var(--duration-quick) var(--ease-smooth-out); }

@keyframes toast-in  { from { opacity: 0; transform: translateY(var(--distance-base)); } }
@keyframes toast-out { to   { opacity: 0; transform: translateY(var(--distance-micro)); } }

@media (prefers-reduced-motion: reduce) {
  .toast-enter { animation: toast-in-reduced var(--duration-quick) var(--ease-out); }
  .toast-leave { animation: toast-out-reduced var(--duration-quick) var(--ease-out); }
}
@keyframes toast-in-reduced  { from { opacity: 0; } }
@keyframes toast-out-reduced { to   { opacity: 0; } }
```

Angular applies `toast-leave`, waits for the animation to end, then removes the node. No timer, no closing class, no reflow hack.

## Transition form — interruptible

Use when the element can be dismissed while it is still appearing.

**The base rule must be the resting state.** Angular removes the enter class when the animation finishes, so anything the element needs to keep has to live in the base rule, not in `.dialog-enter`. Putting `opacity: 0` in the base is the classic way to make a dialog animate in and then disappear.

```scss
.dialog {
  opacity: 1;                      // resting state — survives class removal
  transform: scale(1);
}

.dialog-enter {
  opacity: 1;                      // target of the transition == resting state
  transform: scale(1);
  transition: opacity var(--duration-fast) var(--ease-smooth-out),
              transform var(--duration-fast) var(--ease-smooth-out);

  @starting-style { opacity: 0; transform: scale(var(--scale-large)); }
}

.dialog-leave {
  opacity: 0;                      // target state; the node is removed after
  transform: scale(var(--scale-large));
  transition: opacity var(--duration-quick) var(--ease-smooth-out),
              transform var(--duration-quick) var(--ease-smooth-out);
}
```

`@starting-style` gives the browser a from-state for a freshly inserted element — without it, a transition on insert does nothing.

The same rule applies to the keyframe form: the keyframe's `to` (or the implicit end state, if you only write `from`) must match the base rule. `animation-fill-mode: forwards` does **not** save you — the fill stops applying with the class.

## Conditional classes

```html
<div [animate.enter]="enterClass()" [animate.leave]="'panel-leave'">…</div>
```

```ts
protected readonly enterClass = computed(() =>
  this.placement() === 'bottom' ? 'panel-enter panel-enter--up' : 'panel-enter panel-enter--down'
);
```

Space-separated strings or a string array both work. Angular waits for the longest animation.

## Event form with a JS engine

```ts
import { AnimationCallbackEvent, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { gsap } from 'gsap';
import { MOTION_DURATION, MOTION_EASE } from '../motion.tokens';

@Component({
  selector: 'app-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="sheet" (animate.enter)="onEnter($event)" (animate.leave)="onLeave($event)">
        <ng-content />
      </div>
    }
  `,
})
export class Sheet {
  protected readonly open = signal(false);

  protected onEnter(e: AnimationCallbackEvent): void {
    gsap.fromTo(e.target,
      { yPercent: 100 },
      { yPercent: 0, duration: MOTION_DURATION.slow, ease: MOTION_EASE.smoothOut,
        onComplete: () => e.animationComplete() });
  }

  protected onLeave(e: AnimationCallbackEvent): void {
    gsap.to(e.target, {
      yPercent: 100,
      duration: MOTION_DURATION.medium,
      ease: MOTION_EASE.smoothOut,
      onComplete: () => e.animationComplete(),
    });
  }
}
```

`animationComplete()` on `enter` is optional but harmless; on `leave` it is **mandatory** — without it Angular holds the node until `MAX_ANIMATION_TIMEOUT` (4s).

Every early return needs it too:

```ts
protected onLeave(e: AnimationCallbackEvent): void {
  if (this.skipMotion()) { e.animationComplete(); return; }
  gsap.to(e.target, { opacity: 0, duration: 0.15, onComplete: () => e.animationComplete() });
}
```

## Child components

`animate.leave` fires for elements in the **same template**. To animate a child component's own host on removal, declare it on the child:

```ts
@Component({
  selector: 'app-card',
  host: { 'animate.enter': 'card-enter', 'animate.leave': 'card-leave' },
  // …
})
```

Otherwise put it on the usage site in the parent template.

## Gotchas

- Do not combine with legacy `@angular/animations` triggers in the same component.
- A long transition on any property of the element (e.g. a 2s `box-shadow`) delays removal — Angular waits for the longest one.
- Keyframe classes are removed after completion; transition classes stay, because they *are* the target state.
- In a `@for`, enter on a new item and leave on a removed item are independent; don't assume they're synchronised.
