# Error feedback

## Intent

Signalling that an action was rejected or input is invalid. The motion says *"no — look here"*. Form validation, failed submission, wrong credentials, disallowed drop target.

## Do not use when

- The action succeeded → [success-feedback](success-feedback.md).
- The error is a system-level message unrelated to a specific control → [toast](toast.md).
- The field is merely incomplete and the user is still typing — don't shake on every keystroke.

## Motion characteristics

| | Value |
|---|---|
| Shake | 3 segments × `micro` (80ms) = ~240ms total |
| Amplitude | `distance-micro`–`small` (4–6px), decaying |
| Easing | `out` — **never** bounce or elastic |
| Message entry | `quick` (150ms), opacity + `distance-micro` |
| Border/background colour | `quick` (150ms) |
| Repeat | **once**. Never loop. |

A shake is horizontal (`translateX`), small, and decays: `-6, +5, -3, +2, 0`. A large or slow shake reads as a glitch, not feedback.

Errors do not get playful easing. Ever.

## Preferred implementation

1. **Level 1** — CSS keyframe on a state class. This is the entire pattern.
2. **Level 2** — the error *message* entering the DOM uses `animate.enter`.
3. **Level 3+** — no gate applies.

## Angular lifecycle considerations

- The shake class must be **orthogonal to the error state**. `isInvalid` persists; `isShaking` is momentary. If you use one class for both, the shake can't replay on a second failed submit.
- Clear the momentary class on `(animationend)` so the next failure can set it again. That covers the normal case.
- **Replaying while a shake is still in flight** is where the class approach breaks, and it's what the `offsetWidth` reflow hack exists to work around. Don't use the hack — call `Element.animate()` instead. Each call returns a fresh `Animation`, so it replays reliably with no class bookkeeping, no forced reflow, and automatic cleanup:

  ```ts
  private readonly field = viewChild.required<ElementRef<HTMLElement>>('field');

  /** Call on failed submit. */
  reject(): void {
    this.invalid.set(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.field().nativeElement.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
       { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' },
       { transform: 'translateX(0)' }],
      { duration: 240, easing: 'ease-out' },
    );
  }
  ```

  This is imperative, but it animates only — it does not touch lifecycle or state, so it stays on the right side of the ownership line.
- The error must be in the accessibility tree with `role="alert"` / `aria-live="assertive"` and `aria-invalid` on the control, set from state. The shake is decoration; the announcement is the actual feedback.
- Focus the first invalid field on submit — immediately, not after the shake.
- Don't shake on `input` events. Shake on submit or on blur-validate.

## GSAP considerations

Not needed. If a design genuinely calls for a physical spring shake, `gsap.fromTo(el, { x: -6 }, { x: 0, ease: 'elastic.out(1, 0.3)', duration: 0.4 })` — but re-read the easing rule above first; this is rarely right.

## Reduced motion

**No shake.** Motion that deliberately jitters is the worst case for vestibular sensitivity. Keep the colour change, the border, the icon, and the message — all of which carry the information. Optionally a very brief opacity pulse on the message.

The error must still be obvious without any motion. If removing the shake makes the error hard to notice, the static design is wrong.

## Common mistakes

- Shake amplitude over ~8px, or duration over ~300ms.
- A looping or repeating shake.
- Bounce/elastic easing on an error.
- One class for "invalid" and "shaking", so the second failure doesn't animate.
- `offsetWidth` reflow hack to restart the keyframe.
- Colour as the only error indicator (fails colour-blind users) — the shake doesn't fix that; an icon and text do.
- Shaking on every keystroke.
- Error message announced only after the animation.
- Focus moved to the field after the shake completes.

## Example

```ts
@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #field class="field" [class.field--invalid]="invalid()">
      <input [attr.aria-invalid]="invalid()" [attr.aria-describedby]="invalid() ? errId : null" />
    </div>

    @if (invalid()) {
      <p class="field__error" [id]="errId" role="alert" animate.enter="err-enter">
        {{ message() }}
      </p>
    }
  `,
})
export class Field {
  protected readonly errId = `err-${crypto.randomUUID()}`;
  protected readonly invalid = signal(false);
  protected readonly message = signal('');
  private readonly field = viewChild.required<ElementRef<HTMLElement>>('field');

  /** Call on failed submit — replays even if a shake is already running. */
  reject(message: string): void {
    this.message.set(message);
    this.invalid.set(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.field().nativeElement.animate(SHAKE_KEYFRAMES, { duration: 240, easing: 'ease-out' });
  }
}

const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: 'translateX(0)' },  { transform: 'translateX(-6px)' },
  { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' },
  { transform: 'translateX(0)' },
];
```

```scss
.field {
  transition: border-color var(--duration-quick) var(--ease-out);
  &--invalid { border-color: var(--color-danger); }
}

.err-enter { animation: err-in var(--duration-quick) var(--ease-out); }
@keyframes err-in { from { opacity: 0; transform: translateY(calc(-1 * var(--distance-micro))); } }

@media (prefers-reduced-motion: reduce) {
  .err-enter { animation: fade-in var(--duration-quick) var(--ease-out); }
  // the shake never runs — reject() returns early. Colour, icon and message carry the error.
}
```
