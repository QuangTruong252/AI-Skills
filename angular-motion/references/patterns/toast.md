# Toast / notification / banner stack

## Intent

A transient message that appears without being asked for, and usually leaves on its own. The motion says *"something happened elsewhere"*. Save confirmations, errors, undo prompts, background job results.

## Do not use when

- The user must respond before continuing → [modal](modal.md).
- It's inline validation attached to a field → [error-feedback](error-feedback.md).
- It's a hover hint → [tooltip](tooltip.md).

## Motion characteristics

| | Enter | Exit |
|---|---|---|
| Duration | `fast` (250ms) | `quick` (150ms) |
| Easing | `smoothOut` | `smoothOut` |
| Opacity | 0 → 1 | 1 → 0 |
| Translate | `distance-base`–`medium` from its edge | `distance-micro` back, or none |
| Scale | optional `scale-small` → 1 | none |

Direction follows the corner: bottom-anchored toasts rise, top-anchored ones drop. A toast never slides sideways from a bottom corner.

**Stacking** (multiple toasts): existing toasts shift to make room in `fast`/`smoothOut`, simultaneously with the new one entering. When one leaves, the rest close the gap in `quick`.

## Preferred implementation

1. **Level 2** — `@for` over a signal array with `animate.enter`/`animate.leave` per item. Correct for single toasts and simple stacks.
2. **Level 4** — GSAP timeline when the stack uses a depth effect (scaled/offset cards behind the front toast) or the reflow must be coordinated with the enter.
3. **Level 1** — no; toasts enter and leave the DOM.

**Be honest about the stack reflow.** When a toast is added or removed from a flex column, the siblings jump to their new positions instantly — layout is not animated, and a `transform` transition on the *entering* item does nothing for them. That instant reflow is usually fine and is the correct default: don't build machinery for it.

If animated reflow is actually required, you need a FLIP: measure the siblings' positions before the change, measure after, tween the delta. That is level 4 (GSAP `Flip`, or manual measure-and-tween), and it needs a design reason. The "cards stacked behind" style is the other case where the siblings genuinely have to move under your control.

## Angular lifecycle considerations

- The service owns a `signal<Toast[]>`; the template is `@for (t of toasts(); track t.id)`. Never mutate the DOM from the service.
- Auto-dismiss uses a timer — that is legitimate: it's a **business** delay, not an animation lifecycle guess. Clear it on destroy and on hover/focus.
- `role="status"` (polite) for informational, `role="alert"` for errors. The announcement fires on state change, not on animation end.
- Pause the dismiss timer on hover and on focus-within.
- `track` by a stable id, never by index — index tracking makes Angular reuse the wrong node and the wrong animation plays.
- A toast dismissed by the user and one dismissed by the timer take the same exit path.

## GSAP considerations

- For a depth stack, one timeline per state change moving all visible toasts to their new slot.
- `gsap.set` the incoming toast's start state before the timeline to avoid a first-frame flash.
- With `@for`, get elements via `viewChildren` — never a global selector.
- `onComplete → animationComplete()` for the leaving item.

## Reduced motion

Opacity only, `quick`. No travel, no stack shuffle animation (items jump to their new positions).

## Common mistakes

- `track $index` — causes the wrong toast to animate out.
- Animating the container instead of each toast.
- Enter animation delaying the `aria-live` announcement.
- A dismiss timer that keeps running while the user hovers to read.
- Long entrance (500ms+) for something that appears unprompted and often.
- A bounce on an error toast.
- Toasts stacking without a max count — 12 simultaneous animations.
- Removing the node before the exit animation via a timer instead of `animate.leave`.

## Example

```ts
@Component({
  selector: 'app-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toasts.items(); track t.id) {
        <div class="toast" [class.toast--error]="t.kind === 'error'"
             [attr.role]="t.kind === 'error' ? 'alert' : 'status'"
             animate.enter="toast-enter" animate.leave="toast-leave"
             (mouseenter)="toasts.pause(t.id)" (mouseleave)="toasts.resume(t.id)">
          {{ t.message }}
          <button type="button" (click)="toasts.dismiss(t.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastOutlet {
  protected readonly toasts = inject(ToastService);
}
```

```scss
.toasts { display: flex; flex-direction: column; gap: var(--space-2); }

.toast-enter { animation: toast-in  var(--duration-fast)  var(--ease-smooth-out); }
.toast-leave { animation: toast-out var(--duration-quick) var(--ease-smooth-out); }

@keyframes toast-in  { from { opacity: 0; transform: translateY(var(--distance-medium)) scale(var(--scale-small)); } }
@keyframes toast-out { to   { opacity: 0; transform: translateY(var(--distance-micro)); } }

@media (prefers-reduced-motion: reduce) {
  .toast-enter { animation: fade-in  var(--duration-quick) var(--ease-out); }
  .toast-leave { animation: fade-out var(--duration-quick) var(--ease-out); }
}
```
