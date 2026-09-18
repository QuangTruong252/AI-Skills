# Motion tokens

## Rule zero

> Inspect the project for existing motion tokens first. Reuse them.

Only if none exist may you use the scale below, and prefer adding it to the project's existing token file over creating a new one. Two motion scales in one codebase is a defect.

## Rule one — select by intent, never by nearest number

Wrong: *"the modal closes in 300ms, 350ms is closest, use `medium`."*
Right: *"the modal closes — a close is a dismiss — dismiss uses `quick`."*

A value is wrong when it doesn't match its motion's purpose, not when it differs by 20ms. Infer the motion type, then take the token whose documented usage matches.

## Duration

Seconds for GSAP; ×1000 for CSS.

| Token | s | ms | Use for |
|---|---|---|---|
| `stagger` | 0.04 | 40 | Per-item offset in a sequence. Not a duration. |
| `micro` | 0.08 | 80 | Tooltip delay, a shake segment, sub-steps inside a sequence. |
| `quick` | 0.15 | 150 | Dismiss and close. Hover-in. Icon/text swap. Anything that fires constantly. |
| `fast` | 0.25 | 250 | Dropdown/modal open. The default for a surface appearing. |
| `medium` | 0.35 | 350 | Panel/drawer close. Larger surfaces leaving. |
| `slow` | 0.40 | 400 | Panel/drawer open. Large travel distance. |
| `emphasis` | 0.50 | 500 | A moment the user should notice: success, badge appear, celebratory. Rare. |

Nothing routine exceeds `emphasis`. If you want 800ms, you want a different pattern.

## Easing

Each engine gets its own idiom. **GSAP does not parse `cubic-bezier()` strings** — passing one as `ease:` silently falls back to the default. Use GSAP's named eases; use the curves in CSS.

| Token | CSS | GSAP | Use for |
|---|---|---|---|
| `smoothOut` | `cubic-bezier(0.22, 1, 0.36, 1)` | `power4.out` | Default for surfaces entering and leaving. |
| `out` | `ease-out` | `power2.out` | Simple single-property moves. |
| `inOut` | `ease-in-out` | `power2.inOut` | Reversible motion that travels and stops (tabs indicator, toggle thumb). |
| `linear` | `linear` | `none` | Loops, progress, shimmer, spinners. |
| `bounce` | `cubic-bezier(0.34, 1.36, 0.64, 1)` | `back.out(1.4)` | Slight overshoot — hover-out, playful confirmation. Needs design intent. |

These are near-equivalents, not identical curves. If a design needs exact parity across engines, register `CustomEase` once at bootstrap and use the same cubic-bezier in both:

```ts
gsap.registerPlugin(CustomEase);
CustomEase.create('smoothOut', '0.22, 1, 0.36, 1');   // then ease: 'smoothOut'
```

Don't do this by default — it adds a plugin for a difference nobody can see.

Never `ease-in` alone for something entering — it makes the UI feel late. Never a bounce on an error, a dismiss, or anything safety-related.

## Distance

| Token | px | Use for |
|---|---|---|
| `micro` | 4 | Hover lift, a nudge. |
| `small` | 6 | Tooltip offset. |
| `base` | 8 | Dropdown/toast entry travel. The default. |
| `medium` | 12 | Larger surface entry. |
| `large` | 30 | Section reveal, page transition. |

Distance scales with ceremony and inversely with frequency. A frequently-triggered element travels less.

## Scale

The "pre" scale an element animates **from** (and returns to on exit). Always → `1`.

| Token | Value | Use for |
|---|---|---|
| `large` | 0.96 | Modal, dialog. |
| `medium` | 0.97 | Dropdown, popover. |
| `small` | 0.98 | Card, tile. |
| `tiny` | 0.99 | Button press, subtle emphasis. |

Never scale from 0 — it reads as a cartoon, and text renders illegibly on the way up.

## Blur

| Token | Value | Use for |
|---|---|---|
| `small` | 2px | Text settling in. |
| `medium` | 3px | Content swap. |
| `large` | 8px | Backdrop, dimmed layer. |

Blur is never a resting state on content — it always animates to `0`. It is expensive (`performance.md`); use it on small areas, or not at all.

## Open / close asymmetry

Default: **exit is one step faster than enter.**

| Pattern | Enter | Exit |
|---|---|---|
| Modal | `fast` | `quick` |
| Dropdown / popover | `fast` | `quick` |
| Tooltip | `quick` (+ `micro` delay in) | `quick` (no delay out) |
| Toast | `fast` | `quick` |
| Panel / drawer | `slow` | `medium` |
| Page transition | `medium` | `quick` |

Symmetric exceptions — reversible motions where asymmetry looks broken: tabs indicator, accordion, toggle, checkbox, icon swap.

**Never delay a close.** A delay gates an accidental open (tooltip hover intent); it must never gate a dismiss.

## Hover

Hover-in is quick and direct (`quick` + `out`). Hover-out may be slightly softer or springier (`fast` + `bounce`) — the reverse is jarring.

## Stagger

`stagger` (40ms) per item. Keep the **total** under ~300ms: with more than ~8 items, reduce the per-item offset or use `stagger: { amount: 0.3 }` so the total is fixed regardless of count. Drop stagger entirely under reduced motion.

## Fallback definitions

Use these only when the project has none. Put them where the project's other tokens live.

**Two representations, one scale.** CSS needs milliseconds and custom properties; GSAP needs seconds and named eases. That is one scale expressed for two engines — not a second token system. Keep them in **one file** so they cannot drift, and change both together. The rule this skill enforces is "no second *scale*", not "no second representation".

Only add the TypeScript half if the project actually uses GSAP. Never require JavaScript for motion that is CSS-only.

```ts
// motion.tokens.ts — seconds + GSAP eases. Mirror of the CSS block below; edit together.
export const MOTION_DURATION = {
  stagger: 0.04, micro: 0.08, quick: 0.15,
  fast: 0.25, medium: 0.35, slow: 0.4, emphasis: 0.5,
} as const;

export const MOTION_EASE = {
  smoothOut: 'power4.out',     // ≈ cubic-bezier(0.22, 1, 0.36, 1)
  out: 'power2.out',
  inOut: 'power2.inOut',
  linear: 'none',
  bounce: 'back.out(1.4)',     // ≈ cubic-bezier(0.34, 1.36, 0.64, 1)
} as const;

export const MOTION_DISTANCE = { micro: 4, small: 6, base: 8, medium: 12, large: 30 } as const;
export const MOTION_SCALE = { large: 0.96, medium: 0.97, small: 0.98, tiny: 0.99 } as const;
```

```scss
// _motion.scss — milliseconds + CSS curves. Mirror of motion.tokens.ts; edit together.
:root {
  --duration-stagger: 40ms;  --duration-micro: 80ms;
  --duration-quick: 150ms;   --duration-fast: 250ms;
  --duration-medium: 350ms;  --duration-slow: 400ms;
  --duration-emphasis: 500ms;

  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out: ease-out;
  --ease-in-out: ease-in-out;
  --ease-linear: linear;
  --ease-bounce: cubic-bezier(0.34, 1.36, 0.64, 1);

  --distance-micro: 4px; --distance-small: 6px; --distance-base: 8px;
  --distance-medium: 12px; --distance-large: 30px;

  --scale-large: 0.96; --scale-medium: 0.97; --scale-small: 0.98; --scale-tiny: 0.99;
  --blur-small: 2px; --blur-medium: 3px; --blur-large: 8px;
}
```

Don't add a build step or a generator to derive one from the other. Seven numbers in one file, edited together, is cheaper than the tooling.

## Reviewing existing values

When polishing motion that already exists: infer each animation's type, then check its value against this table. Report by usage mismatch (`"dropdown close at 400ms — a close should be quick/150ms"`), not by numeric distance. Don't churn a 240ms that means `fast`.
