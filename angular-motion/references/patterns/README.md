# Pattern catalog

Read **one** file — the one `decision-rules.md` routed you to. Not the catalog.

Every file has the same sections: Intent · Do not use when · Motion characteristics · Preferred implementation · Angular lifecycle · GSAP · Reduced motion · Common mistakes · Example.

A pattern is **not** bound to an engine. `modal.md` describes modal motion; whether it's CSS, `animate.enter`, or a GSAP timeline is decided in `implementation-selection.md`.

| Pattern | Spatial model | Typical level |
|---|---|---|
| [modal](modal.md) | Centered, blocking | 2 (4 if sequenced) |
| [dropdown](dropdown.md) | Anchored to a trigger | 2 |
| [tooltip](tooltip.md) | Anchored, hover-scoped | 1–2 |
| [accordion](accordion.md) | In document flow | 1–2 |
| [panel-drawer](panel-drawer.md) | From a screen edge | 2 |
| [toast](toast.md) | Fixed corner, stacking | 2 (4 for stacks) |
| [tabs](tabs.md) | Indicator inside a track | 1 |
| [page-transition](page-transition.md) | Whole view replacing another | 2–4 |
| [text-reveal](text-reveal.md) | Sequential group entry | 1 (static) / 4 (dynamic) |
| [state-swap](state-swap.md) | Same slot, new content | 1–2 |
| [success-feedback](success-feedback.md) | In-place confirmation | 1–4 |
| [error-feedback](error-feedback.md) | In-place rejection | 1 |
| [counter](counter.md) | Numeric value changing | 3 |
| [card-tilt](card-tilt.md) | Pointer-continuous | 3 |
| [skeleton-loading](skeleton-loading.md) | Placeholder → content | 1–2 |
| [streaming-text](streaming-text.md) | Incremental arrival | 1–2 |

Not listed and not needed as a file: hover, focus, press, checkbox/toggle, icon swap, notification badge, like button, avatar hover, input clear. These are all level-1 CSS — see `examples/css-motion.md`. Adding a pattern file for them would be the catalog animating itself.
