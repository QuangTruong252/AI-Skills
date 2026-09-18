# angular-motion

A reusable motion-engineering skill for Angular. Pattern-first, engine-second.

```
Angular owns the DOM lifecycle.
CSS / GSAP owns the visual motion.
```

## What it is

An instruction package for an AI coding agent working on animation in an Angular codebase. It routes a request like *"animate this modal"* through: audit the project → classify the interaction into a motion pattern → pick the **lowest-complexity engine** that can express it (CSS → `animate.enter`/`animate.leave` → GSAP tween → GSAP timeline) → verify lifecycle, accessibility and performance.

It is deliberately **not** a snippet library. The value is the decision rules.

## Activation

Loads for: animation, transition, motion, enter/leave, reveal, stagger, hover motion, page transition, micro-interaction, loading motion, GSAP, motion review/polish, Figma motion specs.

Does **not** load for: general Angular component work, layout, styling, or state management with no motion requirement.

## Layout

```
SKILL.md                    router — purpose, workflow, decision hierarchy, critical rules
references/                 rules (what to decide)
  project-audit.md          the 10 checks to run before writing anything
  decision-rules.md         interaction → motion pattern
  implementation-selection.md   the CSS/Angular/GSAP ladder and its gates
  angular-lifecycle.md      animate.enter/leave, cleanup, element refs
  gsap.md                   API selection, context, matchMedia, cleanup
  motion-tokens.md          semantic duration/easing/distance/scale/blur scale
  accessibility.md          reduced motion, focus, keyboard, vestibular safety
  performance.md            property cost, layout reads, pointer handling
  anti-patterns.md          what not to do, with the fix
  verification.md           the pre-done checklist
  figma-motion.md           when the spec comes from Figma
  patterns/                 16 pattern specs + index
examples/                   code (how to write it)
tests/check_skill.py        structural check (see below)
```

Progressive disclosure is the point: `SKILL.md` is ~110 lines and routes to what the task needs. A typical modal task reads five files, not the catalog.

## Prerequisites and boundaries

- **Angular 20.2+** for `animate.enter` / `animate.leave`. Fallbacks for 17–20.1 are documented in `references/project-audit.md`; the canonical examples are not written for them.
- `@angular/animations` is deprecated as of v20.2. The skill never introduces it into new code.
- **GSAP is optional.** Levels 1–2 cover most work. The skill will not add the dependency without asking.
- No dependency on Tailwind, Angular Material, PrimeNG, or any design system.
- Project conventions outrank this skill's defaults unless they cause a correctness or accessibility defect.

## Structural check

```bash
python angular-motion/tests/check_skill.py
```

Verifies: required files exist, `SKILL.md` frontmatter has `name` and `description`, every relative `.md` link resolves, and every pattern file is listed in the pattern index (and vice versa). Exits non-zero with file-specific errors.

## What has and hasn't been verified

**Checked:** the structural check above; every internal reference resolves; the Angular and MDN behaviors the examples depend on were read from the official docs — specifically that Angular removes `animate.enter` classes on completion (so base CSS must be the resting state), the `AnimationCallbackEvent` / `animationComplete()` / `MAX_ANIMATION_TIMEOUT` contract, and that a native `<dialog>` exit animation requires `display`/`overlay` in the transition list with `transition-behavior: allow-discrete`.

**Not verified:** nothing in this package has been compiled or run. There is no Angular fixture, no build, no browser run. The code examples are written against the documented APIs but have **not** been type-checked against a real `@angular/core` or `gsap`, and no animation has been observed executing. Browser behavior is untested in every engine. Screen-reader behavior is reasoned from spec, not measured. No agent trial has been run to confirm that two agents following this skill converge on similar implementations.

Treat the examples as reference implementations to adapt and test, not as drop-in verified components. If you add a fixture and run them, the findings belong in this section.
