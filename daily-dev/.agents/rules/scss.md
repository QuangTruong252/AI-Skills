# SCSS Rules

## Applicability

Apply this file to SCSS, visual styling, design tokens, responsive layout,
themes, and style overrides. This file owns styling implementation policy; it
does not redefine approval, testing, validation, or completion policy. Read
`../references/TOKENS.md` and verify actual style entry points before editing.

## Ownership boundaries

- Component-specific layout, visuals, states, and variants MUST remain in the
  component SCSS.
- Feature-level SCSS MAY own mixins and patterns used by multiple components in
  the same feature.
- Global styles MAY contain reset, typography foundations, theme/token
  declarations, approved utilities, and intentional application-wide
  overrides.
- Component-specific selectors MUST NOT be added to global stylesheets.
- A proposed global style, utility, or application-wide override is governed by
  [`core.md#high-risk-changes`](./core.md#high-risk-changes).

## Component roots and selectors

- Every non-trivial component MUST have a stable root class.
- Use `:host` only for host layout and encapsulation boundaries.
- Prefer BEM for reusable, stateful, or complex components; concise semantic
  child classes are acceptable for small components.
- Use standard state classes such as `.is-active`, `.is-disabled`,
  `.is-loading`, and `.has-error`.
- Authored selector nesting MUST NOT exceed three levels.
- Selectors MUST NOT mirror incidental DOM depth, prefix classes with tag names,
  or rely on generated Angular host attributes.
- Prefer stable classes to broad tag selectors.

## Reuse and isolation

- Do not import another component's private SCSS.
- Do not reuse another component's private class structure.
- Do not use cross-feature `%placeholder` or `@extend` coupling.
- New Sass code MUST use `@use` rather than `@import` when the current Sass
  configuration supports it.
- Mixins SHOULD be reserved for parameterized behavior or generated
  declarations, not simple declaration sharing.

## Token consumption

- Feature and component SCSS MUST consume approved semantic `--app-*` tokens.
- Feature and component SCSS MUST NOT consume `--brand-*` or `--alias-*`
  directly.
- `--mapped-*` and explicit state primitives MAY be used only inside shared UI
  internals when no public semantic token expresses the primitive and the
  current shared-UI architecture already permits that usage.
- Theme-aware values MUST resolve through the project token layers rather than
  component-level theme overrides.
- Do not add raw design fallbacks such as `var(--app-text, #222)`.
- Do not create local Sass variables or CSS custom properties to conceal a
  missing design token.
- Reuse a token only when its semantic purpose matches the property and context;
  a visually similar value is insufficient.

## Technical values and hardcoded design values

The following design-bearing values require an existing approved token or an
approved token proposal: colors, gradients, shadows, spacing, gaps, margins,
padding, typography, borders, radii, design-bearing dimensions, breakpoints,
stacking levels, animation duration/easing, and icon/control sizes.

The technical whitelist is:

`0`, `100%`, `max-width: 100%`, `min-width: 0`, `min-height: 0`, `auto`,
`none`, `inherit`, `initial`, `unset`, `currentColor`, integer flex factors,
`1fr`, fluid percentages, local `z-index: 0` or `1` inside an isolated stacking
context, `inset: 0`, `pointer-events: none`, and `-50%` or `50%` geometric
centering values.

Any other one-off geometry MAY remain local only when all are true:

- It has no design meaning.
- It is not themeable.
- It is not repeated.
- Content growth, localization, zoom, and supported responsive ranges have been
  verified safe.

Otherwise use the missing-token flow below.

## Responsive layout

- Before editing, identify the actual repository API that owns media-query
  mechanics and the actual responsive-token source. Do not assume they are the
  same file.
- Media-query mechanics MUST use the approved project mixin, range, map, or
  function API.
- Responsive spacing, typography, and component-size values MUST use approved
  responsive tokens.
- Figma frame widths are design references, not automatic breakpoints.
- Do not hardcode one-off media-query numbers.
- Do not duplicate the same breakpoint independently in TypeScript and SCSS.
- New isolated UI MUST be mobile-first.
- Existing components MUST retain their current responsive direction unless the
  approved task explicitly changes it.
- Do not mix mobile-first and desktop-first directions within one component.
- Prefer Flexbox for one-dimensional alignment and Grid for two-dimensional
  layout.
- Use intrinsic sizing, wrapping, `min-width: 0`, `max-width: 100%`, `fr`,
  `minmax()`, and approved fluid token/functions to support content growth.

Adding or changing a breakpoint is governed by
[`core.md#high-risk-changes`](./core.md#high-risk-changes).

## Fixed dimensions and content resilience

A fixed dimension is allowed only when all are true:

- The element is semantically fixed, such as an icon, avatar, badge, or an
  explicitly bounded approved control.
- The value comes from an approved token.
- Content growth, localization, zoom, validation messages, and smaller
  viewports remain safe.
- No page-level horizontal overflow is introduced.

Use `min-height` rather than `height` for variable-label controls, cards, and
text containers unless a bounded viewport is the explicit approved behavior.
Controlled truncation MUST provide an accessible way to obtain the full value.

## Overflow

- Prevent accidental page-level horizontal scrolling.
- Wide tables and data surfaces MUST use an intentional responsive container
  pattern.
- `overflow: hidden` MUST NOT be used to conceal a broken layout.
- Local clipping is allowed only when clipping is the component's explicit
  visual behavior and content remains accessible.

## `!important` and `::ng-deep`

`!important` or `::ng-deep` MAY be used only after normal cascade, specificity,
component APIs, and supported extension points are verified insufficient.

The completion report MUST identify:

- The exact selector and declaration.
- Why normal mechanisms failed.
- The affected scope.
- Whether the workaround is temporary or permanent.
- The maintenance risk.

`::ng-deep` MUST be scoped under `:host` or `:host` plus a stable component root
and MUST target a stable child or third-party class. Wildcards, generic tag
targets, and broad state classes are forbidden.

## Missing token or breakpoint

When an approved design token or responsive API is missing, the agent MUST:

1. Search semantic tokens by purpose.
2. Search comparable components with the same UI role.
3. Trace candidate tokens through supported theme modes.
4. Report why existing tokens or APIs are unsuitable.
5. Propose the smallest semantic addition and affected consumers.
6. Stop under [`core.md#high-risk-changes`](./core.md#high-risk-changes).

Do not substitute a hardcoded value, fallback, local pseudo-token, or arbitrary
breakpoint while waiting for approval.
