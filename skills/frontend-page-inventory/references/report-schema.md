# Report Schema

The only required artifact is one Markdown file. Default path: `docs/automation/frontend-page-inventory.md`.

The file is both a human map of the frontend and a deterministic input for a Playwright-framework coding agent. Headings, table columns, and ID formats are part of the contract.

## File Rules

- Use the template in `assets/frontend-page-inventory.template.md`
- Keep the heading order and heading text
- Do not add extra top-level `##` sections
- Empty tables still include the header row and one `| — |` data row if there are no items
- Use ISO-8601 UTC timestamps
- Paths are repo-relative using POSIX separators
- IDs are stable across regenerations when the route/control is unchanged

## Counting Rule

`Total pages` = number of rows in **Page Index** whose `Route kind` is `page`.

Exclude from that number:

- layouts
- redirects
- API/handlers
- callbacks
- special surfaces
- modal-routes
- in-page states (tabs, dialogs, drawers)

Role aliases of the same source page count once. Material UI differences become variants on that page.

## ID Formats

| ID | Pattern | Example |
|---|---|---|
| Page | `P###` | `P012` |
| Shared surface | `S###` | `S001` |
| State | `{pageOrSurfaceId}-ST###` | `P012-ST003` |
| Interaction | `{stateId}-I###` | `P012-ST003-I002` |
| Redirect | `R###` | `R004` |
| Special surface | `X###` | `X002` |
| Remediation | `L###` | `L007` |
| Gap | `G###` | `G003` |

Number from `001` in document order. Do not reuse IDs for different entities in the same report.

## Required Sections

### 1. Summary

Key/value bullets:

- Repository
- Analyzed root / scope
- Generated at
- Analysis modes (`static`, `static+runtime`)
- Frameworks
- Routing systems
- Adapter(s)
- Total pages
- Pages complete / partial / blocked
- Shared surfaces
- States
- Interactions
- Runtime status (`skipped`, `partial`, `completed`) with reason if skipped

### 2. Coverage Summary

Table columns:

`Metric | Count | Notes`

Must include rows for total pages, complete, partial, blocked, shared surfaces, states, interactions, redirects, special surfaces, remediations, gaps.

Counts must match the later tables.

### 3. Page Index

Table columns:

`Page ID | Title | Route pattern | Example URL | Route kind | Source files | Top component | Auth | Authorization | Params / fixtures | Variants | Coverage`

`Route kind` in this table is always `page`.

`Coverage` is `complete`, `partial`, or `blocked`.

`Example URL` may contain placeholders (`/admin/opening/<openingSlug>/kanban`).

### 4. Shared Surfaces

For each surface:

- Heading `### S### — Title`
- Metadata bullets: applies to, source files, notes
- Interactions table with the same columns as page interactions, using `S###-ST###-I###`

### 5. Pages

For each page, heading `### P### — Title`.

Metadata bullets:

- Route pattern
- Example URL
- Source files
- Top component
- Layout chain
- Auth / authorization
- Params / fixtures
- Variants
- Shared surface IDs
- Coverage
- Evidence

Then **States** table:

`State ID | Name | Kind | How to reach | Preconditions | Notes`

Then **Interactions** table:

`Interaction ID | State ID | Name | Control type | Action | Preferred Playwright locator | Alternate locator | Locator status | Stability | Preconditions | Input contract | Expected transition | Destructive | Source`

Every counted page has at least a `base` state.

### 6. Redirects and Special Surfaces

Two tables, excluded from Total pages.

Redirects:

`Redirect ID | From | To | Condition | Source`

Special surfaces:

`Surface ID | Kind | Route / trigger | Source | Notes`

### 7. Locator Remediation

`Remediation ID | Page / state | Control | Problem | Recommended contract | Source`

Include every `needs-contract` interaction.

### 8. Coverage Gaps

`Gap ID | Area | What is missing | Why it matters | Suggested next evidence`

Include unresolved routes, missing fixtures, skipped runtime, unknown transitions, and adapter limitations.

### 9. Automation Priorities

Numbered list for the downstream Playwright agent. Prioritize:

1. Auth setup and shared surfaces
2. High-traffic complete pages with validated locators
3. Fixture-dependent dynamic routes
4. Remediation contracts that currently block tests
5. Destructive flows last, behind explicit disposable-env rules

No test code in this section.

## Cell Conventions

- Use `—` for not applicable
- Use `unknown` when the value should exist but could not be proven
- Boolean destructive: `yes` / `no`
- Locator status values: `proposed`, `runtime-observed`, `runtime-validated`, `needs-contract`, `unreachable`, `unknown`
- Do not wrap locator expressions in extra quotes inside table cells; use backticks: `` `page.getByRole('button', { name: 'Save' })` ``
- Keep a table cell to one locator expression; put explanation in Notes/Source

## Regeneration

Overwrite the default file in place unless the user asks for a timestamped snapshot. Say that previous IDs were reused when the same routes/controls remain.

## Validation Checklist

Before finishing:

- [ ] Heading order matches the template
- [ ] Total pages equals Page Index row count
- [ ] Coverage counts equal table row counts
- [ ] Every page has states and interactions tables
- [ ] Every `needs-contract` row appears in Locator Remediation
- [ ] No secrets in the file
- [ ] No claim of complete coverage while gaps exist
