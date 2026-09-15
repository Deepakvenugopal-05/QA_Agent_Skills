# Interaction and State Taxonomy

A route is not the unit of automation. Inventory **pages**, then **variants**, then **states**, then **interactions**.

## Entity Split

| Entity | What it is | Counts as a page? |
|---|---|---|
| Page | User-navigable rendered route | Yes |
| Variant | Same page, materially different controls (role, grant, feature flag, viewport) | No |
| State | A reachable UI condition on that page/variant | No |
| Interaction | One user-operable control in a state | No |
| Shared surface | Shell/layout control reused across pages | No |

Dialogs, drawers, tabs, wizards, and popovers are **states** (or nested states), not pages.

## Required Page States

Always consider, and record only when evidenced:

- `base` — default successful render
- `loading`
- `empty`
- `error`
- `forbidden` / unauthorized
- `selected-row` / detail-open
- `dialog-open:<name>`
- `drawer-open:<name>`
- `menu-open:<name>`
- `popover-open:<name>`
- `tab:<name>` / `view:<name>`
- `query:<param>=<value>`
- `viewport:mobile` / `viewport:desktop` — only if controls differ

If a trigger is found but the destination state cannot be determined, create the interaction anyway and set expected transition to `unknown`.

## Control Types

Use these `controlType` values:

- `link`
- `button`
- `icon-button`
- `textbox`
- `textarea`
- `searchbox`
- `combobox`
- `listbox`
- `option`
- `checkbox`
- `radio`
- `switch`
- `slider`
- `spinbutton`
- `tab`
- `tabpanel`
- `menuitem`
- `treeitem`
- `row`
- `cell`
- `columnheader`
- `pagination-control`
- `file-upload`
- `date-picker`
- `time-picker`
- `rich-text-editor`
- `drag-source`
- `drop-target`
- `keyboard-shortcut`
- `custom`

Prefer the user's accessible role over the framework component name. A MUI `Button` that renders a link is a `link`.

## Actions

Use these `action` values:

- `click`
- `fill`
- `clear`
- `select`
- `check`
- `uncheck`
- `toggle`
- `upload`
- `drag`
- `press-key`
- `hover` — only if hover is required to reveal a tested control
- `navigate`

## What to Inspect in Source

Look for:

- `<a>`, `<Link>`, `href`, `to=`, `navigate(`
- `<button>`, `Button`, `IconButton`, `onClick`
- `<form>`, `onSubmit`, `type="submit"`
- `TextField`, `Input`, `Select`, `Autocomplete`, `Checkbox`, `Switch`, `Radio`
- `Dialog`, `Drawer`, `Modal`, `Menu`, `Popover`, `Tooltip`
- `Tabs`, `Tab`, view-mode toggles
- Table row clicks, overflow menus, bulk action bars
- `input[type=file]`, date/time pickers, Tiptap/editor surfaces
- `@dnd-kit` / drag handles
- `aria-label`, `aria-labelledby`, `title`, `placeholder`, `data-testid`, `data-test`
- Conditional rendering: permissions, `disabled`, feature flags, empty states

Follow imports from the route/page component. Do not inventory every component in the repo; inventory what the page can render.

## Shared Surfaces

Model once, reference many times:

- App bar / header
- Sidebar / nav
- Command palette
- Notification bell
- Help / settings menus
- Global search
- Auth user menu
- Footer

On each page, list `sharedSurfaceIds` instead of duplicating every shell control. Duplicate a shell control onto a page only when that page overrides or hides it.

## Repeated Rows and Virtualization

Do not emit one interaction per mocked row.

Record a **parameterized** interaction:

- Scope: `page.getByRole('row', { name: '<entityName>' })`
- Identity: fixture placeholder such as `<employeeName>`
- Note virtualization: control may exist only after scroll/filter

If rows have no stable identity (no name, checkbox label, or test id), mark `needs-contract`.

## Destructive and Unsafe Controls

Still document them from source. Set `destructive` to `yes` when the control:

- Deletes, archives, deactivates, rejects, or overwrites data
- Submits a mutating form
- Sends mail/messages
- Uploads/replaces files
- Confirms an irreversible action

Default runtime exploration must not execute these. Expected transition may still be inferred from source (confirmation dialog, toast, navigation).

## Availability

Record when a control is not always present:

- Role / grant / permission
- Data condition (empty vs populated)
- Feature flag
- Viewport
- Selected entity
- Disabled until form valid

If availability is unknown, say `unknown` rather than assuming always visible.

## Completeness Check

A page inventory is incomplete until:

- Base state exists
- Every evidenced dialog/tab/menu trigger has a state
- Shared-shell controls are not copy-pasted without provenance
- Repeated collections use parameterized locators
- Destructive controls are flagged
- Unknown outcomes are explicit
