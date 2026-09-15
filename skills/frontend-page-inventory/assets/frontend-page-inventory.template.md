# Frontend Page Inventory

## Summary

- **Repository:**
- **Analyzed root / scope:**
- **Generated at:**
- **Analysis modes:** static
- **Frameworks:**
- **Routing systems:**
- **Adapter(s):**
- **Total pages:** 0
- **Pages complete / partial / blocked:** 0 / 0 / 0
- **Shared surfaces:** 0
- **States:** 0
- **Interactions:** 0
- **Runtime status:** skipped — reason

## Coverage Summary

| Metric | Count | Notes |
| --- | --- | --- |
| Total pages | 0 | User-navigable rendered routes only |
| Pages complete | 0 | |
| Pages partial | 0 | |
| Pages blocked | 0 | |
| Shared surfaces | 0 | |
| States | 0 | Includes page and shared-surface states |
| Interactions | 0 | |
| Redirects | 0 | Excluded from total pages |
| Special surfaces | 0 | Excluded from total pages |
| Locator remediations | 0 | |
| Coverage gaps | 0 | |

## Page Index

| Page ID | Title | Route pattern | Example URL | Route kind | Source files | Top component | Auth | Authorization | Params / fixtures | Variants | Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | page | — | — | — | — | — | — | — |

## Shared Surfaces

### S001 — Example shell

- **Applies to:** all authenticated pages
- **Source files:**
- **Notes:**

#### States

| State ID | Name | Kind | How to reach | Preconditions | Notes |
| --- | --- | --- | --- | --- | --- |
| S001-ST001 | base | base | Render authenticated shell | Authenticated session | |

#### Interactions

| Interaction ID | State ID | Name | Control type | Action | Preferred Playwright locator | Alternate locator | Locator status | Stability | Preconditions | Input contract | Expected transition | Destructive | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — | — | — | — | — | — |

## Pages

### P001 — Example page

- **Route pattern:**
- **Example URL:**
- **Source files:**
- **Top component:**
- **Layout chain:**
- **Auth / authorization:**
- **Params / fixtures:**
- **Variants:**
- **Shared surface IDs:**
- **Coverage:**
- **Evidence:**

#### States

| State ID | Name | Kind | How to reach | Preconditions | Notes |
| --- | --- | --- | --- | --- | --- |
| P001-ST001 | base | base | Open example URL | — | |

#### Interactions

| Interaction ID | State ID | Name | Control type | Action | Preferred Playwright locator | Alternate locator | Locator status | Stability | Preconditions | Input contract | Expected transition | Destructive | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — | — | — | — | — | — |

## Redirects and Special Surfaces

### Redirects

| Redirect ID | From | To | Condition | Source |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

### Special Surfaces

| Surface ID | Kind | Route / trigger | Source | Notes |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

## Locator Remediation

| Remediation ID | Page / state | Control | Problem | Recommended contract | Source |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

## Coverage Gaps

| Gap ID | Area | What is missing | Why it matters | Suggested next evidence |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

## Automation Priorities

1. Authenticate and cover shared surfaces.
2. Automate complete pages with stable locators.
3. Add fixtures for dynamic routes.
4. Resolve locator remediations that block tests.
5. Cover destructive flows only in a disposable environment.
