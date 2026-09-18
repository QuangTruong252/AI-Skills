# Success feedback

## Intent

Confirming that an action completed. The motion says *"done"*. Checkmark draws, save confirmations, upload complete, copy-to-clipboard, form submission.

## Do not use when

- The action failed → [error-feedback](error-feedback.md).
- The result is a message elsewhere on the page → [toast](toast.md).
- It's a routine, high-frequency action (autosave, filter applied) — a celebratory animation on something that happens 50 times an hour is noise. Use [state-swap](state-swap.md).

## Motion characteristics

| Stage | Duration | Detail |
|---|---|---|
| Press acknowledgement | `micro` (80ms) | `scale-tiny` dip |
| Settle | `quick` (150ms) | back to 1, `bounce` allowed here |
| Check draw | `fast` (250ms) | stroke 0 → 100%, `smoothOut` |
| Label swap | `quick` (150ms) | overlapping the draw by ~100ms |
| Hold before reset | 1200–2000ms | a plain business timer, not animation |

Total visible sequence ≤ `emphasis` (500ms). This is the one pattern where a slight overshoot is appropriate — success is the moment a little expressiveness is earned.

## Preferred implementation

1. **Level 1** — CSS. A checkmark drawn with `stroke-dasharray`/`stroke-dashoffset` and a keyframe is a complete implementation.
2. **Level 2** — if the success indicator enters the DOM.
3. **Level 4** — GSAP timeline when the sequence has three or more coordinated stages (button morph → check draw → label swap → auto-reset), or when a particle/burst effect is specified.

## Angular lifecycle considerations

- A `status` signal (`idle | pending | success`) drives everything. The animation reads it; it doesn't own it.
- The reset timer (back to `idle` after ~1.5s) is a **business** timer — legitimate, but clear it on destroy and on a new action.
- `aria-live="polite"` announces success on state change. Never rely on the visual check alone.
- The button must be usable again as soon as the state allows, regardless of whether the animation finished.
- `@switch` on status; the check icon enters via `animate.enter`.
- **The drawn checkmark must be the resting state.** Angular removes the enter class when *its* animation completes, so a child animation defined inside that class — even with `animation-fill-mode: forwards` — stops applying and the check un-draws. Give the path `stroke-dashoffset: 0` in its base rule and use a `from`-only keyframe. This also sidesteps the timing question: Angular waits for animations on the element carrying the class, not necessarily for a longer child animation.
- If the success state replaces the button's label, the slot must not resize — see [state-swap](state-swap.md).

## GSAP considerations

- One timeline. `defaults: { ease: MOTION_EASE.smoothOut }`, override with `bounce` for the settle step only.
- `strokeDashoffset` animates fine without plugins:
  ```ts
  const len = path.getTotalLength();
  gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: D.fast });
  ```
- Kill the timeline if the user triggers the action again mid-sequence.
- `ctx.revert()` on destroy.

## Reduced motion

Show the final state with a short opacity fade (`quick`). No draw, no scale, no bounce, no particles. Success must still be **visible and announced** — this is exactly where "skip the animation entirely" is wrong.

## Common mistakes

- A celebration on a routine action.
- The button staying disabled until the animation ends.
- Success only communicated visually (no `aria-live`).
- A confetti/particle burst with no design intent — and none under reduced motion, where it should simply not exist.
- The reset timer not cleared on destroy.
- Re-triggering the action queuing a second animation on top of the first.
- Animating `stroke-width` or `filter` on the check (paint cost) instead of the stroke offset.
- 800ms of ceremony before the UI is usable again.

## Example

```ts
@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="copy" (click)="copy()">
      <span class="copy__slot">
        @switch (status()) {
          @case ('idle')    { <span class="copy__label">Copy</span> }
          @case ('success') {
            <span class="copy__label" animate.enter="pop">
              <svg class="copy__check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12l5 5L20 6" />
              </svg>
              Copied
            </span>
          }
        }
      </span>
    </button>
    <span class="sr-only" aria-live="polite">{{ status() === 'success' ? 'Copied to clipboard' : '' }}</span>
  `,
})
export class CopyButton {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly status = signal<'idle' | 'success'>('idle');
  private timer?: ReturnType<typeof setTimeout>;

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.text());
    this.status.set('success');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.status.set('idle'), 1500);   // business delay, not lifecycle
  }

  constructor() { this.destroyRef.onDestroy(() => clearTimeout(this.timer)); }
  readonly text = input.required<string>();
}
```

```scss
.copy__slot { display: grid; > * { grid-area: 1 / 1; } }

.copy__check path {
  stroke: currentColor; stroke-width: 2; fill: none;
  stroke-dasharray: 24;
  stroke-dashoffset: 0;                    // RESTING STATE: fully drawn
  // Runs once because the path is newly inserted. Not nested under .pop —
  // Angular removes .pop when the enter animation ends, and a `forwards` fill
  // nested inside it would stop applying, un-drawing the checkmark.
  animation: draw var(--duration-fast) var(--ease-smooth-out);
}

.pop { animation: pop var(--duration-quick) var(--ease-bounce); }

@keyframes pop  { from { opacity: 0; transform: scale(var(--scale-medium)); } }
@keyframes draw { from { stroke-dashoffset: 24; } }   // from-only: `to` is the resting state

@media (prefers-reduced-motion: reduce) {
  .pop { animation: fade-in var(--duration-quick) var(--ease-out); }
  .copy__check path { animation: none; }              // already at offset 0
}
```
