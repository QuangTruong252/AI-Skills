# Tabs / segmented control

## Intent

An indicator travelling between segments to show which one is active. The motion says *"selection moved from here to there"*. Tab bars, segmented controls, filter pills, nav underlines.

## Do not use when

- The panels themselves animate in and out → that part is [state-swap](state-swap.md) or [page-transition](page-transition.md).
- Content expands in place → [accordion](accordion.md).

## Motion characteristics

| | Value |
|---|---|
| Duration | `fast` (250ms) |
| Easing | `inOut` — it travels and stops |
| Property | `transform: translateX` + `scaleX` (or `width`) |
| Symmetry | **symmetric** — reversible motion, both directions identical |
| Panel crossfade | optional, `quick`, opacity only |

Two separate motions: the **indicator** travels, the **panel** swaps. Don't couple their durations; the panel swap should be shorter or absent.

## Preferred implementation

1. **Level 1** — CSS. Two viable approaches:
   - **Layout-driven**: the indicator is a child of the active tab (or a pseudo-element) and `view-transition-name` / a shared CSS transition moves it. Simplest when tabs are equal width.
   - **Transform-driven**: one indicator element positioned with `translateX(var(--x)) scaleX(var(--w))`, the two custom properties set from the active tab's offset.
2. **Level 3** — GSAP when tab widths are dynamic and must be measured, and the measurement must survive resize and font loading. `gsap.to(indicator, { x, width })` with a cached, `ResizeObserver`-invalidated measurement.
3. **Level 2** — not applicable; the indicator doesn't enter or leave.

Modern option worth checking against the project's browser baseline: CSS `@starting-style` isn't needed here, but the native View Transitions API handles the indicator move well if the project already uses it for routing.

## Angular lifecycle considerations

- `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`, roving tabindex. Arrow-key navigation moves selection instantly — the animation follows, it doesn't gate.
- **First paint must not animate.** Set the indicator position without a transition on initial render, otherwise it slides in from `x: 0` on load. Add the transition after the first `afterNextRender`, or set the initial position with `gsap.set`.
- Measure with `afterNextRender({ read })` or a `ResizeObserver` — not `ngAfterViewInit` + `setTimeout`.
- Re-measure on resize (debounced) and on tab-label change, not on every change detection.
- `viewChildren` for the tab buttons; never `querySelectorAll`.

## GSAP considerations

- One tween, `overwrite: 'auto'` — rapid tab clicking must resolve from the current position, not snap.
- Cache the measured rects; invalidate on `ResizeObserver`.
- If the indicator uses `scaleX`, compensate the content inside it or keep it contentless.
- Kill/revert on destroy; `clearProps` so CSS regains the resting position.

## Reduced motion

The indicator **jumps** to the new position instantly. Its position is the information, and instant is perfectly legible here. Keep the panel crossfade if there is one, shortened.

## Common mistakes

- The indicator sliding in from the left on first paint.
- `scaleX(120px)` — binding the width custom property with a `.px` suffix. `scaleX()` takes a unitless number; `translateX()` takes a length. The two custom properties are not interchangeable.
- No tab selected initially, so every button is `tabIndex="-1"` and the tablist is unreachable by keyboard.
- Animating `left`/`width` instead of `transform`.
- Measuring inside a `setTimeout(0)` because the first measurement was wrong — use `afterNextRender`.
- Not re-measuring after a web font loads (tab widths change).
- Asymmetric durations for left-to-right vs right-to-left.
- The panel content animating for longer than the indicator, so the UI feels out of sync.
- Arrow-key navigation waiting for the animation before changing selection.

## Example

```ts
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.id) {
        <button #tabBtn type="button" role="tab" class="tabs__tab"
                [id]="tab.id + '-tab'" [attr.aria-controls]="tab.id + '-panel'"
                [attr.aria-selected]="tab.id === active()"
                [tabIndex]="tab.id === active() ? 0 : -1"
                (click)="active.set(tab.id)">{{ tab.label }}</button>
      }
      <span class="tabs__indicator" [class.tabs__indicator--ready]="ready()"
            [style.--x.px]="indicator().x" [style.--w]="indicator().w"></span>
    </div>

    @for (tab of tabs(); track tab.id) {
      @if (tab.id === active()) {
        <div role="tabpanel" [id]="tab.id + '-panel'" [attr.aria-labelledby]="tab.id + '-tab'"
             tabindex="0">
          <ng-content />
        </div>
      }
    }
  `,
})
export class Tabs {
  readonly tabs = input.required<{ id: string; label: string }[]>();

  /** Never null: the first tab is selected until the user picks another. */
  private readonly picked = signal<string | null>(null);
  protected readonly active = computed(() => this.picked() ?? this.tabs()[0]?.id ?? null);

  protected readonly ready = signal(false);
  protected readonly indicator = signal({ x: 0, w: 0 });

  private readonly btns = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  protected onKeydown(e: KeyboardEvent): void {
    const ids = this.tabs().map((t) => t.id);
    const i = ids.indexOf(this.active()!);
    const next =
      e.key === 'ArrowRight' ? ids[(i + 1) % ids.length]
      : e.key === 'ArrowLeft' ? ids[(i - 1 + ids.length) % ids.length]
      : e.key === 'Home' ? ids[0]
      : e.key === 'End' ? ids.at(-1)
      : null;
    if (!next) return;

    e.preventDefault();
    this.picked.set(next);                  // selection changes immediately; motion follows
    this.btns().find((b) => b.nativeElement.id === `${next}-tab`)?.nativeElement.focus();
  }

  constructor() {
    afterRenderEffect({
      read: () => {
        const el = this.btns().find((b) => b.nativeElement.ariaSelected === 'true')?.nativeElement;
        if (!el) return;
        const next = { x: el.offsetLeft, w: el.offsetWidth };
        // Writes must be idempotent: signal equality stops the read → write → read loop.
        if (next.x !== this.indicator().x || next.w !== this.indicator().w) this.indicator.set(next);
        this.ready.set(true);            // transition enabled only after the first placement
      },
    });
  }
}
```

```scss
.tabs__indicator {
  position: absolute;
  inset-block-end: 0;
  inline-size: 1px;                                  // scaled, not resized
  // --x is a length (px suffix on the binding); --w must be UNITLESS for scaleX().
  transform: translateX(var(--x)) scaleX(var(--w));
  transform-origin: left;

  &--ready { transition: transform var(--duration-fast) var(--ease-in-out); }
}

@media (prefers-reduced-motion: reduce) {
  .tabs__indicator--ready { transition: none; }
}
```
