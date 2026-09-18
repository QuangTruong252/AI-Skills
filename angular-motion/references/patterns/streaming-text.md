# Streaming text / incremental content

## Intent

Content arriving progressively over time and rendering as it lands. The motion says *"this is being produced right now"*. LLM responses, live transcription, log tails, agent reasoning traces, server-sent events.

## Do not use when

- The content is already complete — a fake typewriter effect on static text wastes the user's time and is widely disliked.
- The chunks arrive faster than ~100ms apart — per-chunk animation becomes a flicker. Batch, or don't animate.
- The content is a data table or anything the user will scan rather than read.

## Motion characteristics

| | Value |
|---|---|
| Per-token fade-in | `quick` (150ms), opacity 0 → 1 |
| Optional blur | `blur-small` → 0, same duration |
| Optional translate | `distance-micro` at most |
| Caret | 1s blink, or a pulsing block at the tail |
| Container growth | no explicit animation — the layout grows naturally |
| Batch window | ~50–100ms of tokens per animated unit |

Animate the **newly arrived** unit only. Never re-animate text that's already on screen — that's the single most common bug in this pattern, and it makes the whole block strobe on every chunk.

Word-level batching reads better than character-level, and costs far less.

## Preferred implementation

1. **Level 1** — CSS animation applied to newly rendered spans. The browser removes the class' effect when the keyframe ends; nothing to clean up.
2. **Level 2** — `@for` over chunks with `animate.enter` on each. Angular fires enter **only for newly inserted nodes**, which is exactly the semantics this pattern needs — this is usually the right answer.
3. **Level 3+** — no gate. A GSAP tween per token is pure overhead at streaming frequency.

## Angular lifecycle considerations

- Model the stream as `signal<Chunk[]>` where each chunk has a stable id. `@for (c of chunks(); track c.id)` + `animate.enter`. Angular animates only the new nodes.
- **Never** re-render the whole string as one node per update — every update replaces the text and re-animates everything.
- Batch incoming tokens into ~50–100ms chunks before pushing to the signal. Raw token-per-signal-update at 30 tokens/s is 30 change-detection cycles per second.
- `aria-live="polite"` on the container announces incrementally; for long streams prefer announcing on completion instead, or screen readers become unusable. Consider `aria-busy="true"` during the stream and a single announcement at the end.
- Auto-scroll on new content only if the user was already at the bottom. Two ordering rules, both easy to get wrong:
  1. **Measure before the state update.** After `chunks.update()` the DOM hasn't re-rendered yet, but reading `scrollHeight` later — post-render — compares against content the user never saw. Capture "was following" first.
  2. **Scroll after the render.** `queueMicrotask` runs before Angular paints, so it scrolls to a stale height and falls one chunk behind forever. Use `afterNextRender({ write })` with an explicit `Injector`, since `append()` is called outside an injection context.
- The scroll must be instant, not smooth, during streaming — smooth scrolling never catches up to a live stream.
- Clean up the subscription/`AbortController` on destroy.
- `ChangeDetectionStrategy.OnPush` is mandatory here.

## GSAP considerations

Not appropriate. Per-token tweens at streaming rates allocate continuously and give nothing CSS doesn't. If the design calls for a scrubbed reasoning trace that scrolls with a timeline, that's a different pattern.

## Reduced motion

Plain append, no fade, no blur, no caret blink (a static caret is fine). The text arriving *is* the motion; the styling on top is decorative and can go entirely.

## Common mistakes

- Re-animating the entire text on every chunk.
- Per-character animation at 30 tokens/s.
- A typewriter effect on already-complete text.
- Signal update per token → change-detection storm.
- `aria-live` announcing every chunk on a 2000-word response.
- Auto-scroll that fights a user who scrolled up to read.
- Reading the follow-state *after* pushing the chunk, or scrolling *before* the render — both leave the view one chunk behind.
- `scroll-behavior: smooth` during streaming — the view never catches up.
- Animating the container's height as it grows.
- No `track` / index tracking → nodes reused and the wrong things animate.

## Example

```ts
@Component({
  selector: 'app-stream',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stream" #scroller [attr.aria-busy]="streaming()">
      @for (chunk of chunks(); track chunk.id) {
        <span class="stream__chunk" animate.enter="chunk-enter">{{ chunk.text }}</span>
      }
      @if (streaming()) { <span class="stream__caret" aria-hidden="true"></span> }
    </div>
    <span class="sr-only" aria-live="polite">{{ streaming() ? '' : fullText() }}</span>
  `,
})
export class Stream {
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  protected readonly chunks = signal<{ id: number; text: string }[]>([]);
  protected readonly streaming = signal(false);
  protected readonly fullText = computed(() => this.chunks().map((c) => c.text).join(''));

  private readonly injector = inject(Injector);

  /** Called by the transport with already-batched text (~50–100ms worth). */
  append(text: string): void {
    const el = this.scroller().nativeElement;

    // 1. Decide BEFORE the update, while the DOM still reflects the old content.
    //    Reading after the update would compare against content that isn't rendered yet.
    const wasFollowing = el.scrollHeight - el.scrollTop - el.clientHeight < 32;

    // 2. Update state.
    this.chunks.update((c) => [...c, { id: c.length, text }]);

    // 3. Scroll only after Angular has actually rendered the new chunk.
    //    queueMicrotask fires before render and would scroll to a stale height.
    if (wasFollowing) {
      afterNextRender({ write: () => (el.scrollTop = el.scrollHeight) }, { injector: this.injector });
    }
  }
}
```

```scss
.chunk-enter { animation: chunk-in var(--duration-quick) var(--ease-out); }
@keyframes chunk-in { from { opacity: 0; filter: blur(var(--blur-small)); } }

.stream__caret {
  display: inline-block; inline-size: 0.5ch; block-size: 1em;
  background: currentColor; vertical-align: text-bottom;
  animation: caret 1s steps(2) infinite;
}
@keyframes caret { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .chunk-enter { animation: none; }
  .stream__caret { animation: none; }
}
```

Angular fires `animate.enter` only on the newly inserted chunk. Existing text is never touched — which is the whole point.
