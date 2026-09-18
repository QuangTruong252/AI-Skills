# Modal / dialog

## Intent

A centered surface that blocks the page until dismissed. The motion says *"the page is now behind this"*. Confirmations, forms, detail views, command palettes.

## Do not use when

- The surface is anchored to a trigger → [dropdown](dropdown.md).
- It arrives from a screen edge and doesn't block → [panel-drawer](panel-drawer.md).
- It's transient and self-dismissing → [toast](toast.md).
- It's a hover hint → [tooltip](tooltip.md).

## Motion characteristics

| | Enter | Exit |
|---|---|---|
| Duration | `fast` (250ms) | `quick` (150ms) |
| Easing | `smoothOut` | `smoothOut` |
| Opacity | 0 → 1 | 1 → 0 |
| Scale | `scale-large` (0.96) → 1 | 1 → 0.96 |
| Translate | optional `distance-base` up | none, or the same 8px |
| Backdrop | opacity 0 → 1, `quick` | opacity → 0, `quick` |
| Origin | `center` | `center` |

Asymmetric: the dismiss must never make the user wait. No bounce — a modal is not playful. The backdrop leads on enter by ~50ms and runs simultaneously on exit.

## Preferred implementation

1. **Level 2** — `animate.enter`/`animate.leave` + CSS. Correct for the large majority of modals.
2. **Level 4** — GSAP timeline, only when the spec sequences backdrop → dialog → content, or content rows stagger in.
3. **Level 1** — never; a modal enters and leaves the DOM.

## Angular lifecycle considerations

**Prefer native `<dialog>` + `showModal()`.** It gives focus containment, `Escape`, inert background, and top-layer stacking for free — all things a hand-rolled overlay gets wrong. Check first whether the project already has a verified dialog integration (CDK `Dialog`, a design-system component); reuse beats both options.

Two implementation shapes, and they animate differently:

**(a) Native `<dialog>`, kept mounted.** The element stays in the DOM; `showModal()`/`close()` toggle the `[open]` state. `animate.enter`/`animate.leave` do **not** apply — the node never enters or leaves. The exit animation needs the discrete-property transition set, because `close()` drops the dialog out of the top layer immediately:

```scss
dialog {
  opacity: 0;
  transform: scale(var(--scale-large));
  transition:
    opacity   var(--duration-quick) var(--ease-smooth-out),
    transform var(--duration-quick) var(--ease-smooth-out),
    display   var(--duration-quick) allow-discrete,
    overlay   var(--duration-quick) allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: scale(1);
  transition-duration: var(--duration-fast);       // enter is slower than exit
}

@starting-style {
  dialog[open] { opacity: 0; transform: scale(var(--scale-large)); }
}

dialog::backdrop {
  opacity: 0;
  transition: opacity var(--duration-quick) var(--ease-out),
              display var(--duration-quick) allow-discrete,
              overlay var(--duration-quick) allow-discrete;
}
dialog[open]::backdrop { opacity: 1; }
@starting-style { dialog[open]::backdrop { opacity: 0; } }
```

Without `display` and `overlay` in the transition list plus `allow-discrete`, the dialog vanishes instantly on `close()` and you see no exit animation at all. This is the single most common native-dialog mistake.

Keep the signal as the source of truth and sync it to the element:

```ts
constructor() {
  afterRenderEffect(() => {
    const el = this.dialogEl().nativeElement;
    if (this.open() && !el.open) el.showModal();
    else if (!this.open() && el.open) el.close();
  });
}
// close() fires a native 'close' event (Escape, form method=dialog) — mirror it back:
// (close)="open.set(false)"
```

**(b) `@if` + `animate.enter`/`animate.leave`.** Use when the dialog content is heavy and should not exist while closed, or when the browser baseline rules out `allow-discrete`. Angular owns existence; the example at the bottom of this file shows this shape. You then owe focus containment and `Escape` yourself — or use CDK's `cdkTrapFocus`.

Both shapes are level 2. Pick (a) unless you have a reason.

Remaining lifecycle notes:
- Focus the dialog **on open**, not on animation end.
- `Escape` closes immediately; the exit animation is cosmetic and must not gate it.
- Return focus to the trigger at close time.
- Body scroll lock is applied/removed with the state, not with the animation. This is a legitimate `document.body` touch.
- The backdrop and dialog are separate elements; animate both, don't animate a shared wrapper's opacity (it fades the backdrop through the dialog).

## GSAP considerations

- One timeline, `onComplete → event.animationComplete()`.
- Build exit tweens at position `0` so they run together.
- If the modal can be re-opened rapidly, either `revert()` the enter timeline first or build one paused timeline and `play()`/`reverse()` it.
- `ctx.revert()` on destroy — a modal is often destroyed while animating.

## Reduced motion

Opacity only, `quick`, both directions. Drop the scale and the translate. The backdrop still fades — that's what communicates "blocked".

## Common mistakes

- `setTimeout` to remove the node after the exit animation.
- A `.is-closing` class managed by hand.
- Symmetric 250ms exit — feels sluggish on dismiss.
- Scale from 0 or 0.8 — text renders illegibly mid-animation.
- Delaying focus until the enter animation finishes.
- Animating `width`/`height` for size changes instead of `transform: scale`.
- Backdrop `backdrop-filter: blur()` animated on every open — expensive; fade a pre-blurred layer's opacity instead.
- `Escape` that waits for the animation.

## Example

Shape **(b)** — `@if` + `animate.enter`/`animate.leave`. Complete for the motion; focus containment is delegated to CDK because hand-rolling it is a bug factory.

```ts
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule],
  template: `
    @if (open()) {
      <div class="modal__backdrop" animate.enter="backdrop-enter" animate.leave="backdrop-leave"
           (click)="close()"></div>

      <div #dialog class="modal" role="dialog" aria-modal="true" tabindex="-1"
           [attr.aria-labelledby]="titleId"
           cdkTrapFocus [cdkTrapFocusAutoCapture]="true"
           animate.enter="modal-enter" animate.leave="modal-leave"
           (keydown.escape)="close()">
        <h2 [id]="titleId">{{ title() }}</h2>
        <ng-content />
      </div>
    }
  `,
})
export class Modal {
  readonly open = model(false);
  readonly title = input.required<string>();
  protected readonly titleId = `modal-title-${crypto.randomUUID()}`;

  private readonly trigger = signal<HTMLElement | null>(null);

  constructor() {
    effect(() => {
      if (this.open()) this.trigger.set(document.activeElement as HTMLElement | null);
      else this.trigger()?.focus();          // return focus at state change, not animation end
    });
  }

  protected close(): void { this.open.set(false); }
}
```

`cdkTrapFocusAutoCapture` moves focus into the dialog as soon as it renders — before the enter animation finishes, which is what you want. Without CDK, shape (a)'s `showModal()` gives the same guarantees natively.

```scss
.modal { transform-origin: center; }

.modal-enter { animation: modal-in  var(--duration-fast)  var(--ease-smooth-out); }
.modal-leave { animation: modal-out var(--duration-quick) var(--ease-smooth-out); }
.backdrop-enter { animation: fade-in  var(--duration-quick) var(--ease-out); }
.backdrop-leave { animation: fade-out var(--duration-quick) var(--ease-out); }

@keyframes modal-in  { from { opacity: 0; transform: scale(var(--scale-large)) translateY(var(--distance-base)); } }
@keyframes modal-out { to   { opacity: 0; transform: scale(var(--scale-large)); } }
@keyframes fade-in   { from { opacity: 0; } }
@keyframes fade-out  { to   { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .modal-enter { animation: fade-in  var(--duration-quick) var(--ease-out); }
  .modal-leave { animation: fade-out var(--duration-quick) var(--ease-out); }
}
```

Sequenced variant (level 4): `examples/gsap-timeline.md`.
