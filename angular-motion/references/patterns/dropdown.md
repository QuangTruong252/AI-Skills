# Dropdown / popover / menu

## Intent

A floating surface anchored to a trigger. The motion says *"this came from that button"*. Select menus, context menus, combobox lists, popovers, date pickers.

## Do not use when

- It blocks the page and isn't anchored → [modal](modal.md).
- It's a passive hover hint with no interactive content → [tooltip](tooltip.md).
- On mobile the same surface becomes a bottom sheet → [panel-drawer](panel-drawer.md) for that branch. This split is normal; see `examples/gsap-match-media.md`.

## Motion characteristics

| | Enter | Exit |
|---|---|---|
| Duration | `fast` (250ms) | `quick` (150ms) |
| Easing | `smoothOut` | `smoothOut` |
| Opacity | 0 → 1 | 1 → 0 |
| Scale | `scale-medium` (0.97) → 1 | 1 → 0.97 |
| Translate | `distance-base` (8px) toward the trigger | same, back toward the trigger |
| Origin | the edge nearest the trigger | same |

`transform-origin` is the whole pattern. A menu opening downward scales from `top`; one flipped upward scales from `bottom`. Getting this wrong makes the surface look unattached.

Dropdowns are triggered constantly — keep them fast. No bounce.

## Preferred implementation

1. **Level 2** — `animate.enter`/`animate.leave` + CSS. Almost always correct.
2. **Level 3** — GSAP only if the surface must be interruptible mid-open with resolve-from-current (rapid trigger clicking), or the origin is computed from a collision-detection library at runtime.
3. **Level 1** — only if the menu stays mounted (rare; it usually shouldn't for a11y).

## Angular lifecycle considerations

- `@if` controls existence — preferred, because a closed menu then costs nothing and cannot be reached by any means.
- If the menu must stay mounted, hide it with `visibility: hidden` (or `display: none`, or `hidden`), **not** `opacity: 0`. `visibility: hidden` removes the subtree from the accessibility tree and makes it unfocusable; `opacity: 0` leaves it fully focusable and announced. Note that `visibility` is animatable as a discrete property, so an exit transition needs `transition-behavior: allow-discrete` or the element disappears instantly.
- Positioning (CDK Overlay, Floating UI, or `anchor-name`/`position-area`) happens **before** the enter animation. Animate transform only; never animate `top`/`left` — the positioning library owns those.
- Bind `transform-origin` from the resolved placement: `[style.transform-origin]="origin()"`.
- Focus the first item on open for keyboard users; don't wait for the animation.
- Close on `Escape`, outside click, and selection — all instant.
- If you use CDK Overlay, the overlay pane is the animated element. Put the classes on your panel template, not on the pane.

## GSAP considerations

- Only if a gate applies. A dropdown fade is not a GSAP job.
- For rapid toggling, a paused timeline played/reversed beats two fire-and-forget tweens.
- With an overlay library, GSAP must not write to the properties the library controls (`top`, `left`, `transform` if it uses transform positioning — check). Animate `opacity` and `scale` on an inner wrapper instead.

## Reduced motion

Opacity only, `quick`. Drop scale and translate. The position already communicates the anchoring.

## Common mistakes

- `transform-origin: center` on a menu anchored to a button.
- Animating `height` to reveal items — animate the container's opacity/scale; the height is already correct.
- The same duration for open and close.
- A delay on close (users who click away want it gone).
- Animating `top`/`left` while a positioning library is also writing them.
- Keeping the menu mounted with `opacity: 0` — still focusable and still announced. Use `visibility: hidden` or unmount it.
- Staggering the menu items. A dropdown is one surface, not a reveal.

## Example

```ts
@Component({
  selector: 'app-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button #trigger type="button" [attr.aria-expanded]="open()" (click)="open.set(!open())">
      Options
    </button>

    @if (open()) {
      <div class="menu" role="menu"
           [style.transform-origin]="origin()"
           animate.enter="menu-enter"
           animate.leave="menu-leave"
           (keydown.escape)="open.set(false)">
        <ng-content />
      </div>
    }
  `,
})
export class Menu {
  protected readonly open = signal(false);
  /** Set by the positioning layer; 'top left' when opening downward. */
  protected readonly origin = signal('top left');
}
```

```scss
.menu-enter { animation: menu-in  var(--duration-fast)  var(--ease-smooth-out); }
.menu-leave { animation: menu-out var(--duration-quick) var(--ease-smooth-out); }

@keyframes menu-in {
  from { opacity: 0; transform: scale(var(--scale-medium)) translateY(calc(-1 * var(--distance-base))); }
}
@keyframes menu-out {
  to { opacity: 0; transform: scale(var(--scale-medium)) translateY(calc(-1 * var(--distance-micro))); }
}

@media (prefers-reduced-motion: reduce) {
  .menu-enter { animation: fade-in  var(--duration-quick) var(--ease-out); }
  .menu-leave { animation: fade-out var(--duration-quick) var(--ease-out); }
}
```
