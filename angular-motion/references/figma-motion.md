# Figma motion specs

Read when the motion requirement comes from a Figma file, a prototype, or a designer's spec.

## The spec is evidence, not a suggestion

If Figma specifies motion — a Smart Animate transition, an animation style, keyframes, easing, duration, or a documented interaction — that is **design intent**. Do not substitute your own values because they match this skill's token table better.

| Figma provides | Do |
|---|---|
| Duration + easing | Use them. Map to the nearest existing project token **only if** it is within ~20% and the semantics match; otherwise use the literal value and say so. |
| A named easing/animation style | Map it to the project's easing token of the same intent. |
| A transition type (Smart Animate / Dissolve / Move In / Push) | Determines the pattern — see the mapping below. |
| Only two static frames, no interaction defined | Fall back to this skill's `decision-rules.md`. |
| A prototype with delays, triggers, and ordering | That is a sequence — likely level 4. |

Tooling: `get_motion_context` returns motion data for an animated node; `get_design_context` will tell you when to call it. Use it rather than guessing from two screenshots.

## Transition-type mapping

| Figma transition | Pattern | Notes |
|---|---|---|
| Dissolve | State swap / fade | Level 1–2, opacity only |
| Smart Animate | Depends on what moved | If one element moves between frames → tween its transform. If many → timeline. Do **not** try to reproduce Figma's automatic layer matching generically. |
| Move In / Out | Panel / drawer | Direction comes from the spec |
| Push | Page transition | Two surfaces moving together — timeline |
| Slide In / Out | Panel, or toast | Anchoring decides |
| Instant | No animation | Respect it |

## Adaptation is allowed; reinterpretation is not

You may change **how** it is implemented: Figma's spring becomes a `cubic-bezier` or a GSAP ease; Figma's absolute-position interpolation becomes a `transform`. You may not change **what** it communicates: direction, ordering, which element moves, or whether something animates at all.

If the spec is not implementable as given (a 1.2s spring on a frequently-clicked control, a motion that breaks reduced-motion legibility, an animation on `width` for a full-page surface), implement the closest correct version and flag the deviation in one line. Do not silently "fix" it.

## Two frames differing is not a transition

A hover frame and a default frame differ. That means there are two states, not that every property between them must be animated. Animate the properties that carry the change (usually transform/opacity/color); leave the rest to switch.

Especially: do not animate text content, layout reflow, or element count differences between frames just because Smart Animate would.

## Reduced motion is still yours

Figma specs almost never include a reduced-motion variant. Build one anyway per `accessibility.md`. This is the one case where you add something the spec doesn't ask for.

## Checklist

- [ ] Motion data actually read from Figma, not inferred from static frames.
- [ ] Duration/easing from the spec, or a deviation stated.
- [ ] Direction and ordering preserved.
- [ ] Nothing animated that the spec didn't specify.
- [ ] Reduced-motion variant added.
