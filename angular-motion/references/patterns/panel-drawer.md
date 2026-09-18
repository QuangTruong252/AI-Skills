# Panel / drawer / sheet

## Intent

A large surface arriving from a screen edge. The motion says *"this slid in from over there, and it will go back"*. Navigation drawers, filter panels, detail sidebars, mobile bottom sheets.

## Do not use when

- It's centered and small → [modal](modal.md).
- It's anchored to a trigger → [dropdown](dropdown.md).
- It's in the document flow → [accordion](accordion.md).

## Motion characteristics

| | Enter | Exit |
|---|---|---|
| Duration | `slow` (400ms) | `medium` (350ms) |
| Easing | `smoothOut` | `smoothOut` |
| Translate | 100% from its edge → 0 | 0 → 100% |
| Opacity | usually none — it's a solid surface | none |
| Scrim | opacity 0 → 1, `fast` | → 0, `medium` |

Longer than a modal because the travel distance is larger; the perceived speed must stay constant. Use `xPercent`/`yPercent` (GSAP) or `translateX(-100%)` (CSS) so the distance is size-independent.

Direction is meaning: a left drawer enters from the left and exits left. Never enter from one side and exit to another.

## Preferred implementation

1. **Level 2** — `animate.enter`/`animate.leave` + CSS transform. Default.
2. **Level 3** — GSAP when the drawer is **draggable**: the tween must start from the drag's release position and velocity, and the dismiss threshold is computed at runtime.
3. **Level 4** — only if panel + scrim + inner content are genuinely sequenced.

Responsive split: the same data can be a popover on desktop and a bottom sheet on mobile. Switch the pattern, don't scale the animation — `examples/gsap-match-media.md`.

## Angular lifecycle considerations

- `@if` owns existence. The scrim is a sibling element with its own enter/leave.
- Focus moves into the panel on open and returns to the trigger on close, both at state-change time.
- `inert` on the page content behind a modal drawer; toggle with state.
- Body scroll lock with state, not with animation.
- A swipe-dismissable sheet: the drag updates the transform directly (GSAP), but the *decision* to close sets the signal; the leave animation then continues from the current position — pass the current offset into the leave tween rather than restarting from 0.
- Respect safe-area insets on mobile sheets; they affect the resting position, not the motion.

## GSAP considerations

- `yPercent: 100 → 0`, not `y: 400` — no measurement needed and it survives resize.
- Draggable sheets: `gsap.quickTo` during the drag, a single `gsap.to` on release with an `ease` chosen from the velocity.
- On leave, read the element's current `yPercent` with `gsap.getProperty(el, 'yPercent')` and tween from there.
- `onComplete → event.animationComplete()`.

## Reduced motion

Replace the slide with a short opacity fade (`quick`). Position already tells the user where it is; the travel is the part that causes discomfort. The scrim still fades.

## Common mistakes

- Animating `left`/`right`/`width` instead of `transform`.
- Pixel translate values that break at other viewport sizes.
- Same duration as a modal — a drawer travels much further and 250ms reads as a snap.
- Exit slower than enter.
- Forgetting the scrim, or fading the scrim and panel as one wrapper.
- Focus left behind the drawer.
- A draggable sheet that snaps back to 0 before animating out.
- `overflow: hidden` on `body` applied on animation end instead of state change (causes a visible scroll jump).

## Example

```ts
@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="drawer__scrim" animate.enter="scrim-enter" animate.leave="scrim-leave"
           (click)="open.set(false)"></div>
      <aside class="drawer" [class]="'drawer--' + side()"
             [animate.enter]="'drawer-enter drawer-enter--' + side()"
             [animate.leave]="'drawer-leave drawer-leave--' + side()"
             (keydown.escape)="open.set(false)">
        <ng-content />
      </aside>
    }
  `,
})
export class Drawer {
  readonly open = model(false);
  readonly side = input<'left' | 'right' | 'bottom'>('right');
}
```

```scss
.drawer-enter { animation-duration: var(--duration-slow);   animation-timing-function: var(--ease-smooth-out); }
.drawer-leave { animation-duration: var(--duration-medium); animation-timing-function: var(--ease-smooth-out); }

.drawer-enter--right  { animation-name: slide-in-right; }
.drawer-leave--right  { animation-name: slide-out-right; }
.drawer-enter--bottom { animation-name: slide-in-bottom; }
.drawer-leave--bottom { animation-name: slide-out-bottom; }

@keyframes slide-in-right   { from { transform: translateX(100%); } }
@keyframes slide-out-right  { to   { transform: translateX(100%); } }
@keyframes slide-in-bottom  { from { transform: translateY(100%); } }
@keyframes slide-out-bottom { to   { transform: translateY(100%); } }

@media (prefers-reduced-motion: reduce) {
  [class*='drawer-enter'] { animation: fade-in  var(--duration-quick) var(--ease-out); }
  [class*='drawer-leave'] { animation: fade-out var(--duration-quick) var(--ease-out); }
}
```
