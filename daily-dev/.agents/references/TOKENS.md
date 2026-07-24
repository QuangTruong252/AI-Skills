# Design Token Reference

> **Reference only:** This document records the current repository surface from
> the supplied snapshot. It does not define approval, implementation, or
> validation policy. Source code and objective repository configuration take
> precedence when this reference is stale. Report discrepancies instead of
> inventing missing APIs. Token names, values, and legacy spellings below are
> inventory facts, not permission to consume them contrary to `../rules/scss.md`.
>
> **Validity gate:** Before reuse, confirm at least one recorded source path
> below exists in the current workspace and prefer live token definitions over
> this snapshot. If paths are missing or conflict with live source, treat the
> entry as stale and continue from live evidence only. See `AGENTS.md` Inventory
> validity and `../rules/core.md` Inventory validity.

**Recorded source paths:**

- `src/assets/styles/tokens/_index.scss`
- `src/assets/styles/tokens/_brand.scss`
- `src/assets/styles/tokens/_color-palette.scss`
- `src/assets/styles/tokens/_color-palette-mapped.scss`
- `src/assets/styles/tokens/_location-set.scss`
- `src/assets/styles/tokens/_alias.scss`
- `src/assets/styles/tokens/_mapped-light.scss`
- `src/assets/styles/tokens/_mapped-dark.scss`
- `src/assets/styles/tokens/_state.scss`
- `src/assets/styles/tokens/_semantic.scss`
- `src/assets/styles/tokens/_typography.scss`
- `src/assets/styles/tokens/_responsive.scss`
- `src/assets/styles/tokens/_effects.scss`
- `src/assets/styles/_variables.scss`
- `src/assets/styles/_breakpoints.scss`

All source paths and design tokens below were verified against the live codebase (2026-07-22).

## Import entry

`src/assets/styles/tokens/_index.scss` was recorded as forwarding:

- `brand`
- `color-palette`
- `color-palette-mapped`
- `alias`
- `mapped-light`
- `mapped-dark`
- `state`
- `semantic`
- `typography`
- `responsive`
- `effects`

## Recorded layers

| Layer        | Source                              | Prefix/scope                               | Recorded role                                     |
| ------------ | ----------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Brand        | `_brand.scss`                       | `--brand-*`                                | Raw color primitives                              |
| Alias        | `_alias.scss`                       | `--alias-*`                                | Brand-to-purpose aliases                          |
| Mapped light | `_mapped-light.scss`                | `--mapped-*` in `:root`, light theme       | Light theme mappings                              |
| Mapped dark  | `_mapped-dark.scss`                 | `--mapped-*` in dark theme                 | Dark theme overrides                              |
| Location set | `_location-set.scss`                | `--app-location-*`; location data selector | Location palette registry                         |
| State        | `_state.scss`                       | `--state-*`                                | Default, disabled, error, success, warning states |
| Semantic     | `_semantic.scss`                    | `--app-*`                                  | Component-facing application decisions            |
| Typography   | `_typography.scss`                  | `--app-font-*`, `--app-text-*`             | Typography values                                 |
| Responsive   | `_responsive.scss`                  | `--app-layout-*`, `--app-text-*`           | Responsive design values                          |
| Effects      | `_effects.scss`                     | `--app-shadow-*`                           | Shadows and effects                               |
| Variables    | `src/assets/styles/_variables.scss` | `--app-*`                                  | Application dimensions and infrastructure values  |

## Recorded examples

### Semantic

- `--app-primary`
- `--app-bg`
- `--app-surface`
- `--app-border`
- `--app-field-bg`
- `--app-text`
- `--app-text-strong`
- `--app-text-muted`
- `--app-choice-bg`
- `--app-danger`

### Responsive

- `--app-layout-gap-padding`
- `--app-text-display-size`
- `--app-text-headline-line-height`
- `--app-step-item-marker-size`
- `--app-step-item-icon-size`
- `--app-step-item-gap`

### Effects and infrastructure

- `--app-shadow-*`
- `--app-sidebar-collapsed-width`
- `--app-sidebar-expanded-width`
- `--app-scrollbar-width`

## Legacy compatibility fact

The supplied inventory records the misspelled aliases
`--alias-primay-*`, including `--alias-primay-default`,
`--alias-primay-focus`, and `--alias-primay-focus2`.

New consumers should not treat this spelling as a preferred naming convention.
Renaming or replacing these values is a token migration governed by
[`core.md#high-risk-changes`](../rules/core.md#high-risk-changes).

## Recorded theme mechanisms

- Light mappings: `:root` and `[data-theme='light']`.
- Dark mappings: `[data-theme='dark']`.
- Location colors: `[data-location-color-set='1'..'9']`.

Implementation and token-consumption policy lives in `../rules/scss.md`.
This reference does not define a Figma workflow. Use only a workflow skill
explicitly activated by `../../AGENTS.md`.
