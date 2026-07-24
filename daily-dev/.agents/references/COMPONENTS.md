# Shared UI Component Reference

> **Reference only:** This document records the current repository surface verified
> against the codebase. Source code and objective repository configuration take
> precedence when this reference is stale. Report discrepancies instead of
> inventing missing APIs. Recorded examples, casing, raw values, and API shapes
> describe the current source only; they are not implementation policy. New or
> changed code must follow `../rules/core.md`, `../rules/angular.md`, and
> `../rules/scss.md`.
>
> **Validity gate:** Before reuse, confirm the recorded source path for the
> component exists in the current workspace and verify the live public API.
> If paths are missing or conflict with live source, treat the entry as stale
> and continue from live evidence only (`AGENTS.md` Inventory validity and
> `../rules/core.md` Inventory validity).

**Recorded source scope:** `src/app/shared/ui/**`, shared icon helpers, the toast
service, and the public header layout. All API entries below were verified against
the live codebase.

```yaml
contract:
  id: shared-ui-surface
  inventory_note: Verified shared UI surface recorded from the live repository (2026-07-22).
  components:
    - id: input
      category: form-control
      selector: app-input
      import: "import { InputComponent } from '@shared/ui/input';"
      source: src/app/shared/ui/input/input.component.ts
      models:
        - value
      inputs:
        - label
        - labelInfo
        - labelInfoPosition
        - labelInfoTooltipPlacement
        - placeholder
        - hint
        - error
        - autocomplete
        - name
        - inputId
        - ariaLabel
        - ariaDescribedBy
        - maxLength
        - minLength
        - min
        - max
        - step
        - rows
        - type
        - size
        - leadingIcon
        - trailingIcon
        - hintIcon
        - disabled
        - readonly
        - required
        - invalid
      outputs:
        - input
        - blur
        - focus
        - leadingIconClick
        - trailingIconClick
      example: |
        <app-input label="Email" type="email" [(value)]="email" leadingIcon="envelope" [error]="emailError()" />
    - id: input-color
      category: form-control
      selector: app-input-color
      import: "import { InputColorComponent } from '@shared/ui/input-color';"
      source: src/app/shared/ui/input-color/input-color.component.ts
      models:
        - value
      inputs:
        - label
        - hint
        - error
        - inputId
        - name
        - ariaLabel
        - disabled
        - readonly
        - required
        - invalid
        - placeholder
      example: |
        <app-input-color label="Theme Color" [(value)]="brandColor" />
    - id: checkbox
      category: form-control
      selector: app-checkbox
      import: "import { CheckboxComponent } from '@shared/ui/checkbox';"
      source: src/app/shared/ui/checkbox/checkbox.component.ts
      models:
        - checked
        - indeterminate
      inputs:
        - label
        - hint
        - size
        - disabled
        - readonly
        - required
      outputs:
        - change
        - focus
        - blur
      example: |
        <app-checkbox label="Accept terms" [(checked)]="agreeToTerms" />
    - id: radio
      category: form-control
      selector: app-radio
      import: "import { RadioComponent } from '@shared/ui/radio';"
      source: src/app/shared/ui/radio/radio.component.ts
      absent_selectors:
        - app-radio-group
      models:
        - checked
      inputs:
        - name
        - value
        - label
        - hint
        - disabled
        - readonly
        - required
      outputs:
        - change
        - focus
        - blur
      example: |
        <app-radio
          name="status"
          value="active"
          label="Active"
          [checked]="status() === 'active'"
          (checkedChange)="$event && status.set('active')" />
    - id: switch
      category: form-control
      selector: app-switch
      import: "import { SwitchComponent } from '@shared/ui/switch';"
      source: src/app/shared/ui/switch/switch.component.ts
      models:
        - checked
      inputs:
        - label
        - size
        - ariaLabel
        - disabled
        - activeColor
        - inactiveColor
      example: |
        <app-switch label="Enable notifications" [(checked)]="notificationsEnabled" />
    - id: date-picker
      category: form-control
      selector: app-date-picker
      import: "import { DatePickerComponent } from '@shared/ui/date-picker';"
      source: src/app/shared/ui/date-picker/date-picker.component.ts
      models:
        - value
        - timeValue
        - rangeValue
      inputs:
        - placeholder
        - placeholderEn
        - placeholderJa
        - minYear
        - maxYear
        - showClear
        - selectionMode
        - showTimePicker
        - use12Hour
        - range
        - textAlign
        - invalid
        - disabled
      example: |
        <app-date-picker [(value)]="selectedDate" placeholder="yyyy/MM/dd" />
    - id: dates-item
      category: form-control
      selector: app-dates-item
      import: "import { DatesItemComponent } from '@shared/ui/calendar-picker';"
      source: src/app/shared/ui/calendar-picker/dates-item/dates-item.component.ts
      inputs:
        - date
        - showStatus
        - statusCount
        - statusText
        - state
        - size
        - tone
        - selectable
        - full
      example: |
        <app-dates-item date="20" state="rangeStart" size="mobile" tone="weekday" [statusCount]="12" />
    - id: calendar-picker
      category: form-control
      selector: app-calendar-picker
      import: "import { CalendarPickerComponent } from '@shared/ui/calendar-picker';"
      source: src/app/shared/ui/calendar-picker/calendar-picker.component.ts
      models:
        - value
      inputs:
        - mode
        - month
        - dates
        - size
        - disabled
        - previousDisabled
        - nextDisabled
        - showLegend
      outputs:
        - previousMonth
        - nextMonth
        - dateSelect
      legend_icons:
        selected: color-badge-red
        available: color-badge-green
        disabled: color-badge-gray
      example: |
        <app-calendar-picker month="2026-07" mode="range" [dates]="vacancyDates" [(value)]="bookingDates" />
    - id: calendar-date-text
      category: form-control
      selector: app-calendar-date-text
      import: "import { CalendarDateTextComponent } from '@shared/ui/calendar-picker';"
      source: src/app/shared/ui/calendar-picker/dates-item/calendar-date-text.component.ts
      inputs:
        - label
        - state
        - type
      example: |
        <app-calendar-date-text label="20" state="default" type="weekday" />
    - id: dropdown
      category: form-control
      selector: app-dropdown
      import: "import { DropdownComponent } from '@shared/ui/dropdown';"
      source: src/app/shared/ui/dropdown/dropdown.component.ts
      models:
        - selected
      absent_models:
        - value
      inputs:
        - options
        - multiple
        - displayKey
        - compareKey
        - valueKey
        - placeholder
        - enableSearch
        - autoFocusSearch
        - disabled
        - error
        - translate
        - displayMode
        - selectionControl
        - avatarKey
        - colorKey
        - subLabelKey
        - maxBadges
        - displayWith
        - optionDisabledWith
        - optionTrackBy
        - emptyText
        - searchPlaceholder
        - panelMaxHeight
        - closeOnSelect
        - showDivider
        - showSubLabel
        - showIcon
        - optionIconKey
        - dropdownIcon
        - optionTemplate
        - triggerTemplate
      outputs:
        - opened
        - closed
        - searchChange
        - optionSelected
        - optionDeselected
      example: |
        <app-dropdown [options]="categories" displayKey="name" valueKey="id" [(selected)]="selectedCategory" />
    - id: label
      category: form-control
      selector: app-label
      import: "import { LabelComponent } from '@shared/ui/label';"
      source: src/app/shared/ui/label/label.component.ts
      inputs:
        - text
        - info
        - forId
        - icon
        - infoTooltipPlacement
        - required
        - disabled
        - showRequired
        - showInfo
        - infoPosition
      outputs:
        - infoClick
        - infoFocus
        - infoBlur
      example: |
        <app-label text="Course name" [required]="true" forId="course-name" />
    - id: icon-toggle-button
      category: form-control
      selector: app-icon-toggle-button
      import: "import { IconToggleButtonComponent } from '@shared/ui/icon-toggle-button';"
      source: src/app/shared/ui/icon-toggle-button/icon-toggle-button.component.ts
      inputs:
        - icon
        - active
        - ariaLabel
        - disabled
      outputs:
        - pressed
      allowed_icons:
        - day-night
        - language
      allowed_active:
        - primary
        - secondary
      example: |
        <app-icon-toggle-button icon="day-night" active="primary" ariaLabel="Toggle theme" (pressed)="toggleTheme()" />
    - id: link
      category: navigation
      selector: app-link
      import: "import { LinkComponent } from '@shared/ui/link';"
      source: src/app/shared/ui/link/link.component.ts
      inputs:
        - href
        - routerLink
        - label
        - type
        - target
        - rel
        - leftIcon
        - rightIcon
        - disabled
        - external
        - showLeftIcon
        - showRightIcon
      outputs:
        - linkClick
      example: |
        <app-link href="/docs" label="Docs" [showRightIcon]="true" rightIcon="external-link" />
    - id: menu-item
      category: navigation
      selector: app-menu-item
      import: "import { MenuItemComponent } from '@shared/ui/menu-item';"
      source: src/app/shared/ui/menu-item/menu-item.component.ts
      inputs:
        - collapsed
        - variant
        - label
        - size
        - selected
        - disabled
        - leftIcon
        - rightIcon
        - badge
        - tooltipText
      outputs:
        - itemClick
      example: |
        <app-menu-item label="Dashboard" leftIcon="home" [selected]="isDashboard()" (itemClick)="openDashboard()" />
    - id: tabs
      category: navigation
      selector: app-tabs
      import: "import { TabsComponent, type AppTabItem } from '@shared/ui/tabs';"
      source: src/app/shared/ui/tabs/tabs.component.ts
      inputs:
        - tabs
        - selectedKey
        - widthMode
        - iconLayout
        - responsiveMode
        - scrollable
        - compact
        - ariaLabel
        - accentColor
        - surfaceColor
      outputs:
        - tabSelect
        - tabAction
      example: |
        <app-tabs [tabs]="tabs" [selectedKey]="activeTab()" (tabSelect)="activeTab.set($event)" />
    - id: pagination
      category: navigation
      selector: app-pagination
      import: "import { PaginationComponent } from '@shared/ui/pagination';"
      source: src/app/shared/ui/pagination/pagination.component.ts
      inputs:
        - pageCount
        - currentPage
        - size
        - showPrevNext
        - showFirstLast
        - siblingCount
        - boundaryCount
        - disabled
        - ariaLabel
      outputs:
        - pageChange
      absent_inputs:
        - total
        - pageSize
      absent_models:
        - page
      example: |
        <app-pagination [pageCount]="pageCount()" [currentPage]="currentPage()" (pageChange)="currentPage.set($event)" />
    - id: pagination-cell
      category: navigation
      selector: app-pagination-cell
      import: "import { PaginationCellComponent } from '@shared/ui/pagination';"
      source: src/app/shared/ui/pagination/pagination-cell.component.ts
      inputs:
        - value
        - active
        - ellipsis
        - disabled
        - ariaLabel
      outputs:
        - activate
    - id: avatar
      category: data-display
      selector: app-avatar
      import: "import { AvatarComponent } from '@shared/ui/avatar';"
      source: src/app/shared/ui/avatar/avatar.component.ts
      inputs:
        - name
        - src
        - userId
        - size
        - showDetails
        - subText
        - nameFirst
        - labelPlacement
      example: |
        <app-avatar name="Mai Tran" [src]="avatarUrl" size="md" />
    - id: avatar-group
      category: data-display
      selector: app-avatar-group
      import: "import { AvatarGroupComponent } from '@shared/ui/avatar-group/avatar-group.component';"
      source: src/app/shared/ui/avatar-group/avatar-group.component.ts
      inputs:
        - users
        - avatarKey
        - nameKey
        - size
        - maxDisplay
      note: No @shared/ui/avatar-group barrel exists.
      example: |
        <app-avatar-group [users]="users" avatarKey="avatar" nameKey="fullName" [maxDisplay]="3" />
    - id: badge
      category: data-display
      selector: app-badge
      import: "import { BadgeComponent } from '@shared/ui/badge';"
      source: src/app/shared/ui/badge/badge.component.ts
      inputs:
        - label
        - size
        - type
        - variant
        - leftIcon
        - rightIcon
        - color
        - disabled
        - truncate
      current_api_limitation: The supplied inventory exposes a raw `color` input and does not confirm a semantic tone/token API. Verify source before using it.
      example: |
        <app-badge label="Active" size="sm" variant="filled" leftIcon="check" />
    - id: location-tag
      category: data-display
      selector: app-location-tag
      import: "import { LocationTagComponent } from '@shared/ui/location-tag';"
      source: src/app/shared/ui/location-tag/location-tag.component.ts
      inputs:
        - name
        - colorSetId
      example: |
        <app-location-tag name="Tokyo Main" [colorSetId]="1" />
    - id: tag
      category: data-display
      selector: app-tag
      import: "import { TagComponent } from '@shared/ui/tag/tag.component';"
      source: src/app/shared/ui/tag/tag.component.ts
      inputs:
        - label
        - size
        - variant
        - avatarSrc
        - avatarName
        - leftIcon
        - leftIconState
        - count
        - closeAriaLabel
        - showClose
      outputs:
        - close
      note: No @shared/ui/tag barrel index file exists; import directly from component file.
      example: |
        <app-tag label="Angular" variant="subtle" [showClose]="true" (close)="removeTag()" />
    - id: card-item
      category: data-display
      selector: app-card-item
      import: "import { CardItemComponent } from '@shared/ui/card-item';"
      source: src/app/shared/ui/card-item/card-item.component.ts
      inputs:
        - state
        - disabled
      outputs:
        - cardClick
      states:
        - default
        - selected
      example: |
        <app-card-item state="selected" (cardClick)="selectCard()">Card content</app-card-item>
    - id: step-item
      category: progress
      selector: app-step-item
      import: "import { StepItemComponent } from '@shared/ui/step-item';"
      source: src/app/shared/ui/step-item/step-item.component.ts
      inputs:
        - screen
        - state
        - labels
        - numbers
      screen_values:
        - mobile
        - desktop+tablet
        - responsive
      state_values:
        - Default
        - Active
        - Done
      compatibility_note: Uppercase values are recorded as a current/legacy API fact. New API casing policy lives in `../rules/angular.md`.
      tokens:
        - "--app-step-item-marker-size"
        - "--app-step-item-icon-size"
        - "--app-step-item-gap"
      example: |
        <app-step-item state="Active" labels="予約情報" [numbers]="2" />
    - id: step-divide
      category: progress
      selector: app-step-divide
      import: "import { StepDivideComponent } from '@shared/ui/step-divide';"
      source: src/app/shared/ui/step-divide/step-divide.component.ts
      inputs:
        - state
        - direction
      state_values:
        - default
        - active
      direction_values:
        - horizontal
        - vertical
      accessibility:
        aria_hidden: true
      example: |
        <app-step-divide state="active" direction="horizontal" />
    - id: table
      category: data-display
      selector: app-table
      import: "import { TableComponent } from '@shared/ui/table';"
      source: src/app/shared/ui/table/table.component.ts
      models:
        - currentPage
        - selectedRows
      inputs:
        - rows
        - columns
        - pageSize
        - serverPaging
        - totalItems
        - columnTemplate
        - filterOptions
        - editable
        - selectionMode
        - rowKey
      outputs:
        - actionClick
        - pageChange
        - sortChange
        - filtersChange
        - cellChange
        - actionMenuClick
        - rowClick
        - selectionChange
      example: |
        <app-table [rows]="rows()" [columns]="columns" [(currentPage)]="page" (rowClick)="openRow($event)" />
    - id: table-header-cell
      category: data-display
      selector: app-table-header-cell
      import: "import { TableHeaderCellComponent } from '@shared/ui/table';"
      source: src/app/shared/ui/table/table-header-cell.component.ts
      inputs:
        - label
        - align
        - color
        - divider
        - sortable
        - filterable
        - active
        - sortDirection
        - showLabel
        - showAction
      outputs:
        - action
        - sortAction
        - filterAction
    - id: table-cell
      category: data-display
      selector: app-table-cell
      import: "import { TableCellComponent } from '@shared/ui/table';"
      source: src/app/shared/ui/table/table-cell.component.ts
      inputs:
        - color
        - align
        - compact
    - id: dialog
      category: overlay
      selector: app-dialog
      import: "import { DialogComponent } from '@shared/ui/dialog';"
      source: src/app/shared/ui/dialog/dialog.component.ts
      inputs:
        - title
        - titleIcon
        - titleIconState
        - size
        - mobileMotion
        - subtitle
        - showClose
        - closeOnBackdrop
        - closeOnEscape
        - disableClose
        - busy
        - anchorRect
        - placement
      outputs:
        - closeRequest
      absent_outputs:
        - close
      example: |
        <app-dialog title="Confirm action" [closeOnBackdrop]="true" (closeRequest)="closeDialog()">
          <p>Are you sure?</p>
        </app-dialog>
    - id: tooltip
      category: overlay
      selector: "[appTooltip]"
      import: "import { AppTooltipDirective } from '@shared/ui/tooltip';"
      source: src/app/shared/ui/tooltip/tooltip.directive.ts
      inputs:
        - appTooltip
        - appTooltipDelay
        - appTooltipOnlyWhenOverflow
        - appTooltipPlacement
        - appTooltipFollowCursor
        - appTooltipShowOnFocus
        - appTooltipDisabled
        - appTooltipMaxWidth
        - appTooltipShowArrow
        - appTooltipSubtext
      example: |
        <button type="button" [appTooltip]="'More details'" appTooltipPlacement="right">Info</button>
    - id: button-directive
      category: action
      selector: "[appButton], [appIconButton]"
      import: "import { AppButtonDirective } from '@shared/ui/button';"
      source: src/app/shared/ui/button/button.directive.ts
      inputs:
        - variant
        - size
        - tone
        - loading
        - selected
      absent_inputs:
        - icon
      icon_rule: Project icon elements inside appIconButton with iconHelper.
      example: |
        <button appButton variant="solid" tone="primary" [loading]="isSubmitting()" type="submit">
          Save changes
        </button>
        <button appIconButton tone="danger" type="button" aria-label="Delete">
          <i iconHelper class="icons icon-trash" aria-hidden="true"></i>
        </button>
    - id: toast-component
      category: feedback
      selector: app-toast
      import: "import { ToastComponent } from '@shared/ui/toast';"
      source: src/app/shared/ui/toast/toast.component.ts
      service:
        id: toast-service
        import: "import { ToastService } from '@core/services/toast.service';"
        source: src/app/core/services/toast.service.ts
      example: |
        private readonly toastService = inject(ToastService);
        this.toastService.showToast({ tone: 'success', title: 'Saved', message: 'Changes saved.' });
  feature_components:
    - id: public-header
      category: public-site-navigation
      selector: app-public-header
      import: "import { PublicHeaderComponent } from '@features/public/layout/public-header/public-header.component';"
      source: src/app/features/public/layout/public-header/public-header.component.ts
      inputs:
        - links
        - activeId
        - logoHref
        - menuOpen
      outputs:
        - menuClick
      responsive_rule: desktop navigation hides at laptop-down and icon-menu opens the page-owned mobile drawer.
      example: |
        <app-public-header
          [links]="navLinks"
          activeId="home"
          [menuOpen]="mobileMenuOpen()"
          (menuClick)="mobileMenuOpen.set(true)" />
```
