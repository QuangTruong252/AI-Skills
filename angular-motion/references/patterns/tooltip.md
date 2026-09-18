# Tooltip

## Intent

A small, passive hint anchored to a trigger, shown on hover or focus. Non-interactive, never essential. The motion must be nearly subliminal — tooltips fire constantly.

## Do not use when

- The content is interactive or focusable → [dropdown](dropdown.md) (popover).
- The information is required to complete the task → put it in the UI.
- It's triggered by a click → popover, not tooltip.

## Motion characteristics

| | Enter | Exit |
|---|---|---|
| Delay | `micro`–150ms *hover intent* | **none** |
| Duration | `quick` (150ms) | `quick` (150ms) |
| Easing | `out` | `out` |
| Opacity | 0 → 1 | 1 → 0 |
| Translate | `distance-small` (6px) toward the trigger | same |
| Scale | none, or `scale-tiny` | none |

The enter **delay** is the important part: it prevents a tooltip storm when the pointer crosses a toolbar. The exit has no delay — this is the one asymmetry that matters here.

Focus-triggered tooltips appear **immediately**, with no delay. Keyboard users have already committed.

## Preferred implementation

1. **Level 1** — CSS `:hover`/`:focus-visible` + `transition-delay`, if the tooltip element is a pseudo-element or a mounted sibling. Simplest and fastest.
2. **Level 2** — `animate.enter`/`animate.leave` if the tooltip is portalled into an overlay and enters the DOM.
3. **Level 3+** — never. There is no gate a tooltip can satisfy.

## Angular lifecycle considerations

- A directive (`appTooltip`) is the right abstraction here — tooltips genuinely have many consumers. Check whether the project or its component library already has one before writing another.
- Hover intent: a timer before *showing* is a business delay, not an animation lifecycle guess — legitimate. Clear it on `pointerleave`, `blur`, and destroy.
- `aria-describedby` on the trigger pointing at the tooltip id. Set with state, not with animation.
- `Escape` hides it immediately.
- **WCAG 1.4.13 (Content on Hover or Focus)** requires the tooltip to be *hoverable* — the user must be able to move the pointer onto it without it vanishing — and *dismissible* with `Escape` while the trigger keeps focus. `pointer-events: none` breaks the first; pure CSS `:hover` cannot do the second. A CSS-only tooltip is therefore only compliant for content that is genuinely decorative and duplicated elsewhere.
- For anything else, keep the tooltip pointer-interactive and attach an `Escape` handler in the directive. That is the main reason this pattern usually ends up as a directive rather than two CSS rules.
- Positioning library owns `top`/`left`; animate only `opacity`/`transform`.

## GSAP considerations

None. If you find yourself reaching for GSAP for a tooltip, re-read `implementation-selection.md`.

## Reduced motion

Opacity only, `quick`. Keep the hover-intent delay — it's usability, not motion.

## Common mistakes

- No enter delay → tooltips flash across a toolbar.
- A delay on exit → the tooltip lingers over content the user is trying to read.
- Enter delay applied to keyboard focus.
- A tooltip mounted at `opacity: 0` — still in the a11y tree and still announced. Use `visibility: hidden` or unmount it.
- `pointer-events: none` on a tooltip the user may need to hover (WCAG 1.4.13).
- No `Escape` dismissal.
- Scale/bounce on something that appears hundreds of times per session.
- A tooltip whose exit animation blocks the next tooltip's entry.
- `transition: all` picking up the positioning library's `top`/`left` writes.

## Example

The CSS below covers the motion only. It does **not** satisfy WCAG 1.4.13 on its own — `visibility` keeps the hidden tooltip out of the a11y tree, but `Escape` dismissal still needs a key handler, and the tooltip stays hoverable only because `pointer-events` is left alone.

```scss
.tooltip {
  opacity: 0;
  visibility: hidden;                 // not opacity alone — keeps it out of the a11y tree
  transform: translateY(var(--distance-small));
  transition:
    visibility var(--duration-quick) allow-discrete,
    opacity   var(--duration-quick) var(--ease-out),
    transform var(--duration-quick) var(--ease-out);
  transition-delay: 0s;                       // no delay on the way out
}

.tooltip-trigger:hover  .tooltip,
.tooltip-trigger:focus-visible .tooltip,
.tooltip:hover {                      // stays open while the pointer is on it (WCAG 1.4.13)
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.tooltip-trigger:hover .tooltip { transition-delay: 150ms; }   // hover intent
.tooltip-trigger:focus-visible .tooltip { transition-delay: 0s; } // keyboard: immediate

@media (prefers-reduced-motion: reduce) {
  .tooltip { transition-property: opacity, visibility; transform: none; }
  .tooltip-trigger:hover .tooltip,
  .tooltip-trigger:focus-visible .tooltip,
  .tooltip:hover { transform: none; }
}
```

Portalled version: same CSS on the overlay panel, applied via `animate.enter`/`animate.leave`, with the hover-intent delay handled in the directive's timer rather than in CSS.
