# Angular lifecycle

Angular owns whether a node exists. Motion never does.

## `animate.enter` / `animate.leave`

Available from **Angular 20.2**. Compiler features — no import, no directive, no provider, no `provideAnimations()`.

### Class form

```html
@if (open()) {
  <div class="panel" animate.enter="panel-enter" animate.leave="panel-leave">…</div>
}
```

**Angular removes the enter class when the animation completes** — for keyframes *and* transitions alike. The docs are explicit: *"Animation classes are only present while the animation is active."*

That single fact determines how you write the CSS:

> **The element's base style must be its resting state.** The enter class only describes how it gets there.

Put the from-state in `@starting-style` inside the enter class, never in the base rule. A base of `opacity: 0` makes the element vanish the moment the class is removed.

- **Keyframe class**: applied on insert, removed when the animation ends. The keyframe's `to` must match the base style.
- **Transition class**: describes the state being transitioned *to* — which is the same as the base state — plus the `transition` declaration and `@starting-style`.
- Multiple classes allowed: `animate.enter="fade slide"`. Angular waits for the longest one.
- Binding form for conditional motion: `[animate.enter]="enterClass()"`, and it accepts a string array.

```css
/* resting state — what the element looks like once the class is gone */
.panel { opacity: 1; transform: scale(1); }

/* keyframe form — simplest, not interruptible */
.panel-enter { animation: panel-in var(--duration-fast) var(--ease-smooth-out); }
@keyframes panel-in { from { opacity: 0; transform: scale(var(--scale-large)); } }

/* transition form — interruptible; the class repeats the resting state so the
   transition has a target, and @starting-style supplies the from-state */
.panel-enter {
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--duration-fast) var(--ease-smooth-out),
              transform var(--duration-fast) var(--ease-smooth-out);
  @starting-style { opacity: 0; transform: scale(var(--scale-large)); }
}

/* leave: the class IS the target state. Removal makes class removal moot. */
.panel-leave {
  opacity: 0;
  transform: scale(var(--scale-large));
  transition: opacity var(--duration-quick) var(--ease-smooth-out),
              transform var(--duration-quick) var(--ease-smooth-out);
}
```

### Event form (for GSAP or any JS engine)

```ts
import { AnimationCallbackEvent } from '@angular/core';

protected onLeave(event: AnimationCallbackEvent): void {
  gsap.to(event.target, {
    opacity: 0,
    scale: 0.96,
    duration: 0.15,
    ease: 'power2.out',
    onComplete: () => event.animationComplete(),
  });
}
```

```html
<div (animate.enter)="onEnter($event)" (animate.leave)="onLeave($event)">…</div>
```

`AnimationCallbackEvent` is `{ target: HTMLElement; animationComplete(): void }`.

**You must call `animationComplete()`.** If you don't, Angular blocks removal until `MAX_ANIMATION_TIMEOUT` (4000ms by default, injectable). Call it in `onComplete`, and also in any early-exit branch — including the reduced-motion branch where you skip the animation entirely.

## Hard constraints

- **Never mix** `animate.enter`/`animate.leave` with legacy `@angular/animations` triggers in the same component. Enter classes stick and leaving nodes never unmount.
- `animate.leave` only fires for elements in the **same component template**. A child component's own `animate.leave` will not run when the parent removes the child's host. Put the leave animation on the host usage site, or on the child's host element via `host: { 'animate.leave': '…' }`.
- Angular waits for the longest animation on the element. Long transitions on unrelated properties (e.g. a 2s `box-shadow`) will delay removal.

## Element references

```ts
import { Component, ElementRef, viewChild, viewChildren, inject } from '@angular/core';

export class RevealList {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly items = viewChildren<ElementRef<HTMLElement>>('item');
}
```

Never `document.querySelector`. Exceptions require a stated reason and are limited to genuinely global targets (`document.body` scroll lock, `document.documentElement` for a route-level overlay).

## When to run motion code

| Need | Use |
|---|---|
| Animate on insert/remove | `animate.enter` / `animate.leave` |
| One-time setup after first render (measure, build a paused timeline) | `afterNextRender()` |
| Re-run motion when signal state changes | `effect()` — read the signal, drive the tween |
| Read layout safely | `afterNextRender({ read: … })`, or the `read` phase of `afterRenderEffect()` |

Do not use `ngAfterViewInit` for measurement in new code if `afterNextRender` is available — it runs during change detection and is not SSR-safe.

## Cleanup

Non-negotiable. Pattern:

```ts
private readonly destroyRef = inject(DestroyRef);

constructor() {
  afterNextRender(() => {
    const ctx = gsap.context(() => { /* tweens, timelines, listeners */ }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  });
}
```

`ctx.revert()` kills the tweens **and** strips the inline styles GSAP wrote. `ctx.kill()` only stops them, leaving the element frozen mid-animation. Prefer `revert()`.

Checklist on every GSAP component:

- [ ] Tweens/timelines killed on destroy.
- [ ] Inline GSAP styles reverted.
- [ ] Pointer/resize/scroll listeners removed (inside the context, or via `DestroyRef`).
- [ ] `gsap.matchMedia()` instance reverted.
- [ ] ScrollTrigger instances killed (`ctx.revert()` handles triggers created inside the context).
- [ ] No timeline still running after the component is gone.

## SSR

`gsap` touches `window`. Guard anything that runs outside `afterNextRender` — `afterNextRender` already never runs on the server, which is the main reason to prefer it.

## Do not

- `setTimeout(() => this.open.set(false), 300)` — that is the bug `animate.leave` exists to fix.
- `el.offsetWidth` to force a reflow before re-adding a class. If you need to restart a keyframe, toggle the node with `@if` and let `animate.enter` handle it, or use a GSAP tween you can `restart()`.
- `renderer.addClass` / `classList.add` as the primary state mechanism. Bind `[class.x]="signal()"`.
- Animating a node you removed in the same tick.
