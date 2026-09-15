# Traceability and Coverage

Inventory IDs are assigned in document order and may shift on regeneration. Store **both** the supplied ID and a semantic key.

## Semantic keys

```text
Page:        <route-pattern>
State:       <route-pattern>::<state-kind>::<state-name>
Interaction: <route-pattern>::<state-name>::<action>::<business-control-name>
```

Examples:

```text
/$role/leave/my
/$role/leave/my::dialog-open::apply-leave
/$role/leave/my::apply-leave::submit::leave-request
```

If the inventory omits a route that source proves exists, still create a semantic key and leave inventory IDs empty.

## Required scenario comment keys

| Key | Required | Example |
|---|---|---|
| Scenario-ID | Yes | `BF-LEAVE-001` |
| Inventory-Pages | Yes (or `—`) | `P015` |
| Inventory-States | Yes (or `—`) | `P015-ST001,P015-ST002` |
| Inventory-Interactions | Yes (or `—`) | `P015-ST002-I006` |
| Semantic-Keys | Yes | `/$role/leave/my::apply-leave::submit` |
| Business-Rules | Yes | `BR-LEAVE-RESERVATION-001` |
| Evidence | Yes | `implemented` |
| Sources | Yes | path#symbol lines |
| Actor-Grant-Scope | Yes | `employee \| leave.create \| SELF` |
| Fixture-Profile | Yes | `employee-with-available-balance` |
| Mutation | Yes | `yes` / `no` |
| Destructive | Yes | `yes` / `no` |

Comma-separate multiple IDs. Use `—` when none apply.

## Traceability matrix columns

```text
Scenario ID | Feature file | Title | Domain | Actor | Grant | Scope | Page IDs | State IDs | Interaction IDs | Semantic keys | Rule IDs | Evidence | Sources | Fixture | Mutation | Destructive | Priority | Classification notes
```

One row per scenario (or outline example group). Journeys may list many page IDs.

## Coverage measures

Do **not** copy inventory “complete” counts. Report:

| Measure | Definition |
|---|---|
| Page classification | Every in-scope page has at least reachability + purpose, or an exclusion reason |
| Mutating-interaction coverage | Covered, excluded, invalid, or blocked-unknown |
| Permission-boundary coverage | Allow + at least one deny for each protected capability |
| Legal transition coverage | Every evidenced allowed from→to |
| Illegal transition coverage | Every evidenced rejected from→to |
| Validation-rule coverage | Each Zod/service rejection with user-visible effect |
| Failure/rollback coverage | Multi-record mutations with transaction evidence |
| Cross-role journey coverage | Required only for multi-actor workflows |
| Inventory-invalid count | Inventory claims contradicted by source |
| Conflicted rule count | Tier disagreements |

## Interaction classification

See [scenario-taxonomy.md](./scenario-taxonomy.md). The validation report must list every inventory interaction ID with its class. Missing IDs are errors.

## Parent checks

- Interaction ID prefix must match its State ID
- State ID prefix must match its Page or Shared Surface ID
- Traced IDs must exist in the inventory **or** be listed as `inventory-missing` with a semantic key

## Completeness

Generation is incomplete while any of these remain silent:

- in-scope page with no classification
- mutating interaction with no class
- transition function with no matrix
- protected action with no deny scenario
- scenario missing required comment keys
- count mismatch among README, matrix, and validation report
