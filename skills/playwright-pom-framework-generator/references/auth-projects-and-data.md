# Auth, Projects, and Data

## Credentials

Read from environment only:

```text
E2E_BASE_URL
E2E_<ROLE>_EMAIL
E2E_<ROLE>_PASSWORD
```

Never copy seed passwords into generated source, even if a repo seed uses `password`.

Ignore `playwright/.auth/` in git. Storage-state files impersonate users.

## Auth setup

`auth.setup.ts` logs in each configured role with source-proven login locators (labels/roles, not fabricated test ids) and writes:

```text
playwright/.auth/<role>.json
```

If a role env var is missing, skip that role’s setup with a diagnostic; do not fail the entire generator.

## Projects

Default lean matrix:

1. `setup` — auth
2. `chromium-public` — no storage state
3. `chromium-authenticated` — default employee or configured primary role
4. optional `mobile-chromium` only if inventory has material mobile states

Do **not** generate every role × browser up front. Specs select storage state:

```ts
test.use({ storageState: authFileFor('manager') })
```

Cross-role journeys use two browser contexts, not one page that logs in twice.

If the app rewrites URL role prefixes to the session role, tests must use matching accounts. Do not open `/admin/...` with an employee storage state and expect an admin page.

## Data

Generate `TestDataAdapter` as a boundary:

```ts
provisionWorkerAccount(role, workerIndex)
createScenarioData(profile)
cleanupScenarioData(handle)
```

Default implementation throws:

```text
Configure a disposable-environment TestDataAdapter before running mutating scenarios.
```

Mutating or dynamic-token scenarios **skip** until the adapter is implemented and the user confirms a disposable database/environment.

Never auto-run:

- destructive DB resets / full seeds
- random mock-data generators
- production credentials

Read-only smoke tests may reuse shared accounts. Mutating tests need worker-unique records or serial isolation.

## Third parties

Default skip/mock:

- Microsoft OAuth
- Google Meet / Calendar
- email delivery
- cloud storage uploads
- analytics

Document them as out-of-scope unless the user opts in.
