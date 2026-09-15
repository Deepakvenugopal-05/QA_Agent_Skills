---
name: business-functional-gherkin
description: "Generate evidence-backed business-functional test scenarios and test cases in Gherkin from a frontend page inventory and application repository. Use when the user wants BDD scenarios, acceptance tests, business workflow coverage, Gherkin feature files, or traceability from page/state/interaction inventory IDs to functional tests."
argument-hint: "[inventory-path] [optional-scope]"
---

# Business Functional Gherkin

Convert a frontend page inventory **plus repository business evidence** into specification-only Gherkin.

The inventory is a **trace index**, not business truth. Locators, completeness claims, and UI copy in the inventory must be corroborated against implemented code. This skill does **not** create Cucumber runners, step definitions, Playwright configs, or page objects.

Downstream consumers: [playwright-pom-framework-generator](../playwright-pom-framework-generator/SKILL.md).

## When to Use

- Generate Gherkin / BDD / acceptance scenarios
- Turn a frontend page inventory into business test cases
- Cover workflows, state machines, and authorization boundaries
- Produce traceability from Page/State/Interaction IDs to scenarios

## Inputs

Resolve, in order:

1. Repository root (workspace root unless the user names another)
2. Inventory path: user path, else `docs/automation/frontend-page-inventory.md`, else `frontend-page-inventory.md`
3. Optional domain scope (attendance, leave, recruitment, …)
4. Output directory: user path, else `docs/testing/business-functional/`

If the inventory is missing, stop and tell the user to run `frontend-page-inventory` first.

## Output

```text
docs/testing/business-functional/
├── README.md
├── traceability-matrix.md
├── validation-report.md
└── features/
    ├── <domain>/
    │   └── *.feature
    └── journeys/
        └── *.feature
```

Use [assets/feature.template.feature](./assets/feature.template.feature), [assets/suite-index.template.md](./assets/suite-index.template.md), [assets/traceability-matrix.template.md](./assets/traceability-matrix.template.md), and [assets/validation-report.template.md](./assets/validation-report.template.md).

Organize by **business capability**, not one feature per page. Put only genuine cross-page/cross-role workflows in `journeys/`.

## Hard Rules

- Implemented schema, server behavior, and executable tests win conflicts.
- Accepted ADRs and finalized specs supplement implementation.
- Planned/historical docs and the inventory cannot override implementation.
- Keep conflicts explicit: `implemented`, `accepted`, `planned`, `conflicted`, `inferred`.
- Never put Playwright locators, CSS, or test IDs in Gherkin steps.
- Never treat inventory “complete” rows as verified business coverage.
- Never invent exact toast/button copy unless source or an accepted spec proves it.
- Prefer permission language (`leave.approve` + scope) over role-name-as-security.
- Do not generate Cucumber config or step definitions.

## Workflow

### 1. Establish inputs

Record repo root, inventory path, scope, and output dir. Read `AGENTS.md`, `CONTEXT.md`, ADRs, and package manifests when present.

**Done when:** every input is listed, and a missing inventory is reported before generation.

### 2. Parse the inventory as a trace index

Load [references/traceability-and-coverage.md](./references/traceability-and-coverage.md).

Parse pages, shared surfaces, states, interactions, redirects, special surfaces, remediations, and gaps. Tolerate schema drift, but record diagnostics (missing columns, invented test IDs, optimistic completeness).

Build semantic keys so later inventory ID renumbering can be remapped.

**Done when:** every inventory ID is listed or flagged invalid, and parent relationships (interaction → state → page/surface) are checked.

### 3. Catalog business evidence

Load [references/evidence-authority.md](./references/evidence-authority.md) and [references/repository-analysis.md](./references/repository-analysis.md).

For each in-scope page/domain, follow:

inventory item → route/component → hook/action → server service → Zod/schema → Prisma model/enums → authorization → tests/ADRs/specs

Record each rule with ID, statement, authority tier, evidence status, source path, symbol/heading, entities, and conflict notes.

**Done when:** every mutating inventory interaction maps to an evidenced transition, a rejection, or `unknown`.

### 4. Extract actors and state machines

From enums **and** transition functions (not enum pairs alone), record legal, illegal, no-op, and terminal-protected transitions.

Partition actors by grant and scope, not display role names, unless code truly keys off the role ID.

**Done when:** every discovered transition function has a matrix, and every protected capability has allow/deny partitions.

### 5. Generate scenarios

Load [references/scenario-taxonomy.md](./references/scenario-taxonomy.md) and [references/gherkin-style.md](./references/gherkin-style.md).

Generate by capability:

1. Core success
2. Validation rejection
3. Unauthenticated / missing grant / insufficient scope
4. Legal and illegal lifecycle transitions
5. Boundaries
6. Concurrency / idempotency where code shows risk
7. Rollback / atomicity where multiple records change
8. Audit / notification side effects when required
9. Cross-page / cross-role continuation
10. Smoke only for navigation/filter-only pages

Use Scenario Outlines for matrices. Write business outcomes, not clicks.

**Done when:** every in-scope page is classified, and every mutating interaction is covered or explicitly excluded.

### 6. Attach traceability and coverage

Every scenario needs:

- `BF-<DOMAIN>-###` ID
- inventory page/state/interaction IDs (zero or more)
- semantic keys
- business rule IDs
- actor / grant / scope
- sources
- evidence status
- fixture profile
- mutation/destructive flags

Classify every inventory interaction using the coverage reference.

**Done when:** README, traceability matrix, and validation report counts agree.

### 7. Validate

Run:

```bash
node "./scripts/validate-gherkin-suite.mjs" --root "<repo-root>" --suite "<output-dir>" --inventory "<inventory-path>"
```

Use [scripts/validate-gherkin-suite.mjs](./scripts/validate-gherkin-suite.mjs). If Node is unavailable, perform the same checks manually and say so.

Fix structural errors. Leave semantic conflicts in the validation report.

**Done when:** the validator reports no structural errors, and remaining issues are explicit gaps/conflicts.

## Completion Gate

Do not stop until:

1. Inventory parsed with diagnostics
2. Business rules evidenced with authority tiers
3. State machines and permission boundaries represented
4. Features use business language and required metadata
5. Every in-scope page and mutating interaction is classified
6. Counts match across README, matrix, and validation report
7. No locators or secrets appear in Gherkin
