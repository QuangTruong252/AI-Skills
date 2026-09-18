# Skeleton / loading → content

## Intent

A placeholder standing in for content that hasn't arrived, and the handover when it does. The motion says *"this is coming"* and then *"here it is"*. Lists, cards, tables, profile headers, dashboards.

## Do not use when

- The wait is under ~200ms — the skeleton flashes and makes the UI feel *slower*. Show nothing.
- The wait is long and indeterminate (>10s) — a skeleton implies "almost there". Use a progress indicator with a message.
- Only a small region is loading and the layout won't shift — an inline spinner is less visually noisy.
- The content shape is unknown — a skeleton that doesn't match the real layout causes a jarring reflow on swap.

## Motion characteristics

| | Value |
|---|---|
| Shimmer | 1.2–1.6s loop, `linear`, gradient sweep |
| Pulse (alternative) | 1.5–2s, `inOut`, opacity 0.6 ↔ 1 |
| Skeleton exit | `quick` (150ms), opacity → 0 |
| Content enter | `fast` (250ms), opacity + `distance-micro`, no stagger |
| Overlap | crossfade — skeleton out and content in overlap by ~50% |
| Minimum display | ~300ms once shown, to avoid a flash |

The handover is the part people get wrong. A hard cut from skeleton to content is jarring; a full sequential fade-out-then-fade-in is slow. Crossfade in the same grid cell.

## Preferred implementation

1. **Level 1** — CSS for the shimmer/pulse loop. The browser pauses off-screen CSS animations; a GSAP `repeat: -1` does not.
2. **Level 2** — `@if`/`@switch` on the loading state with `animate.enter`/`animate.leave` for the handover. Both states must occupy the same grid cell.
3. **Level 3+** — no gate applies.

## Angular lifecycle considerations

- A `resource()` / `httpResource()` status signal, or an explicit `'loading' | 'ready' | 'error'` signal, drives the `@switch`. The animation never owns loading state.
- **Delay showing the skeleton** by ~200ms so fast responses never flash one; and once shown, keep it for ~300ms minimum. Both are business timers — legitimate, and they must be cleared on destroy.
- `aria-busy="true"` on the container while loading; `aria-live="polite"` announcing when content is ready. Tied to state, not to animation.
- The skeleton should be `aria-hidden` — screen readers gain nothing from reading placeholder boxes.
- The skeleton's dimensions must match the real content's, or the swap causes a layout shift (and a CLS hit).
- Don't stagger the content in after a skeleton. The user has already waited; make it appear.
- Never animate 500 skeleton rows. Render the visible window.

## GSAP considerations

Avoid. An infinite GSAP tween runs off-screen, costs main-thread time, and needs an owner to kill it. CSS does this better. If a design demands a GSAP shimmer, pause it with an `IntersectionObserver` and kill it on destroy.

## Reduced motion

Stop the shimmer — a static, slightly-tinted block. Keep the crossfade (shortened to `quick`) so the handover is still perceptible.

A spinner may keep spinning at a slower rate; a strobing shimmer should not.

## Common mistakes

- Skeleton flashing for 80ms on a cached response.
- Skeleton dimensions not matching the content → layout shift on swap.
- Hard cut with no crossfade.
- Skeleton and content both in normal flow, so they stack during the swap.
- Screen readers reading the placeholder text.
- A shimmer running on 200 rows.
- `repeat: -1` GSAP tween never killed.
- Staggering the content in after the wait.
- A skeleton for a 15-second operation — that needs progress and a message.

## Example

```ts
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="swap" [attr.aria-busy]="profile.isLoading()">
      @if (profile.isLoading()) {
        <div class="skeleton-group" aria-hidden="true" animate.leave="fade-out-quick">
          <div class="skeleton skeleton--avatar"></div>
          <div class="skeleton skeleton--line"></div>
          <div class="skeleton skeleton--line skeleton--short"></div>
        </div>
      } @else {
        <div class="profile" animate.enter="content-enter">
          <!-- real content, same dimensions -->
        </div>
      }
    </div>
  `,
})
export class Profile {
  protected readonly profile = httpResource<ProfileData>(() => `/api/profile/${this.id()}`);
  readonly id = input.required<string>();
}
```

```scss
.swap { display: grid; > * { grid-area: 1 / 1; } }   // crossfade, no stacking

.skeleton {
  background: linear-gradient(90deg,
    var(--skeleton-base) 25%, var(--skeleton-highlight) 37%, var(--skeleton-base) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s var(--ease-linear) infinite;
  border-radius: var(--radius-sm);
}

.fade-out-quick { animation: fade-out var(--duration-quick) var(--ease-out); }
.content-enter  { animation: content-in var(--duration-fast) var(--ease-smooth-out); }

@keyframes shimmer    { from { background-position: 100% 0; } to { background-position: 0 0; } }
@keyframes content-in { from { opacity: 0; transform: translateY(var(--distance-micro)); } }

@media (prefers-reduced-motion: reduce) {
  .skeleton      { animation: none; background: var(--skeleton-base); }
  .content-enter { animation: fade-in var(--duration-quick) var(--ease-out); }
}
```
