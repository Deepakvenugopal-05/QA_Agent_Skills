# Repository Analysis

Follow runtime truth. Do not stop at the page component.

## Follow chain

For each in-scope inventory page or mutating interaction:

1. Route file and `beforeLoad` / loader / search schema
2. Page or layout component
3. Child components that render the control
4. Event handler / mutation hook
5. Server function or action
6. Domain service
7. Zod or other input schema
8. Prisma model, enums, unique constraints, transactions
9. Authorization helper (`authorize*`, `require*`, grant maps)
10. Existing tests covering the same symbols
11. ADRs and finalized specs for vocabulary only after code is understood

Record the chain in the rule’s sources. If a hop is missing, status is `inferred` or `unknown`, not `implemented`.

## Where to look

Search, when present:

- `prisma/schema.prisma` and RBAC constants
- `src/modules/*/server`, `services`, `actions`
- `src/modules/*/types` and `*.schema.ts`
- `src/modules/auth`
- `src/routes` and generated route trees (read-only)
- `**/*.{test,spec}.*`
- `CONTEXT.md`, `docs/adr`, `.agents/spec`
- Inventory source-file columns, then verify those files exist

Ignore `node_modules`, build output, and generated files except as read-only manifests.

## State machines

Do **not** assume every enum pair is a legal transition.

Extract transitions from:

- functions named `assert*Transition`, `transition*`, `*Workflow*`
- `switch` / map tables of from→to
- service methods that change status and related aggregates
- tests using `it.each` allowed/invalid matrices

For each machine record:

- states
- legal transitions
- illegal transitions
- no-ops
- terminal protection
- synchronized aggregates (example: opening status → requisition status)
- concurrency / stale-version behavior if implemented

## Authorization partitions

For each protected resource.action:

- unauthenticated
- authenticated, missing grant
- grant present, insufficient scope
- grant present, target outside SELF/TEAM
- grant present, allowed
- URL/role-prefix manipulation if the router rewrites roles
- server action invoked directly, independent of hidden UI

TEAM means whatever the code says (often actor + direct reports, not recursive). Do not invent org-chart depth.

## Inventory reconciliation

While walking source, flag:

- inventory locators whose `data-testid` / accessible name is absent
- pages omitted from the inventory but present as `createFileRoute` / `page.tsx`
- “alias” routes that are independently implemented
- field sets, dialogs, and outcomes that differ from inventory text
- permissions described as roles

These become validation-report items. They do not block Gherkin generation.

## Tests as evidence

Reuse test intent, not test internals.

Good: “overlapping leave requests are rejected.”
Bad: “mockUseLeaveQuery is called with queryKey X.”

Integration tests that require a database are strong evidence for concurrency, rollback, and reservation rules.
