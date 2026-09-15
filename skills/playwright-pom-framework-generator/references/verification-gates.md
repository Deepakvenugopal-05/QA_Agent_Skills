# Verification Gates

## Static

1. Inventory and Gherkin parsers succeed
2. `validate-traceability.mjs` — every scenario ID maps; unknown IDs error; mutating scenarios have mutation=yes; destructive scenarios have isolation/skip if no adapter
3. `validate-generated-framework.mjs` — forbidden locators, secrets, missing generated banners, curated overwrites, orphan page methods vs interactions
4. E2E `tsc` when Node/deps exist
5. `playwright test --list` when `@playwright/test` exists

If tools are missing, perform equivalent file scans and say which gates were skipped.

## Traceability

Every Gherkin Scenario-ID appears in `scenario-traceability.generated.ts` and in exactly one generated or skipped spec.

Every referenced interaction appears in `locator-contracts.generated.ts`.

Inventory interactions with no scenario remain listed in `generation-gaps.generated.json` (coverage hole, not a crash).

## Runtime promotion

Only after user-provided URL + accounts:

- visible
- accessible name/role observed
- match count == 1 in state (or 1 within documented scope)

Then status may become `runtime-validated`. Source-only locators stay `proposed`.

Mutating tests stay skipped until disposable adapter confirmation.

## Completeness claim

Do **not** say “framework is executable” while any of these remain:

- `@playwright/test` not installed
- auth env vars missing
- majority locators blocked/fabricated
- TestDataAdapter still throwing
- runtime uniqueness not sampled
