# UI Pattern Reference

> **Reference only:** This document records the current repository surface from
> the supplied snapshot. It does not define approval, implementation, or
> validation policy. Source code and objective repository configuration take
> precedence when this reference is stale. Report discrepancies instead of
> inventing missing APIs. Code examples and raw values below are source
> snapshots, not preferred implementation. Follow the canonical rules when a
> recorded pattern conflicts with current mandatory behavior.
>
> **Validity gate:** Before reuse, confirm the recorded source scope still exists
> in the current workspace and prefer live compositions over this snapshot. If
> paths are missing or conflict with live source, treat the entry as stale and
> continue from live evidence only (`AGENTS.md` Inventory validity and
> `../rules/core.md` Inventory validity).

**Recorded source scope:** `src/styles.scss`, shared UI, icon helpers, helper
showcases, public header layout, and public home feature. All entries were verified
against the live codebase (2026-07-22).

## Form field

Recorded composition:

- `app-input` for text-like controls.
- `app-label` with dropdown, checkbox, radio, or date picker when the primitive
  does not render its own label.
- Reactive Forms or project-approved Signal Forms.
- Validation surfaces recorded in the snapshot: `[error]`, `[invalid]`,
  `.ng-invalid.ng-touched`, `.invalid-input`, and `[aria-invalid='true']`.

```html
<form [formGroup]="userForm">
  <app-input
    label="Display name"
    formControlName="displayName"
    [required]="true"
    [error]="displayNameError()"
  />
</form>
```

## Search row

Recorded classes: `.search-row`, `.search`, and `.search-clear`.
The recorded search icon uses `iconHelper` with `icons icon-magnifer`.

**Legacy binding fact:** the supplied snapshot used `$any($event.target).value` in this composition. Do not copy that escape into new code; use a typed handler or typed control consistent with `../rules/angular.md`.

```html
<div class="search-row">
  <div class="search">
    <i
      iconHelper
      class="icons icon-magnifer search-icon"
      aria-hidden="true"
    ></i>
    <input
      type="search"
      [value]="searchQuery()"
      (input)="searchQuery.set($any($event.target).value)"
      placeholder="Search courses"
      aria-label="Search courses"
    />
    @if (searchQuery()) {
    <button
      type="button"
      class="search-clear"
      aria-label="Clear search"
      (click)="searchQuery.set('')"
    >
      <i iconHelper class="icons icon-times" aria-hidden="true"></i>
    </button>
    }
  </div>
  <button
    appButton
    variant="solid"
    tone="primary"
    type="button"
    (click)="createCourse()"
  >
    <i iconHelper class="icons icon-plus" aria-hidden="true"></i>
    <span>Add course</span>
  </button>
</div>
```

## Icons

- Recorded directive/source: `iconHelper` from
  `src/app/shared/icon-helper/icon-helper.directive.ts`.
- Recorded class format: `icons icon-<name>`.
- Recorded fixed-color swatches: `color-badge-red`, `color-badge-green`, and
  `color-badge-gray`.
- Recorded selected-state surfaces include `data-icon-state='selected'`,
  `.app-button--selected`, `.active`, `.is-open`, `.is-selected`,
  `.state-selected`, and `.icon-selected`.

```html
<button appIconButton type="button" aria-label="Edit">
  <i iconHelper class="icons icon-pen" aria-hidden="true"></i>
</button>
```

## Public header

- Component: `app-public-header` (`src/app/features/public/layout/public-header/public-header.component.ts`).
- Recorded links source:
  `src/app/features/public/home/data/homepage.content.ts`.
- Recorded mobile contract: the header emits `menuClick`; the page owns the
  mobile drawer.

```html
<app-public-header
  [links]="navLinks"
  activeId="home"
  [menuOpen]="mobileMenuOpen()"
  (menuClick)="mobileMenuOpen.set(true)"
/>
```

## Public mobile drawer

Recorded behavior:

- `role="dialog"` and `aria-modal="true"`.
- Closed state exposes `aria-hidden`.
- Active navigation exposes `aria-current="page"`.
- Backdrop interaction closes the drawer.
- The page owns the drawer.

**Legacy implementation facts:** the supplied snapshot records raw values
`min(340px, calc(100vw - 32px))`, `12px`, and `56px`. These are not recommended
as reusable design values. Verify whether semantic tokens now exist; otherwise
follow the missing-token process in `../rules/scss.md` and the approval gate in
[`core.md#high-risk-changes`](../rules/core.md#high-risk-changes).

## Dialog

- Component: `app-dialog`.
- Close output: `closeRequest`.
- Recorded close reasons: `close-button`, `backdrop`, and `escape`.

```html
<app-dialog
  title="Confirm action"
  [closeOnBackdrop]="true"
  (closeRequest)="closeDialog()"
>
  <p>Are you sure?</p>
  <button
    dialogFooter
    appButton
    variant="solid"
    tone="primary"
    type="button"
    (click)="confirm()"
  >
    Confirm
  </button>
</app-dialog>
```

## Toast

- Component: `app-toast`.
- Service: `ToastService` from `@core/services/toast.service`.

```ts
private readonly toastService = inject(ToastService);

showSaved(): void {
  this.toastService.showToast({
    tone: 'success',
    title: 'Saved',
    message: 'Changes saved.'
  });
}
```
