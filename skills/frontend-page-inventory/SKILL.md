---
name: frontend-page-inventory
description: "Inventory frontend pages, routes, UI states, and interactive elements in JavaScript or TypeScript web repositories. Use when the user wants a page inventory, route catalog, UI interaction report, Playwright locator specification, test-automation discovery document, or a foundational frontend repository map across React, Next.js, React Router, TanStack Router, and TanStack Start."
argument-hint: "[project-root-or-scope]"
---

# Frontend Page Inventory

Produce one **strict Markdown automation contract** that maps a JavaScript/TypeScript frontend into:

- user-navigable pages
- page variants and UI states
- interactive elements
- copy-ready Playwright locators

The report is a repository-understanding document **and** the input for a later coding agent that will build a Playwright automation framework. This skill does **not** create Playwright configs, page objects, fixtures, or tests.

## When to Use

- Inventory all frontend pages or routes
- Catalog interactive elements for testing
- Produce Playwright-compatible locators
- Map a React, Next.js, React Router, or TanStack Router/Start repository for automation
- Create a discovery document before building an E2E framework

## Output Contract

Write one Markdown file. Default path:

```text
docs/automation/frontend-page-inventory.md
```

Honor a user-supplied path first. If the analyzed repository already stores automation docs elsewhere, match that convention and say where the file was written.

Use [assets/frontend-page-inventory.template.md](./assets/frontend-page-inventory.template.md) and [references/report-schema.md](./references/report-schema.md). Do not invent extra top-level sections. Do not omit required tables.

## Hard Rules

- Headline **Total pages** counts only **user-navigable rendered routes**.
- Layouts, redirects, API/handlers, auth callbacks, loading/error/not-found surfaces, routed modals, dialogs, drawers, and tabs are inventoried separately and **do not** inflate the headline count.
- Deduplicate role/path aliases at the source-page level. Preserve materially different authorization or UI variants as variants, not extra pages.
- Never fabricate accessible names, test IDs, or uniqueness.
- Never label a source-inferred locator `runtime-validated`.
- Never claim complete coverage while unresolved routes, fixtures, credentials, or states remain.
- Do not store credentials, tokens, or secrets in the skill or the report.

## Workflow

### 1. Establish repository context

Read, when present:

1. Root `AGENTS.md`, `CLAUDE.md`, `copilot-instructions.md`, and nested instruction files
2. `CONTEXT.md` or equivalent domain map
3. Relevant ADRs and route/navigation docs
4. Package manifests, lockfiles, workspace config, and existing test/docs folders

Record project roots, package manager, app entrypoints, and domain terms with evidence.

**Done when:** every analyzed package/app root is listed with the files that prove it.

### 2. Detect frameworks and routers

Load [references/framework-routing.md](./references/framework-routing.md).

Prefer dependency and source evidence over folder names. First-class adapters:

- Next.js App Router
- Next.js Pages Router
- React Router (declarative, data-router, framework `routes.ts`)
- TanStack Router / TanStack Start

Other JS/TS frontends use the generic fallback and must be marked `unsupported-or-partial`.

Run the evidence collector when Node is available:

```bash
node "./scripts/discover-frontend.mjs" --root "<repo-root>" --scope "<optional-subdir>"
```

Use [scripts/discover-frontend.mjs](./scripts/discover-frontend.mjs). It is an evidence collector, not the semantic authority. If it cannot run, continue with manual search and record that fallback.

**Done when:** every detected router has a selected adapter, or is explicitly unresolved.

### 3. Build the route inventory

Collect candidates from, in order:

1. Generated manifests (`routeTree.gen.ts`, Next route types, React Router config)
2. Route files and explicit route declarations
3. Navigation/sidebar/breadcrumb definitions
4. Redirects, aliases, and authorization maps
5. Existing route documentation
6. Runtime links, only if browser validation is in scope

Classify every candidate using the routing reference. Do not treat every route file as a page.

**Done when:** every route candidate is classified as a page, layout, redirect, API/handler, callback, special surface, modal-route, or unresolved.

### 4. Resolve the rendered component graph

Follow each page route into its page component and visible children. Record shared shells once. Associate shell controls with applicable pages instead of copying them blindly onto every page.

**Done when:** every counted page has a top-level component or an explicit unresolved-import note.

### 5. Inventory states and interactions

Load [references/interaction-and-state-taxonomy.md](./references/interaction-and-state-taxonomy.md).

For each counted page, record:

- Base state
- Role/permission variants
- Query/tab/view-mode variants
- Empty, loading, error, forbidden, and selected-row states
- Dialogs, drawers, menus, and popovers opened from the page
- Responsive variants only when controls materially differ
- Dynamic-route fixture requirements

Then inventory interactive elements in each state. Shared-shell interactions are listed once under Shared Surfaces.

**Done when:** every discovered trigger has a resulting state/transition or is marked `unknown`.

### 6. Propose Playwright locators

Load [references/playwright-locators.md](./references/playwright-locators.md).

Every interaction row needs a copy-ready Playwright expression, locator status, stability, scope, and source evidence. Icon-only or repeated-row controls without a stable contract become `needs-contract`, not invented selectors.

**Done when:** every interaction has a preferred locator **or** a remediation row explaining why none exists.

### 7. Optional runtime validation

Static discovery always runs. Runtime validation is optional and **non-destructive by default**.

Ask for these only when runtime validation is requested and missing:

- Base URL
- Auth method and role sessions
- Dynamic-route fixtures
- Confirmation that the environment is disposable/safe

Allowed runtime actions:

- Navigate
- Authenticate with supplied sessions
- Change viewport
- Open tabs, menus, popovers, dialogs, and drawers that do not submit data

Forbidden by default:

- Form submit, save, delete, approve/reject, upload, purchase, send, or other mutations
- Following unsafe external actions
- Clicking destructive confirmations

Record observed role, accessible name, visibility, uniqueness, URL, and state. Update locator status only after those checks.

**Done when:** runtime was skipped with a reason, **or** every reachable sample has an observed/validated/unreachable status.

### 8. Reconcile and write the report

Cross-check:

- Framework manifests/config
- Route source files
- Generated route trees
- Navigation menus
- Authorization maps
- Tests
- Discovered links
- Runtime observations, if any

Then render the template. Fill Coverage Gaps instead of asserting completeness.

**Done when:** the Markdown validates against [references/report-schema.md](./references/report-schema.md), the headline page count obeys the counting rule, and every unresolved item appears in Coverage Gaps or Locator Remediation.

## Downstream Agent Boundary

The report must be sufficient for another coding agent to derive:

- Playwright project shape
- Auth and fixture needs
- Page/component abstractions
- Test scenarios from states and transitions

Next skills in this pipeline:

1. `business-functional-gherkin` — evidence-backed Gherkin from this inventory plus repository business rules
2. `playwright-pom-framework-generator` — fail-closed Playwright POM framework from the inventory plus that Gherkin suite

The report must **not** include generated test code, page-object classes, or a Playwright config unless the user separately asks for the framework.

## Completion Gate

Do not stop until:

1. Context, adapters, and route classifications are evidenced
2. Counted pages, shared surfaces, states, and interactions are tabulated
3. Locators are Playwright-compatible or explicitly remediated
4. Coverage numbers match the tables
5. Gaps and blockers are listed without optimistic wording
