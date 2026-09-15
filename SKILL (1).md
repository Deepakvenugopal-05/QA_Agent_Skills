---
name: playwright-pom-framework-generator
description: "Generate a Playwright TypeScript Page Object Model automation framework from a frontend page inventory and Gherkin scenarios or structured test cases. Use when creating Playwright configs, page/component objects, fixtures, role authentication projects, scenario specs, traceability manifests, locator validation plans, or an end-to-end automation scaffold from frontend-page-inventory.md."
argument-hint: "[inventory-path] [scenario-path-or-directory] [output-root]"
---

# Playwright POM Framework Generator

Consume a frontend page inventory **and** a business-functional Gherkin suite. Generate a fail-closed native Playwright Test POM scaffold.

Do **not** infer business scenarios from locator tables. Do **not** generate Cucumber runners. Translate Given/When/Then into `test.step()`.

Upstream: `frontend-page-inventory` and `business-functional-gherkin`.

## When to Use

- Build a Playwright POM framework from inventory + Gherkin
- Generate page/component objects, fixtures, auth projects, and specs
- Bind scenario IDs to Page/State/Interaction IDs and locators
- Scaffold E2E automation without treating unverified locators as executable

## Inputs

1. Repository root
2. Inventory: user path, else `docs/automation/frontend-page-inventory.md`, else `frontend-page-inventory.md`
3. Gherkin suite: user path, else `docs/testing/business-functional/`
4. Output root: user path, else `e2e/` plus repo-root `playwright.config.ts`

Stop if either contract is missing.

## Hard Rules

- Source-reconcile every locator before generating active tests.
- Invented/`proposed`/`needs-contract`/fragile locators produce skipped specs and diagnostics, not failing active tests.
- Never embed credentials, tokens, or seed passwords.
- Never run destructive seeds or mutating tests without an explicit disposable `TestDataAdapter`.
- Overwrite only generated contracts and `specs/generated/**`.
- Keep third-party OAuth/email/calendar/storage out of default execution.
- Do not import application server-only modules into E2E code.

## Workflow

### 0. Preflight

Read repo instructions, package manager, existing Playwright setup, and `tsconfig`. Produce a **non-writing** generation plan. Ask before adding `@playwright/test` or changing config.

Load [references/input-contract.md](./references/input-contract.md).

**Done when:** both contracts parse, or missing inputs are reported.

### 1. Normalize the generation model

Join: Scenario → Page → State → Interaction → Locator → actor/grant/scope → data profile.

Preserve inventory IDs and semantic keys. Stop on duplicate IDs or unresolved required references.

**Done when:** every scenario has role + fixture profile + mutation flag, or a diagnostic.

### 2. Reconcile locators

Load [references/locator-governance.md](./references/locator-governance.md).

Prefer source-proven roles/labels. Keep inventory expressions as candidates in the contract manifest. Mark executable vs blocked.

**Done when:** every referenced interaction is `executable`, `skipped`, or `blocked` with a reason.

### 3. Generate passive artifacts

Load [references/framework-architecture.md](./references/framework-architecture.md) and [references/generation-safety.md](./references/generation-safety.md).

Create directories, config template, environment schema, route constants, POM/component skeletons, locator contracts, traceability manifests, and the generation-gap report.

Use templates in [assets](./assets).

**Done when:** scaffold exists and curated folders are untouched.

### 4. Auth, fixtures, data boundary

Load [references/auth-projects-and-data.md](./references/auth-projects-and-data.md).

Generate per-role storage-state setup (credentials from env), lean Chromium projects, fixture types, and a `TestDataAdapter` that throws/skips until configured.

**Done when:** no secrets are in source, and mutating scenarios are blocked without an adapter.

### 5. Generate specs

Active specs only for executable locator + data contracts.

Skipped specs for unresolved locators, missing fixtures, or mutation-without-adapter.

Map Gherkin steps to `test.step()`. Keep assertions visible in specs, not buried in one POM method.

**Done when:** every scenario ID has an active or skipped spec with tags/annotations.

### 6. Static verification

Load [references/verification-gates.md](./references/verification-gates.md).

Run:

```bash
node "./scripts/parse-inventory.mjs" --inventory "<path>"
node "./scripts/parse-gherkin.mjs" --suite "<path>"
node "./scripts/validate-traceability.mjs" --inventory "<path>" --suite "<path>"
node "./scripts/validate-generated-framework.mjs" --root "<repo>" --e2e "<e2e-root>"
```

Scripts: [scripts/parse-inventory.mjs](./scripts/parse-inventory.mjs), [scripts/parse-gherkin.mjs](./scripts/parse-gherkin.mjs), [scripts/validate-traceability.mjs](./scripts/validate-traceability.mjs), [scripts/validate-generated-framework.mjs](./scripts/validate-generated-framework.mjs).

If Node is unavailable, perform the same checks manually.

**Done when:** forbidden locators, secrets, unknown IDs, and curated overwrites are absent.

### 7. Optional runtime

Only with user-supplied base URL, role accounts, and isolation policy:

- auth setup
- read-only locator uniqueness
- promote locators only when unique
- mutating tests only in a confirmed disposable environment

Never label source-inferred locators `runtime-validated`.

## Completion Gate

1. Both input contracts parsed with diagnostics
2. Generation plan reviewed for dependency/config changes
3. POM per Page ID; shared surfaces as components
4. Active tests only for safe contracts
5. Skipped/blocked tests for the rest, with reasons
6. Traceability manifest covers every scenario
7. Validators pass structurally
8. No claim of an executable suite while locators remain unvalidated or data adapter is unconfigured
