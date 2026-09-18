# State swap (text, icon, label, content)

## Intent

Content replaced **in the same spatial slot**. The motion says *"this became that"*. Button label changing (`Save` → `Saving…` → `Saved`), icon toggling, a status line updating, a card's content switching.

## Do not use when

- The old content leaves and nothing replaces it → a plain leave animation.
- The new content appears below the old → [text-reveal](text-reveal.md).
- The slot's size changes dramatically → [accordion](accordion.md), or animate the container separately.
- The value is numeric → [counter](counter.md).

## Motion characteristics

| | Outgoing | Incoming |
|---|---|---|
| Duration | `quick` (150ms) | `quick` (150ms) |
| Easing | `out` | `smoothOut` |
| Opacity | 1 → 0 | 0 → 1 |
| Translate | `distance-micro` up | `distance-micro` from below |
| Blur | optional → `blur-medium` | `blur-medium` → 0 |
| Overlap | outgoing and incoming overlap by ~50% | |

**Symmetric** — this is a reversible swap, not an enter/exit pair.

Direction can carry meaning: an incrementing value swaps upward, a decrementing one downward.

The slot must not resize. If the two contents have different widths, the container jumping is worse than any fade. Either fix the width, or animate the width alongside (`fast`, `smoothOut`).

## Preferred implementation

1. **Level 1** — both contents stacked in one CSS grid cell, opacity/transform toggled by a state class. Nothing enters or leaves the DOM, so there's no lifecycle to manage and the swap is interruptible.
2. **Level 2** — `@if`/`@switch` + `animate.enter`/`animate.leave` when the contents are heavy or must not both exist. Both elements briefly coexist during the swap — the grid-cell layout above is still required.
3. **Level 3** — GSAP only for per-character/per-word swaps or when the container width must be measured and animated at runtime.

## Angular lifecycle considerations

- `@switch` on a status signal, or `@if`/`@else`, drives the swap. State is the source of truth.
- With `animate.leave`, the outgoing and incoming elements **coexist**. Place both in the same grid cell (`grid-area: 1 / 1`) or the layout will jump.
- **`opacity: 0` does not hide anything from assistive technology.** If all states stay mounted for sizing, mark the visual slot `aria-hidden="true"` and expose the active state once — via `aria-label` on the control, or a separate `sr-only` live region. Otherwise a screen reader reads "Save Saving… Saved".
- Announce the change with `aria-live="polite"`, keyed to state — not to animation completion. Don't put the live region on the slot that holds all three labels, or every state change re-announces all of them.
- Don't animate a `Saving…` state that lasts 80ms. Either debounce showing it, or don't animate the swap into it.
- For an icon toggle, keep one `<svg>` with two paths rather than swapping elements, when practical.

## GSAP considerations

- Per-character text swaps: `SplitText` if the project has the plugin; otherwise split in the template with a `@for` over characters and stagger — but be aware it destroys text selection and screen-reader reading, so keep an `aria-label` with the plain string on the container and `aria-hidden` on the split spans.
- One timeline: out then in, overlapping.
- Never GSAP for a two-state label swap.

## Reduced motion

Opacity only, `micro`–`quick`, no travel, no blur, no per-character stagger. The swap should still be visible so the change is noticed.

## Common mistakes

- Container width jumping mid-swap.
- Both contents in normal flow, so the outgoing one pushes the incoming one.
- No overlap — a hard gap where the slot is empty.
- `aria-live` announcing at animation end.
- Animating a swap that happens many times a second (a live counter → use [counter](counter.md) or no animation).
- Per-character stagger on a button label.
- Asymmetric durations on a reversible toggle.

## Example

Level 1 — both states mounted, one grid cell:

```ts
@Component({
  selector: 'app-save-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="save" (click)="save()" [disabled]="status() === 'saving'"
            [attr.aria-label]="label()">
      <!-- All three stay mounted so the slot keeps its width, but only the active one
           is exposed: opacity does NOT hide text from assistive technology. -->
      <span class="save__slot" aria-hidden="true">
        <span class="save__label" [class.save__label--out]="status() !== 'idle'">Save</span>
        <span class="save__label" [class.save__label--out]="status() !== 'saving'">Saving…</span>
        <span class="save__label" [class.save__label--out]="status() !== 'saved'">Saved</span>
      </span>
    </button>

    <span class="sr-only" aria-live="polite">{{ status() === 'idle' ? '' : label() }}</span>
  `,
})
export class SaveButton {
  protected readonly status = signal<'idle' | 'saving' | 'saved'>('idle');
  protected readonly label = computed(() =>
    ({ idle: 'Save', saving: 'Saving…', saved: 'Saved' })[this.status()]);

  protected save(): void { /* … sets status */ }
}
```

```scss
.save__slot { display: grid; }

.save__label {
  grid-area: 1 / 1;                       // same cell — no layout shift
  transition:
    opacity   var(--duration-quick) var(--ease-out),
    transform var(--duration-quick) var(--ease-out);

  &--out {
    opacity: 0;
    transform: translateY(calc(-1 * var(--distance-micro)));
    pointer-events: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .save__label { transition-property: opacity; &--out { transform: none; } }
}
```

The slot sizes to its widest child, so the button never resizes. Swaps are interruptible because they're transitions.
