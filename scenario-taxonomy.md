# Scenario Taxonomy & User Journey Architecture

Generate by **business capability**, not by isolated UI controls or raw backend RPC calls.

## Feature Grouping

Default domains:
- `auth` (authentication, session, roles, RBAC permissions, setup tokens)
- `attendance` (clock-in, live timer, timesheets, daily logs, bulk entry)
- `leave` (balances, applications, reservations, approvals, holidays, comp-off)
- `recruitment` (requisitions, openings, candidate pipeline, interviews, offers)
- `employees` (directory, profiles, deactivations, departments)
- `workplan` (planner tasks, privacy boundaries, weekly/monthly forecasts)
- `assets` (hardware catalog, custodian assignment, repair lifecycle)
- `helpdesk` (tickets, triage Kanban, execution status)
- `journeys` (multi-domain and multi-persona business continuations)

One feature file per major capability inside a domain (`leave.feature`, not `p015-my-leaves.feature`).

## User Flow Structure Required for Every Scenario

Every scenario must specify the complete behavioral progression:
1. **Starting Surface**: Always name the entry page or surface (`Given the user is on the "..." page`).
2. **Progressive Interaction**: Detail the flow (opening modal/drawer, selecting dropdown options, filling inputs, confirming).
3. **Form Inputs**: Use Gherkin Data Tables (`| Field | Value |`) for forms with multiple inputs.
4. **Observable Outcome**: Detail the visible UI outcome (modal closes, toast appears, table row renders with status badge).
5. **Domain Invariant**: Detail the persisted state transition (balance reserved, state machine progression).

## Required Scenario Kinds

### For Every In-Scope Page
| Kind | When | Flow Representation |
|---|---|---|
| Authorized reachability | Protected page | Direct navigation to page; verify expected primary view renders |
| Unauthenticated / forbidden | Protected page | Access attempt; verify redirect to login or 403 forbidden state |
| Base business purpose | Always | Core workflow executed on the page from start to finish |
| Permission variant | Materially different UI/data | Flow showing hidden or read-only controls based on grant/scope |
| Fixture requirement | Dynamic route | Parameterized route accessed with valid mock entity token |
| Smoke | Navigation/filter-only page | Filtering, tab switching, or search query updating displayed dataset |

### For Every Mutating Interaction
| Kind | Required Flow Pattern |
|---|---|
| Successful mutation | Open dialog/drawer -> Fill valid data table -> Confirm -> Modal closes & table reflects new row |
| Minimum invalid input | Open dialog/drawer -> Omit required field -> Confirm -> Modal remains open with validation alert |
| Unauthorized invocation | Restricted user attempts action -> Forbidden banner or disabled control observed |
| Invalid current state | Entity in terminal or wrong state -> Action trigger disabled or transition rejected |
| Persisted outcome | View updated record in table/detail drawer on subsequent inspection |
| Ledger/audit/history effect | Audit timeline entry or ledger transaction row displayed |
| Idempotency / concurrency | Duplicate submission prevention (submit button disabled upon trigger) |
| Rollback / atomicity | Multi-record failure causes form to remain open without partial data writes |
| Notification effect | Toast banner appears in header and drawer count increments |

### For Every Evidenced Transition Function
- Legal transitions: status badge transitions from State A to State B
- Illegal transitions: transition denied with business rule error
- Terminal-state protection: completed/rejected entities cannot be re-triggered

Use Scenario Outlines for transition matrices.

## Journeys (Cross-Domain & Multi-Persona)

Reserve `features/journeys/journeys.feature` for genuine multi-actor, multi-page continuations:
- **Hire-to-Onboard**: Candidate accepts offer in candidate portal -> Admin verifies in directory -> IT assigns asset.
- **Daily Work Session**: Clock in with project task -> Log work across tickets -> Clock out with duration split.
- **Payroll Cutoff**: Absent employee pending leave -> Automated cutoff cron -> Auto-reject & convert to LOP.

Do not duplicate isolated single-page tests in `journeys/`.
