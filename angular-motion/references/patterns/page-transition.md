# Page / route transition

## Intent

One view replacing another. The motion says *"you moved"* and, ideally, *"in this direction"*. Route changes, wizard steps, master→detail navigation.

## Do not use when

- Only a region changes → [state-swap](state-swap.md) or [tabs](tabs.md).
- A surface overlays the page → [modal](modal.md) / [panel-drawer](panel-drawer.md).
- The navigation is instant and frequent (a data table's pagination) → no transition.

## Motion characteristics

| | Outgoing | Incoming |
|---|---|---|
| Duration | `quick` (150ms) | `medium` (350ms) |
| Easing | `out` | `smoothOut` |
| Opacity | 1 → 0 | 0 → 1 |
| Translate | `distance-base` opposite the travel direction | `distance-large` from the travel direction, or none |
| Overlap | outgoing ends before or slightly overlapping incoming | |

Keep the **total** under ~400ms. A transition the user waits through on every navigation is a tax. Forward and back should mirror each other.

Hierarchical navigation (list → detail) can use direction; peer navigation (tab to tab) should just crossfade.

## Preferred implementation

1. **Native View Transitions** — `withViewTransitions()` in `provideRouter`. Angular wires the router into the browser's View Transition API; the motion is authored in CSS with `::view-transition-old/new`. This is the lowest-complexity option and handles the old/new snapshot problem for you. Check the project's browser baseline.
2. **Level 2** — `animate.enter`/`animate.leave` on the routed component's host, or on a wrapper around `<router-outlet>`. Note both views exist simultaneously during the transition; the container needs `position: relative` and the views `position: absolute`, or the layout jumps.
3. **Level 4** — GSAP timeline only for a genuinely choreographed transition (a shared element flying between routes, a staged reveal). Expensive to maintain; needs a real design reason.

Do **not** reach for `@angular/animations` `routeAnimations` in new code.

## Angular lifecycle considerations

- Scroll restoration is the router's job (`withInMemoryScrolling`), not the animation's. Don't animate a scroll reset.
- Focus must move to the new view's heading / main landmark **when the route commits**, not when the animation ends. Screen-reader users otherwise sit in limbo.
- Announce route changes via a live region on navigation end.
- Data resolution and the transition are separate concerns: don't hold the transition open waiting for data. Show the new view with its loading state — see [skeleton-loading](skeleton-loading.md).
- With View Transitions, the callback runs inside a browser-controlled window; don't do heavy work there.
- Two routed components alive at once means two sets of subscriptions briefly. Make sure both clean up.

## GSAP considerations

- One timeline, outgoing and incoming positioned relative to each other.
- Take control of DOM removal through Angular's `animate.leave` on the outgoing host; GSAP signals completion.
- Kill the timeline if a second navigation starts mid-transition — a user clicking three links fast must not queue three transitions. `overwrite: 'auto'` or an explicit `kill()` on the previous timeline.
- Register `Flip` only if you're doing a shared-element transition, and only once.

## Reduced motion

Crossfade only, `quick`, or no transition at all. Directional travel across the whole viewport is the highest-risk motion for vestibular disorders — remove it entirely.

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 120ms; }
  /* or: animation: none; */
}
```

## Common mistakes

- Transitions longer than 400ms on every navigation.
- Both views in the flow at once, causing a layout jump (missing `position: absolute`).
- Holding the transition while data loads.
- Focus and screen-reader announcement waiting for the animation.
- Queued transitions on rapid navigation.
- Direction that doesn't mirror on back-navigation.
- Animating the whole page including fixed chrome (the header shouldn't slide with the content).
- A shared-element transition maintained for one screen pair.

## Example

Native View Transitions — usually the whole implementation:

```ts
provideRouter(routes, withViewTransitions());
```

```css
::view-transition-old(root) {
  animation: fade-out var(--duration-quick) var(--ease-out) both;
}
::view-transition-new(root) {
  animation: fade-in var(--duration-medium) var(--ease-smooth-out) both;
}

@keyframes fade-out { to   { opacity: 0; transform: translateX(calc(-1 * var(--distance-base))); } }
@keyframes fade-in  { from { opacity: 0; transform: translateX(var(--distance-large)); } }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root) { animation: fade-out var(--duration-quick) both; }
  ::view-transition-new(root) { animation: fade-in  var(--duration-quick) both; }
  @keyframes fade-out { to   { opacity: 0; } }
  @keyframes fade-in  { from { opacity: 0; } }
}
```

Fallback (no View Transitions support), on the routed host:

```ts
@Component({
  selector: 'app-detail-page',
  host: { 'animate.enter': 'page-enter', 'animate.leave': 'page-leave' },
  // …
})
```
