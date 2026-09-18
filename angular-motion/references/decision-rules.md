# Decision rules — classify before you animate

"Animate this" is not a specification. Convert it into a **motion pattern** first. The pattern determines the motion characteristics; the engine is chosen afterwards (`implementation-selection.md`).

## Step 1 — Answer three questions

1. **Does the element enter or leave the DOM?** Yes → the pattern needs a lifecycle (level 2+). No → a state transition may be enough (level 1).
2. **Where does it live spatially?** Anchored to a trigger / centered over the page / in the document flow / at a screen edge / in a fixed slot.
3. **What does the motion communicate?** Appearance, dismissal, state change, progress, success, failure, or direct response to the pointer.

## Step 2 — Match the signal

| Interaction signal | Pattern | File |
|---|---|---|
| Floating surface anchored to a trigger | Dropdown / popover / menu | `patterns/dropdown.md` |
| Centered surface that blocks the page | Modal / dialog | `patterns/modal.md` |
| Collapsible region inside the document flow | Accordion / disclosure | `patterns/accordion.md` |
| Surface arriving from a screen edge | Panel / drawer / sheet | `patterns/panel-drawer.md` |
| Transient message that self-dismisses | Toast / banner stack | `patterns/toast.md` |
| Hover/focus hint attached to a trigger | Tooltip | `patterns/tooltip.md` |
| Selected indicator travelling between segments | Tabs / segmented control | `patterns/tabs.md` |
| Route or view replacing another | Page transition | `patterns/page-transition.md` |
| A list/section appearing with rhythm | Text reveal / stagger | `patterns/text-reveal.md` |
| Content replaced in the same spatial slot | State swap (text, icon, label) | `patterns/state-swap.md` |
| Action completed | Success feedback | `patterns/success-feedback.md` |
| Action rejected or invalid | Error feedback | `patterns/error-feedback.md` |
| A number changing meaningfully | Counter | `patterns/counter.md` |
| Surface responding continuously to the pointer | Card tilt / pointer follow | `patterns/card-tilt.md` |
| Placeholder standing in for pending content | Skeleton / shimmer | `patterns/skeleton-loading.md` |
| Text arriving incrementally from a stream | Streaming text | `patterns/streaming-text.md` |
| Hover/focus/press on a control, nothing enters or leaves | *No pattern file needed* | Level 1 CSS. See `examples/css-motion.md`. |

If two rows fit, pick by **spatial behavior**, not by component name. A "modal" that slides up from the bottom edge on mobile is a panel there and a modal on desktop — that is a real, expected split (`examples/gsap-match-media.md`).

If nothing fits, pick the nearest row, say which one and why, and follow it. Do not invent a bespoke motion.

## Step 3 — Derive the motion characteristics

Each pattern file gives them. The general derivation, when you need to reason from scratch:

| Question | Consequence |
|---|---|
| How often does the user trigger it? | Frequent → shorter duration, smaller distance. A 500ms dropdown is unusable. |
| Is it a dismiss? | Dismiss is always faster than the corresponding open. |
| Does it have a spatial origin? | Anchored → scale from `transform-origin`. Edge → translate along one axis. Centered → scale + fade, no translation. |
| Does it interrupt the user? | Blocking (modal, error) can be slightly more expressive. Passive (tooltip, skeleton) must be nearly invisible. |
| Is it reversible mid-flight? | Yes → the engine must support interruption (level 3+ or a CSS transition, never a CSS keyframe). |
| Is the change meaningful or decorative? | Decorative → consider not animating it at all. |

## Step 4 — Sanity gate

Before implementing, confirm all four:

- [ ] The motion communicates something the static UI does not.
- [ ] Its duration is proportional to how often it fires.
- [ ] There is a defined reduced-motion behavior that keeps the interaction legible.
- [ ] The pattern, not the available library, drove the choice.

Failing the first one is the common case. The correct output is then: *"This doesn't need motion — here's why"*, and stop.

## Worked classifications

> **"Add a subtle hover effect to this button."**
> No DOM change, single element, pointer state. → no pattern file, level 1 CSS, `--duration-quick`, `transform`/`color` only. GSAP would be a defect.

> **"Animate this modal entering and leaving."**
> Enters/leaves DOM, centered, blocking. → `patterns/modal.md`, level 2 (`animate.enter`/`animate.leave` + CSS) unless a backdrop/content sequence is specified, which lifts it to level 4.

> **"Staggered reveal for 12 cards."**
> Multiple elements, timing relationship. → `patterns/text-reveal.md`, level 4 GSAP timeline with `stagger`, or level 2 + CSS `animation-delay` if the 12 are static and never re-shuffle. Reduced motion drops the stagger.

> **"Card tilt that follows the pointer."**
> Continuous pointer input, runtime geometry. → `patterns/card-tilt.md`, level 3 GSAP with `quickTo`. Disabled entirely on coarse pointers and under reduced motion.

> **"Animate this accordion."**
> Document flow, height is intrinsic. → `patterns/accordion.md`. Try CSS `grid-template-rows: 0fr → 1fr` (level 1/2) first; GSAP only if the content height changes while open or the motion must coordinate with siblings.
