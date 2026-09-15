# Input Contract

Both inputs are required. Locator tables are not scenarios.

## Inventory

Discover, in order:

1. User-supplied path
2. `docs/automation/frontend-page-inventory.md`
3. `frontend-page-inventory.md`

Parse tolerantly. Real reports may drift from the inventory skill schema. Record diagnostics for missing columns, missing example URLs, or nonstandard coverage tables. Do not fail the whole run for drift if Page/State/Interaction IDs can still be recovered.

Required recovered entities:

- Page ID, title, route pattern, example URL if present, auth, coverage
- Shared surfaces
- States (ID, name, kind, how to reach)
- Interactions (ID, state, name, control type, action, preferred locator, alternate, status, stability, destructive)
- Remediations and gaps

Preserve IDs as written. Also compute semantic keys using the Gherkin skill’s convention:

```text
<route-pattern>::<state-name>::<action>::<business-control-name>
```

## Gherkin suite

Discover, in order:

1. User-supplied directory or `.feature` file
2. `docs/testing/business-functional/`

Require `features/**/*.feature`. README / traceability / validation docs are expected; warn if missing.

Each scenario must provide comment metadata from `business-functional-gherkin`:

- Scenario-ID
- Inventory-Pages / States / Interactions (or `—`)
- Semantic-Keys
- Actor-Grant-Scope
- Fixture-Profile
- Mutation / Destructive
- Evidence / Sources / Business-Rules

If metadata is missing, emit a diagnostic and skip generation for that scenario. Do not guess mappings from titles.

## Joined model

```text
Scenario
  id, title, tags, steps[], featureFile
  actor, grant, scope
  fixtureProfile
  mutation, destructive
  pages[], states[], interactions[]
  semanticKeys[]
  evidence
```

Each interaction joins to inventory locator fields and a reconciled locator contract.

Stop on:

- duplicate scenario IDs
- duplicate page IDs
- scenario referencing an ID that exists in neither inventory nor semantic-key fallback
- circular or impossible parent IDs

Unresolved optional IDs (`—`) are allowed.

## Parser scripts

Use [../scripts/parse-inventory.mjs](../scripts/parse-inventory.mjs) and [../scripts/parse-gherkin.mjs](../scripts/parse-gherkin.mjs) as the shared parse implementation so validators and generation stay aligned.
