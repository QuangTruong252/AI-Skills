# Anti-patterns

Each entry: the smell, why it's wrong, the fix.

## Lifecycle

| Anti-pattern | Fix |
|---|---|
| `setTimeout(() => this.open.set(false), 300)` to wait out an exit animation | `animate.leave` + `event.animationComplete()` |
| `.is-closing` class removed by a timer | Angular removes the node; there is no closing state to bookkeep |
| `el.offsetWidth` forced reflow to replay a keyframe | Re-mount via `@if` + `animate.enter`, or `tween.restart()` |
| `document.querySelector('.modal')` | `viewChild()`, `ElementRef`, or `event.target` |
| `classList.add/remove` as the state machine | `[class.open]="open()"` — signals own state |
| GSAP `onComplete` that removes the node itself | GSAP animates, Angular removes |
| Base CSS holding the *from* state (`.dialog { opacity: 0 }`) | Angular removes the enter class on completion — base must be the **resting** state; put the from-state in `@starting-style` or a `from`-only keyframe |
| A child animation defined inside the enter class with `forwards` | It stops applying with the class. Make the finished state the child's base rule |
| `viewChild.required()` inside an `animate.leave` handler | The view is being destroyed — it throws. Use `event.target` and scope a `querySelector` to it |
| `destroyRef.onDestroy(...)` registered inside `onEnter`/`onLeave` | One leaked callback per open, each closing over a stale timeline. Register once in the constructor |
| Native `<dialog>` with no exit animation | Add `display` and `overlay` to the transition list with `transition-behavior: allow-discrete` |
| `ngAfterViewInit` for measurement in new code | `afterNextRender()` |
| Adding `@angular/animations` to a v20.2+ codebase | `animate.enter` / `animate.leave` |
| Mixing legacy triggers and `animate.*` in one component | Pick one per component; it's a hard Angular constraint |

## Cleanup

| Anti-pattern | Fix |
|---|---|
| GSAP tween/timeline with no `revert()` | `gsap.context()` + `DestroyRef.onDestroy(() => ctx.revert())` |
| `ctx.kill()` instead of `revert()` | `revert()` also strips inline styles |
| `pointermove` listener never removed | Create it inside the context, or remove via `DestroyRef` |
| `repeat: -1` tween with no owner | Prefer CSS for loops; otherwise kill on destroy |
| `gsap.matchMedia()` never reverted | `mm.revert()` on destroy |
| Element stuck with GSAP inline styles after the animation | `clearProps` or `ctx.revert()` |

## Engine choice

| Anti-pattern | Fix |
|---|---|
| GSAP for a button hover | `transition: transform 150ms` |
| GSAP because it's installed | The gates in `implementation-selection.md` |
| Hand-rolled `requestAnimationFrame` easing loop | CSS transition, or GSAP if it's already there |
| Three tweens with hand-tuned `delay`s forming a sequence | One `gsap.timeline()` |
| A new `gsap.to()` on every `pointermove` | `gsap.quickTo()` created once |
| CSS `@keyframes` for an interruptible toggle | CSS `transition`, or a paused GSAP timeline played/reversed |
| Installing GSAP inside an "add an animation" ticket | Ask first |

## Over-engineering

| Anti-pattern | Fix |
|---|---|
| `MotionService` + directive + RxJS stream for one hover | Two lines of SCSS |
| A directive abstraction with one consumer | Inline it; abstract on the second use |
| A second motion token file | Reuse the project's |
| `new-animation-framework/` to ship one interaction | Reuse `shared/motion` or write it locally |
| Wrapping `gsap.to` in a thin custom API | Call GSAP |
| An animation task that also refactors the component | Scope discipline — ship the animation |

## Motion design

| Anti-pattern | Fix |
|---|---|
| Animating everything | Animate what communicates a change |
| 500ms on a frequently-clicked control | `quick`/`fast`; duration scales inversely with frequency |
| Bounce/spring on an error, a delete, or a dismiss | Serious actions get `smoothOut` |
| Symmetric enter and exit on a dismissible surface | Exit one step faster |
| A delay before a close | Never delay a dismiss |
| Scroll animation with no UX rationale | Delete it |
| Animating a difference between two Figma frames that isn't a transition | Two states can just be two states |
| Animation gating the interaction (button waits for its own animation) | Fire the action immediately; animate the result |
| Scale from 0 | Scale from 0.96–0.99 |
| Stagger totalling >300ms | `stagger: { amount: 0.3 }` |

## Tokens

| Anti-pattern | Fix |
|---|---|
| `duration: 0.37`, `transition: 280ms` | A semantic token |
| Picking a token by nearest number | Pick by motion intent |
| Different durations for the same pattern in different components | One pattern, one value |
| Magic `cubic-bezier` inline | A named easing token |
| `ease: 'cubic-bezier(...)'` in a GSAP call | GSAP can't parse it and silently uses the default. Use `power4.out` etc., or register `CustomEase` |
| Treating `stagger: { amount: 0.3 }` as the wall-clock total | It's the spread of **start** times; the group ends at `amount + duration` |

## Accessibility

| Anti-pattern | Fix |
|---|---|
| No `prefers-reduced-motion` branch | Required — `accessibility.md` |
| `opacity: 0` used to hide something | It stays focusable and announced. Use `visibility: hidden`, `hidden`, `inert`, or unmount |
| A live region wrapping all states of a swap | It re-announces every label. Expose only the active state |
| `* { animation-duration: 0.01ms !important }` in app CSS | Per-motion reduced variants |
| Reduced-motion branch that returns without `animationComplete()` | Node hangs 4s — always complete |
| Focus moved after the enter animation | Focus at state-change time |
| `Escape` waiting for an exit animation | Close is instant; motion is cosmetic |
| `aria-hidden` toggled on animation end | Semantics change with state, not with motion |
| Flashing / pulsing above 3Hz | Slow it or make it static |

## Performance

| Anti-pattern | Fix |
|---|---|
| Animating `width`/`height`/`top`/`left` | `transform`, or `grid-template-rows` for intrinsic height |
| `transition: all` | Explicit property list |
| `will-change` sprinkled everywhere | Remove; add only under profiling, temporarily |
| `getBoundingClientRect()` inside a write loop | Batch reads, then writes |
| Measuring on every `pointermove` | Cache on `pointerenter` and resize |
| Signal write in a per-frame `onUpdate` | Let GSAP write the DOM |
| 200 staggered items | Animate the visible window |
