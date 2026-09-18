# Counter / animated number

## Intent

A number changing meaningfully, where the *change itself* is worth perceiving. The motion says *"this went up"*. Dashboard KPIs, vote/like counts, cart totals, progress percentages, statistics on reveal.

## Do not use when

- The number changes more than about once per second — you'd be animating noise. Show the value.
- The exact value matters immediately (a price at checkout, a countdown the user is racing). A rolling number is unreadable mid-flight.
- It's a label that happens to contain digits (an ID, a date, a phone number).
- The change is a single increment on a small number — a digit [state-swap](state-swap.md) reads better than a tween.

## Motion characteristics

| | Value |
|---|---|
| Duration | `fast` (250ms) for small deltas, up to `emphasis` (500ms) for a reveal-from-zero |
| Easing | `out` — fast start, settled finish |
| Interpolation | numeric value, formatted each frame |
| Digit roll (alternative) | per-digit `translateY`, `fast`, `smoothOut` |
| Colour flash | optional `quick` tint, up = positive, down = negative |

Duration should not scale with the size of the delta. 5 → 7 and 5 → 7,000 both take `fast`.

## Preferred implementation

1. **Level 3** — GSAP tweening a number object and writing the formatted string. This is the one genuinely JS-shaped motion in the catalog; there is no CSS equivalent for interpolating a value.
   - CSS `@property` + `counter()` can animate an integer without JS, but formatting (thousands separators, currency, locale) is unavailable — use it only for plain integers.
2. **Level 1** — a digit-roll built from stacked digits and `translateY`, if the design is a mechanical reel rather than a counted value.
3. **Level 2** — not applicable.

## Angular lifecycle considerations

- **Never write the animated value into a signal on every frame.** That runs change detection 60×/s. Tween a plain object and write to `textContent` via the `ElementRef`:

  ```ts
  gsap.to(state, { value: target, duration: D.fast, ease: E.out,
                   onUpdate: () => (el.textContent = format(state.value)) });
  ```
  This is a deliberate, narrow exception to "don't touch the DOM" — the alternative is 60 change-detection cycles per second.
- The **signal still holds the real value**. The DOM text is a transient visual; anything else reading the number reads the signal.
- `aria-live="polite"` on the element would announce every intermediate frame. Put `aria-hidden="true"` on the rolling text and expose the final value separately (or announce only on settle).
- Use `afterRenderEffect()`, not `effect()`. A plain `effect` also runs during server-side rendering, where `matchMedia`, `gsap`, and the DOM node don't exist. `afterRenderEffect` is browser-only and runs after the view is in place.
- **Render the real value in the template.** The tween overwrites `textContent` at runtime, but the server-rendered HTML and the pre-hydration frame must already show the correct number — otherwise the counter is blank until JS boots, and blank on a crawler.
- `overwrite: 'auto'` so a new value mid-flight resolves from the current position rather than jumping.
- Kill the tween on destroy.
- Reveal-on-scroll counters: start the tween when the element intersects, once. Disconnect the observer.

## GSAP considerations

- Tween a plain object, not the DOM node: `gsap.to({ v: from }, { v: to, onUpdate })`.
- `snap: { v: 1 }` for integers, so you never render `1,234.7`.
- `overwrite: 'auto'` is essential for live-updating values.
- Format in `onUpdate` with a **pre-created** `Intl.NumberFormat` — constructing one per frame is expensive.

## Reduced motion

Set the final value immediately. A rolling number is pure decoration; the value is the information. No fade needed, though a `quick` colour tint to mark "this changed" is a good substitute.

## Common mistakes

- Signal writes in `onUpdate` → change detection storm.
- An empty element that only gets its value from JS — blank under SSR, blank before hydration.
- `effect()` instead of `afterRenderEffect()` → `matchMedia is not defined` on the server.
- Animating a value that updates every 200ms from a websocket.
- Duration proportional to the delta (a 3-second count to 10,000).
- `Intl.NumberFormat` constructed inside `onUpdate`.
- No `snap` — flickering decimals on an integer counter.
- Screen reader announcing every frame.
- Variable-width digits causing the layout to jitter as it counts (use `font-variant-numeric: tabular-nums`).
- No `overwrite` — concurrent tweens fighting over the same text node.

## Example

```ts
@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Rendered server-side and pre-hydration with the real value; the tween
         takes over the text node only once the browser is running. -->
    <span #out class="counter" aria-hidden="true">{{ formatted() }}</span>
    <span class="sr-only">{{ formatted() }}</span>
  `,
  styles: `.counter { font-variant-numeric: tabular-nums; }`,
})
export class Counter {
  readonly value = input.required<number>();
  readonly locale = input('en-US');

  private readonly out = viewChild.required<ElementRef<HTMLElement>>('out');
  private readonly destroyRef = inject(DestroyRef);
  private readonly fmt = computed(() => new Intl.NumberFormat(this.locale()));

  protected readonly formatted = computed(() => this.fmt().format(this.value()));

  private tween?: gsap.core.Tween;
  private readonly state = { v: 0 };

  constructor() {
    // afterRenderEffect never runs on the server, so `matchMedia` and the tween
    // are browser-only. Re-runs whenever value() or locale() changes.
    afterRenderEffect(() => {
      const target = this.value();
      const format = this.fmt();
      const el = this.out().nativeElement;

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.state.v = target;
        el.textContent = format.format(target);
        return;
      }

      this.tween = gsap.to(this.state, {
        v: target,
        duration: MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
        snap: { v: 1 },
        overwrite: 'auto',
        onUpdate: () => (el.textContent = format.format(this.state.v)),
      });
    });

    this.destroyRef.onDestroy(() => this.tween?.kill());
  }
}
```

The visible text is `aria-hidden`; the screen reader reads the settled value from the `sr-only` span, which updates once per real change.
