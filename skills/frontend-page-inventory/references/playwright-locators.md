# Playwright Locator Strategy

Every interaction in the report must include a **copy-ready Playwright expression** a coding agent can paste into a test, or a remediation row explaining why none exists.

Official preference: user-facing locators, then explicit test IDs, then scoped CSS. See [Playwright locators](https://playwright.dev/docs/locators) and [best practices](https://playwright.dev/docs/best-practices).

## Ranked Policy

Use the first option that is evidenced and likely unique in its state:

1. `page.getByRole(role, { name })` for interactive elements
2. `page.getByLabel('...')` for form controls with an associated label
3. `page.getByPlaceholder('...')` only when no label exists
4. `page.getByAltText('...')` for images/area maps
5. `page.getByTitle('...')` when `title` is the actual contract
6. `page.getByText('...')` for non-interactive content or when the control's name is visible text and role is unknown
7. `page.getByTestId('...')` for `data-testid` / configured test-id attributes
8. Scoped CSS (`locator()`) as a documented fallback
9. XPath or positional `.nth()` only as `fragile` fallback, never preferred

## Expression Format

Write expressions as Playwright TypeScript against `page` or a named scope:

```ts
page.getByRole('button', { name: 'Apply Leave' })
```

Scoped example:

```ts
page.getByRole('dialog', { name: 'Apply Leave' }).getByRole('button', { name: 'Submit' })
```

Parameterized / fixture example:

```ts
page.getByRole('row', { name: '<employeeName>' }).getByRole('button', { name: 'Edit' })
```

Keep placeholders in angle brackets: `<employeeName>`, `<projectName>`, `<openingSlug>`.

Exact name matching is the default. Use `{ name: /save/i }` only when the visible name is evidenced to vary (ellipsis, count badges, i18n). Document why a regex is required.

## Required Locator Fields

| Field | Rule |
|---|---|
| Preferred locator | Copy-ready expression |
| Alternate locator | Next-best option or `—` |
| Scope | Landmark/dialog/row/page |
| Accessible role | From source or runtime; `unknown` if unproven |
| Accessible name | Literal, regex, or placeholder; never invented |
| Status | See statuses below |
| Stability | `high`, `medium`, `low`, `fragile` |
| Source | `static`, `runtime`, or `static+runtime` |

## Statuses

| Status | Meaning |
|---|---|
| `proposed` | Inferred from source only |
| `runtime-observed` | Seen in the DOM; uniqueness not proven |
| `runtime-validated` | Resolves uniquely in the intended state |
| `needs-contract` | No stable role/name/test id; do not guess |
| `unreachable` | State could not be opened (auth, fixture, blocker) |
| `unknown` | Insufficient evidence |

Source-inferred locators stay `proposed` until a runtime pass observes them.

## Stability Heuristics

`high` when all are true:

- Role + accessible name (or explicit test id)
- Name is literal or a documented fixture placeholder
- Not inside a virtualized/anonymous repeated list without scope

`medium` when label/placeholder is stable but role is generic, or the control is scoped inside a dialog.

`low` when the name is interpolated, translated, truncated, or duplicated on the page.

`fragile` when the expression uses CSS classes, DOM structure, XPath, `.nth()`, or generated MUI class names.

## Uniqueness

A locator is unique only if runtime shows exactly one visible match in that state, or the expression is already scoped to a unique parent (dialog, row, landmark).

If source shows multiple identical buttons (`Edit`, `Delete`, icon pencils), require a scope. If no scope identity exists, status is `needs-contract`.

## Framework Notes

- **MUI:** prefer the rendered ARIA role (`button`, `combobox`, `dialog`) over component names. `IconButton` without `aria-label` is `needs-contract`.
- **Portals:** dialogs/menus may render outside the React tree. Scope to `getByRole('dialog' | 'menu' | 'listbox')`, not the triggering component's DOM parent.
- **TanStack Table / AG Grid / virtualization:** locate by row name or test id after filtering/scrolling. Do not enumerate only currently mounted cells.
- **Next.js Link / TanStack Link:** usually `getByRole('link', { name })`.
- **File inputs:** often visually hidden. Prefer `getByLabel` or `getByTestId`; note if a custom dropzone is the real control.

## Anti-Patterns

Do not prefer:

- `page.locator('.MuiButton-root')`
- `page.locator('div > div > button')`
- `page.getByText('Edit').nth(3)`
- `page.locator('xpath=...')`
- Invented `data-testid="page-save-btn"` that does not exist in source
- Coordinate clicks

If existing scripts in the repo use those patterns, cite them as evidence of fragility, not as the recommended locator.

## Runtime Validation Checklist

For each sampled control:

1. Navigate to the concrete URL and state
2. Confirm visibility
3. Read computed role and accessible name
4. Count matches for the preferred locator
5. Set `runtime-observed` if visible; `runtime-validated` only if match count is 1 (or 1 within documented scope)
6. Leave destructive controls unexecuted; status remains `proposed` or `runtime-observed` from opening the confirmation UI only

## Completeness Check

Locator work is incomplete until every interaction has:

- a preferred expression **or** a Locator Remediation row
- a status from the table above
- no invented names
