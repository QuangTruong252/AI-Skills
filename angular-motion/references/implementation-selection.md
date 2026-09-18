# Implementation selection

> Prefer the lowest-complexity implementation capable of expressing the required motion.

Start at level 1. Move up **only** by naming the specific capability the current level lacks. "It would be cleaner in GSAP" is not a capability.

## The ladder

### Level 1 — CSS only

```
transition | @keyframes | :hover :focus-visible :active | state class bound with [class.x]
```

Use when **all** are true:

- No element is inserted into or removed from the DOM.
- One element, or a few children with fixed `transition-delay`.
- Properties are `transform`, `opacity`, `color`, `background`, `border-color`, `box-shadow`, `grid-template-rows`.
- Timing is constant, known at authoring time.

Covers: hover, focus, press, checked/toggle, icon swap, tabs indicator (when the indicator is a pseudo-element or flexbox child), shimmer, skeleton pulse, spinner, error shake, accordion via `grid-template-rows`.

→ `examples/css-motion.md`

### Level 2 — Angular lifecycle + CSS

```
@if (open()) { <div animate.enter="…" animate.leave="…"> }
```

Use when the element enters/leaves the DOM but the motion is still a plain transition or keyframe.

Angular applies the class at insertion, waits for the animation on removal, then removes the node. No timers, no `.is-closing` bookkeeping, no forced reflow.

Covers: most modals, dropdowns, tooltips, toasts, drawers, empty states, conditional banners.

→ `references/angular-lifecycle.md`, `examples/angular-enter-leave.md`

### Level 3 — Angular lifecycle + GSAP tween

Use when **at least one gate** is true. Name the gate in your implementation note.

A gate only opens if CSS and the native platform genuinely cannot do the job. Several things that look like gates are not:

| Looks like a gate | But CSS already does it |
|---|---|
| "Multiple elements" | `transition-delay` / `animation-delay` per `:nth-child` |
| "It's a fixed sequence" | Chained `animation-delay`, or one keyframe with percentage stops |
| "SVG stroke drawing" | `stroke-dashoffset` is a plain animatable CSS property |
| "It must be interruptible" | A CSS `transition` is interruptible and resolves from the current value. Only `@keyframes` isn't. |
| "It must reverse" | A transition reverses by removing the state class |
| "Unknown height" | `grid-template-rows: 0fr → 1fr` |
| "It must survive resize" | Percentage/`%`-based transforms |

The real gates:

| Gate | Example | Why CSS can't |
|---|---|---|
| A value must be **measured** at runtime and fed into the motion | Fly an element from its current rect to a computed target | CSS has no access to measured geometry |
| Geometry changes **between** invocations | FLIP reflow of a list after an item is removed | Same |
| Interruption must resolve from a **keyframe's** current value | A multi-stop keyframe sequence that can be cancelled halfway | Keyframes restart or jump; transitions can't express multi-stop |
| **High-frequency** pointer input | `pointermove`, drag, tilt, cursor follow | A transition per event fights itself; no `quickTo` equivalent |
| A **numeric value** must be interpolated and formatted | Counter, progress readout | CSS can interpolate `@property` integers but cannot format them |
| **Scroll-linked progress** beyond what `animation-timeline` supports in the project's baseline | Scrubbed, pinned, or multi-trigger scroll sequences | — |
| Coordinated **seek / reverse / pause** of a whole sequence as one object | A toggle that must reverse a 4-step sequence from any point | No CSS equivalent |
| Motion paths, independent per-axis 3D | `motionPath`, per-axis `rotationX/Y/Z` control | CSS transforms compose as one matrix |

→ `references/gsap.md`, `examples/gsap-context.md`

### Level 4 — Angular lifecycle + GSAP timeline

Use when two or more animations have a **timing relationship**: sequencing, overlap, stagger, or a shared progress you may need to reverse or seek.

If the animations are genuinely independent, they are level 3 tweens, not a timeline. If they are a sequence, they must be **one** timeline — do not simulate a sequence with `delay` on separate tweens.

Covers: backdrop-then-content modals, multi-stage success sequences, coordinated page transitions, staggered reveals with a follow-on step.

→ `examples/gsap-timeline.md`

## Tie-breakers

Applied in order when two levels both look viable.

1. **DOM insertion/removal always goes through Angular.** Even at levels 3–4, use `animate.enter`/`animate.leave` and call `animationComplete()`. GSAP never decides whether a node exists.
2. **Prefer the level the surrounding code already uses.** Consistency beats a marginally better fit.
3. **Interruptibility decides between a CSS keyframe and everything else.** `@keyframes` cannot be interrupted gracefully — it restarts or jumps. If the user can reverse it mid-flight, use a CSS `transition` (level 1/2) or GSAP (level 3+).
4. **Intrinsic height decides accordion-shaped problems.** `grid-template-rows: 0fr → 1fr` is level 1 and handles unknown height. Reach for GSAP only if content resizes while open.
5. **Count of coordinated elements.** 1 → levels 1–3. 2+ with shared timing → level 4.
6. **If still tied, take the lower level.**

## Reasons that are NOT sufficient to climb

- GSAP is already installed.
- The team likes GSAP.
- The design "feels premium".
- It might need to be more complex later.
- A timeline reads more nicely than three CSS rules.
- Another component in the repo used GSAP for something unrelated.

## Recording the decision

One line in the PR/summary, always:

```
Level 2 — modal enters/leaves the DOM; motion is opacity+scale with no sequencing. No GSAP needed.
```

```
Level 3 — pointer-driven tilt needs runtime rect math and 60fps updates (gate: high-frequency pointer input). gsap.quickTo, disabled on coarse pointers.
```

This line is what makes the choice auditable and reproducible.
