# Level 1 — CSS only

No DOM insertion. No JS. State comes from a signal-bound class or a pseudo-class.

## Hover / press on a control

```scss
.btn {
  transition:
    transform var(--duration-quick) var(--ease-out),
    background-color var(--duration-quick) var(--ease-out);

  &:hover  { transform: translateY(calc(-1 * var(--distance-micro))); }
  &:active { transform: translateY(0) scale(var(--scale-tiny)); transition-duration: var(--duration-micro); }
}

@media (prefers-reduced-motion: reduce) {
  .btn { transition-property: background-color; &:hover, &:active { transform: none; } }
}
```

That is the entire correct answer to "add a subtle hover effect". No directive, no service, no GSAP.

## Signal-bound state class

```ts
@Component({
  selector: 'app-disclosure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [attr.aria-expanded]="open()" (click)="open.set(!open())">Details</button>
    <div class="panel" [class.panel--open]="open()">
      <div class="panel__inner"><ng-content /></div>
    </div>
  `,
})
export class Disclosure {
  protected readonly open = signal(false);
}
```

```scss
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-fast) var(--ease-smooth-out);

  &--open { grid-template-rows: 1fr; }
  &__inner { overflow: hidden; }   // padding lives here, not on .panel
}

@media (prefers-reduced-motion: reduce) {
  .panel { transition-duration: var(--duration-micro); }
}
```

`0fr → 1fr` animates to intrinsic height with no JS measurement. Interruptible because it's a transition, not a keyframe.

## Icon swap in one slot

```scss
.icon-slot {
  display: grid;
  > * { grid-area: 1 / 1; transition: opacity var(--duration-quick) var(--ease-out),
                                      transform var(--duration-quick) var(--ease-out); }
  .icon--hidden { opacity: 0; transform: scale(var(--scale-medium)); }
}
```

Both icons occupy the same grid cell, so there is no layout shift and nothing to measure.

## Staggered reveal without JS

Only when the item count is fixed and the list never re-shuffles.

```scss
.reveal > * {
  animation: reveal var(--duration-fast) var(--ease-smooth-out) both;
  @for $i from 1 through 8 { &:nth-child(#{$i}) { animation-delay: calc(#{$i - 1} * var(--duration-stagger)); } }
}

@keyframes reveal { from { opacity: 0; transform: translateY(var(--distance-base)); } }

@media (prefers-reduced-motion: reduce) {
  .reveal > * { animation: reveal-reduced var(--duration-quick) both; animation-delay: 0s !important; }
}
@keyframes reveal-reduced { from { opacity: 0; } }
```

Dynamic counts, re-ordering, or a follow-on step → level 4 timeline instead.

## Loop (shimmer / pulse)

CSS wins here — the browser pauses off-screen animations and there's nothing to clean up.

```scss
.skeleton {
  background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-hi) 37%, var(--skeleton-base) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s var(--ease-linear) infinite;
}
@keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: var(--skeleton-base); }
}
```

## Rules recap

- Explicit property lists — never `transition: all`.
- Tokens, not literals.
- Reduced-motion variant scoped to the rule, not global.
- If the element enters or leaves the DOM, you are at level 2, not here.
