# Accordion / disclosure

## Intent

A collapsible region **inside the document flow**. Surrounding content moves as it opens. FAQs, settings groups, expandable table rows, sidebar sections.

## Do not use when

- The content floats above the page → [dropdown](dropdown.md).
- Content is replaced rather than revealed → [tabs](tabs.md) or [state-swap](state-swap.md).
- It's a full-height side region → [panel-drawer](panel-drawer.md).

## Motion characteristics

| | Open | Close |
|---|---|---|
| Duration | `fast` (250ms) | `fast` (250ms) |
| Easing | `smoothOut` | `smoothOut` |
| Height | 0 → intrinsic | intrinsic → 0 |
| Content opacity | optional 0 → 1, `quick`, slightly delayed | optional, no delay |
| Chevron | rotate 180° or `scaleY(-1)`, `fast` | reverse |

**Symmetric** — this is a reversible motion; asymmetry looks broken. Duration should not scale with content height; a long panel at 600ms feels broken.

## Preferred implementation

1. **Level 1** — `grid-template-rows: 0fr → 1fr` transition on a mounted element. Handles intrinsic height with zero JS, is interruptible, and is the correct default.
   Alternative if the browser baseline allows: `interpolate-size: allow-keywords` + `height: 0 → auto`.
2. **Level 2** — if the content must actually leave the DOM (heavy content, lazy-loaded), `@if` + `animate.enter`/`animate.leave`. Note the height transition then needs `@starting-style`.
3. **Level 3** — GSAP only if the content resizes **while open** (a nested accordion, an async list arriving) and the container must follow, or if opening one item must close its sibling in a coordinated move.

Do not measure height in JS for this pattern. CSS solved it.

## Angular lifecycle considerations

- Keep the content mounted for the level-1 approach; toggle a class from a signal. Use `hidden` or `inert` on the collapsed region if it must be removed from the a11y tree.
- `[attr.aria-expanded]` on the trigger, `aria-controls` → the region's id. State-driven, not animation-driven.
- Native `<details>`/`<summary>` is worth considering: it gives semantics and keyboard behavior for free, and `::details-content` with `content-visibility` transitions is now animatable. Follow the project's baseline.
- **Three elements, not two.** The grid container (`0fr`/`1fr`), an unpadded clipping wrapper (`overflow: hidden`), and the padded content. Padding on the clipping element leaves residual height when collapsed — the row is 0 but the padding still occupies space.
- `[inert]` on the collapsed panel keeps its content out of the tab order and the accessibility tree. `overflow: hidden` alone does not.
- In an "only one open" accordion, the closing sibling and the opening item both animate; with CSS transitions they simply run concurrently — no coordination code required.

## GSAP considerations

- If you do need GSAP, animate `height` with GSAP's `'auto'` support: `gsap.to(el, { height: 'auto' })`. It measures for you.
- `overwrite: 'auto'` so rapid toggling resolves from the current height.
- Kill on destroy; `clearProps: 'height'` so CSS regains control.

## Reduced motion

Shorten to `micro`, or set the height instantly and keep a short content fade. The layout shift is the information; removing it entirely is fine, but then the content must still appear visibly.

## Common mistakes

- Measuring `scrollHeight` in JS and animating a pixel height — breaks on resize, font load, and dynamic content.
- Animating `max-height` to a guessed large value — the easing curve is wrong and the visible duration varies with content length.
- Padding on the clipping wrapper — leaves a gap of `2 × padding` when collapsed.
- Asymmetric open/close durations.
- Duration proportional to content height.
- Morphing the chevron's SVG path — `rotate` or `scaleY(-1)` is cheaper and works consistently across browsers.
- GSAP for a plain disclosure.

## Example

```ts
@Component({
  selector: 'app-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="acc__trigger" type="button"
            [attr.aria-expanded]="open()" [attr.aria-controls]="id"
            (click)="open.set(!open())">
      <ng-content select="[slot=summary]" />
      <svg class="acc__chevron" [class.acc__chevron--open]="open()" aria-hidden="true">…</svg>
    </button>

    <div class="acc__panel" [class.acc__panel--open]="open()" [id]="id" [inert]="!open()">
      <div class="acc__clip">
        <div class="acc__inner"><ng-content /></div>
      </div>
    </div>
  `,
})
export class AccordionItem {
  protected readonly id = `acc-${crypto.randomUUID()}`;
  readonly open = model(false);
}
```

```scss
.acc__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-fast) var(--ease-smooth-out);

  &--open { grid-template-rows: 1fr; }
}

// Two wrappers, not one. The clipping element must have NO padding of its own —
// padding on a 0fr grid row still contributes height and leaves a visible gap.
.acc__clip  { overflow: hidden; }
.acc__inner { padding-block: var(--space-3); }

.acc__chevron {
  transition: transform var(--duration-fast) var(--ease-smooth-out);
  &--open { transform: scaleY(-1); }
}

@media (prefers-reduced-motion: reduce) {
  .acc__panel, .acc__chevron { transition-duration: var(--duration-micro); }
}
```
