# Framework Architecture

Default output is native `@playwright/test`. Gherkin remains the specification.

## Layout

```text
playwright.config.ts
e2e/
  README.md
  tsconfig.json
  environment/env.ts
  environment/roles.ts
  contracts/
    inventory.generated.ts
    locator-contracts.generated.ts
    scenario-traceability.generated.ts
    generation-gaps.generated.json
  auth/auth.setup.ts
  auth/auth-files.ts
  fixtures/test.ts
  pages/<domain>/<page>.page.ts
  components/<name>.component.ts
  data/test-data-adapter.ts
  data/profiles.ts
  specs/generated/smoke/
  specs/generated/scenarios/
  specs/curated/
  support/routes.ts
  support/annotations.ts
```

Regenerate only `contracts/*generated*` and `specs/generated/**`. Never overwrite `specs/curated/**`, hand-written page methods without a generated banner, or a configured data adapter implementation.

## Page objects

One class per **normalized Page ID**, not per route file.

```ts
export class LoginPage {
  static readonly pageId = 'P002'
  readonly route = '/login'
  constructor(readonly page: Page) {}
}
```

- `goto` uses route constants and fixture params for dynamic segments
- Parameterized methods for rows/cards: `row(name: string)`
- No `.first()` to hide ambiguity
- Readiness assertion allowed (`expectReady`)
- Scenario Then assertions stay in the spec

## Component objects

Create only for evidenced shared behavior:

- application shell
- dialog
- table
- date navigator
- rich-text editor
- opening workspace tabs

Compose them on page objects. Do not invent a god `BasePage`.

## Specs

Native tests with `test.step('Given ...')`, `test.step('When ...')`, `test.step('Then ...')`.

Tags: scenario ID, page IDs, domain, mutation.

Annotations: state IDs, interaction IDs, fixture profile, skip reason.

File naming: `BF-LEAVE-001.spec.ts` or grouped `leave-request.generated.spec.ts` with one `test()` per scenario ID.

## TypeScript boundary

Give `e2e/tsconfig.json` its own includes so E2E files do not leak into the app `tsc` graph unsafely. Do not import `*.server.ts` or Prisma from specs.

## Dependencies

If `@playwright/test` is missing, propose adding it as a **devDependency**. Do not remove an existing `playwright` runtime dependency used by the app (PDF rendering, scripts).
