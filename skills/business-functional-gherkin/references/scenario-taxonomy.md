# Scenario Taxonomy

Generate by **business capability**, not by UI control.

## Feature grouping

Default domains:

- `authentication`
- `attendance`
- `leave`
- `recruitment`
- `organization` (employees, departments, projects, roles)
- `operations` (assets, helpdesk, work-plan, planner)
- `journeys` (only multi-domain or multi-actor continuations)

One feature file per capability inside a domain (`leave-request.feature`, not `p015-my-leaves.feature`).

## Required scenario kinds

### For every in-scope page

| Kind | When |
|---|---|
| Authorized reachability | Protected page |
| Unauthenticated / forbidden | Protected page |
| Base business purpose | Always |
| Permission variant | Materially different UI/data by grant |
| Fixture requirement | Dynamic route |
| Smoke | Navigation/filter-only page |

### For every mutating interaction

| Kind | Required |
|---|---|
| Successful mutation | Yes |
| Minimum invalid input | Yes |
| Unauthorized invocation | Yes, if a server action exists |
| Invalid current state | Yes, if a state machine exists |
| Persisted outcome | Yes |
| Ledger/audit/history effect | When code writes one |
| Idempotency / concurrency | When tests or transactions show risk |
| Rollback / atomicity | When multiple records change |
| Notification / email / calendar | When required by accepted spec **and** implemented |
| Isolation note | Destructive cases |

### For every evidenced transition function

- every legal transition
- every explicitly illegal transition
- no-op same-state attempts
- terminal-state protection
- related aggregate sync

Use Scenario Outlines.

## Interaction classification

Every inventory interaction gets one:

| Class | Meaning |
|---|---|
| `scenario-covered` | Has a dedicated or outline example |
| `assertion-covered` | Checked inside another scenario |
| `navigation-only-covered` | Smoke / reachability only |
| `not-business-functional` | Pure layout/chrome with no business rule |
| `blocked-by-unknown-rule` | Mutation exists; rule not evidenced |
| `inventory-invalid` | Inventory claim contradicted by source |
| `duplicate` | Same control already classified |
| `out-of-scope` | User-limited domain run |

No interaction may vanish.

## Journeys

Create a journey feature only when the outcome spans pages or actors, for example:

- employee submits leave → manager decides → balance consumed or released
- requisition approved → opening published → candidate applies → interview → offer → account setup

Do not copy every domain scenario into `journeys/`.

## What not to generate

- One scenario per tab, date-prev, or sidebar link
- Click-then-see-button scenarios
- Locator uniqueness tests (that belongs to the POM skill)
- Planned-only behavior as current product tests (put in validation report, or tag `@planned` and exclude from implementation coverage counts)
