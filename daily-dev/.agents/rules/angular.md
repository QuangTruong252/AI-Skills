# Angular 22 Rules

## Applicability

Apply this file to Angular, TypeScript, routing, forms, services, components,
directives, pipes, and templates. This file owns Angular implementation policy;
it does not redefine approval, testing, validation, or completion policy. Inspect
`package.json`, `angular.json`, and TypeScript configuration before using an API;
objective installed versions remain authoritative.

## Version and local compatibility

- New code MUST use APIs supported by the installed Angular and TypeScript
  versions.
- The project targets Angular 22 conventions. The agent MUST verify actual
  installed versions instead of assuming the target is current.
- Existing compatible feature patterns SHOULD be preserved when they do not
  conflict with mandatory rules.
- The agent MUST NOT migrate unrelated legacy code merely because newer APIs
  are available.

## TypeScript

- Keep strict typing and existing compiler constraints intact.
- Use `unknown` rather than `any` for uncertain values, then narrow it.
- Prefer inference when the type is obvious; annotate public contracts and
  non-obvious values.
- Preserve input access modifiers, explicit overrides, complete returns, and
  exhaustive branching required by repository TypeScript configuration.
- Signals MUST use `set()` or `update()`; do not use mutation APIs that bypass
  signal change semantics.
- New internal and public state, variant, mode, and type string values MUST be
  lowercase; use kebab-case for multiple words.
- Preserve existing casing only when changing it would break an established
  public contract, external protocol, persisted data, generated API, or
  Figma-defined contract. Report this as a compatibility exception.

## Components, directives, pipes, and services

- New components, directives, and pipes MUST be standalone.
- Do not add explicit `standalone: true` when the installed Angular version
  defaults to standalone.
- New dependency injection code MUST use `inject()` unless a verified local
  framework pattern requires constructor injection for compatibility.
- New component contracts MUST use `input()`, `output()`, and `model()` as
  applicable.
- Do not add `@Input()`, `@Output()`, `@HostBinding()`, or `@HostListener()` to
  new code when supported function-based APIs or host metadata express the
  requirement.
- New features MUST NOT introduce NgModules unless an installed dependency or
  existing integration contract requires one.
- New feature routes SHOULD be lazy. A non-lazy route exception must document
  bundle, boot, or routing constraints.
- Do not add explicit `ChangeDetectionStrategy.OnPush` when the installed
  Angular version and project configuration already provide equivalent default
  behavior.
- Do not add `ViewEncapsulation.None`.
- When an Angular generator would create or modify a `.spec.ts` file, follow the
  canonical policy in `quality-gates.md` rather than generator defaults.

Any public contract or shared-artifact change is governed by
[`core.md#high-risk-changes`](./core.md#high-risk-changes) and
[`core.md#shared-component-changes`](./core.md#shared-component-changes).

## State and reactivity

- Local synchronous component state MUST use signals for new code.
- Derived synchronous state MUST use `computed()` rather than duplicated mutable
  state.
- Use observables for asynchronous streams and multi-event composition; use the
  `async` pipe in templates when a stream is consumed only by the template.
- Do not mirror the same state across a signal, observable subscription, and
  mutable field without a documented integration reason.
- Side effects MUST NOT be hidden inside `computed()`.

## Templates

- New templates MUST use native control flow: `@if`, `@for`, and `@switch`.
- Rendered collections MUST use stable tracking based on identity. Index
  tracking is allowed only for immutable, reorder-proof lists with no stable
  identifier.
- Template bindings and event payloads MUST remain typed.
- Do not call `new Date()` or other mutable global constructors directly in a
  template. Prepare values in TypeScript.
- Prefer `[class.name]` or `[class]` to `ngClass` for finite visual states.
- Do not use `ngStyle` for new code.
- Do not add component-decorator `styles: [...]` or literal `style="..."`
  attributes. Component-specific styling belongs in component SCSS.
- Actions MUST use buttons; navigation MUST use anchors or router links.

## Forms

- New forms MUST be typed.
- Use project-approved Signal Forms when the installed API is already used in
  the touched area; otherwise use typed Reactive Forms.
- Do not introduce template-driven forms in new code.
- Compatibility with an existing template-driven form is allowed only when the
  task directly edits that form and conversion would expand the approved scope.
- Validation state exposed to templates MUST remain typed and accessible.

## Lifecycle and resource cleanup

- Manual subscriptions, DOM listeners, timers, observers, and external
  resources MUST have deterministic cleanup.
- Prefer framework-provided lifecycle-aware cleanup such as `DestroyRef` and
  `takeUntilDestroyed()` when supported by the installed version.
- Do not add nested subscriptions when stream composition can express the same
  behavior.

## Accessibility

Touched UI MUST preserve or provide:

- Semantic HTML and logical DOM order.
- An accessible name for every control.
- Associated labels or equivalent labeling for inputs.
- `aria-label` for icon-only controls and `aria-hidden="true"` for decorative
  icons.
- Keyboard reachability and visible `:focus-visible` state.
- Valid state ARIA such as `aria-expanded` or `aria-invalid` when the state
  exists.
- Established focus, Escape, backdrop, and return-focus behavior for overlays.
- WCAG AA contrast through approved project tokens.

Use `NgOptimizedImage` for eligible static images. Inline base64 images and
unsupported dynamic-image cases are exceptions only when the installed API
cannot represent them.

## Runtime style bindings

Runtime style bindings MAY be used only for runtime data that cannot be
expressed through a finite class/state contract, including:

- Runtime CSS custom properties.
- Browser-measured geometry.
- Dynamic progress, position, or transform values.

They MUST NOT represent static design spacing, color, typography, radius,
shadow, fixed layout, or responsive design values that belong in SCSS and
approved tokens.

Allowed example:

```html
<div [style.--progress]="progress()"></div>
```

Forbidden example:

```html
<div [style.padding.px]="16"></div>
```

## Legacy-code boundary

Legacy migration is required only when at least one condition is true:

- The developer explicitly requests it.
- The legacy code is part of the direct edit target.
- The requested behavior cannot be implemented correctly without changing it.
- A mandatory rule is violated by code the task must modify, and preserving the
  violation would make the edited result internally inconsistent.
- A relevant validation failure is caused by the legacy implementation and can
  be fixed inside the approved task boundary.

Nearby unrelated legacy code remains out of scope. Report it only when it creates
a concrete correctness, security, accessibility, compatibility, or maintenance
risk for the requested change.
