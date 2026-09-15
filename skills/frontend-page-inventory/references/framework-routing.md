# Framework and Routing Adapters

Use dependency and source evidence, not folder names alone. Select one adapter per app/package. If multiple routers exist in a monorepo, inventory each app separately.

## Evidence Rank

1. Package dependencies and scripts
2. Generated route manifests
3. Explicit route declarations / config
4. Filesystem route conventions
5. Navigation definitions
6. Documentation (reconcile; never treat as sole authority)

## Classification

| Kind | Counts toward Total pages? | Notes |
|---|---|---|
| `page` | Yes | User-navigable rendered route |
| `layout` | No | Shell/pathless layout/`Outlet` wrapper |
| `redirect` | No | `redirect()`, `<Navigate>`, `beforeLoad` redirect, `next.config` redirect |
| `api-handler` | No | Next `route.ts`, `pages/api`, server endpoints |
| `callback` | No | OAuth/auth callback, webhook-like UI-less routes |
| `special-surface` | No | loading, error, not-found, 404, 500, `_error` |
| `modal-route` | No | Intercepted/parallel modal routes |
| `unresolved` | No | Candidate that could not be classified |

A file is not a page. Classify the **route**, then decide whether it renders a user-navigable page.

Dynamic segments (`[id]`, `$slug`, `:id`) are still one page pattern. Record fixture requirements; do not invent extra pages per entity.

Role prefixes such as `/$role/...` are one source page unless the UI is materially different by role. Record roles as variants.

## Next.js App Router

**Detect:** `next` dependency plus `app/` or `src/app/` with `page.*`.

**Page files:** `page.js`, `page.jsx`, `page.ts`, `page.tsx`.

**URL rules:**

- `(routeGroup)` is omitted from the URL
- `_private` folders are not routes
- `[param]`, `[...catchAll]`, `[[...optionalCatchAll]]` are dynamic
- `@slot` parallel routes are layout complexity, not extra pages
- `(.)`, `(..)`, `(...)` intercepted routes are `modal-route` unless they also have a standalone navigable URL

**Non-pages:**

- `layout.*`, `template.*` → `layout`
- `loading.*`, `error.*`, `not-found.*`, `global-error.*` → `special-surface`
- `route.*` → `api-handler`
- `default.*` for parallel slots → layout complexity

Record inherited layouts on each page's `layoutChain`.

## Next.js Pages Router

**Detect:** `next` plus `pages/` or `src/pages/`.

**URL rules:**

- `index` maps to the containing path
- `[id]`, `[...slug]`, `[[...slug]]` are dynamic
- `pages/api/**` → `api-handler`
- `_app`, `_document` → `layout`
- `_error`, `404`, `500` → `special-surface`

Custom `getLayout` still counts as layout chain, not extra pages.

## React Router

**Detect:** `react-router` / `react-router-dom` plus one of:

- `app/routes.ts` with `route()`, `index()`, `layout()`, `prefix()`
- `createBrowserRouter` / `createHashRouter` / `createMemoryRouter`
- Route object arrays (`path`, `element`/`Component`, `children`)
- JSX `<Routes>` / `<Route path>`

**Classify:**

- Path + element/lazy component → `page` if user-navigable
- Pathless layout / `element` wrapping `<Outlet>` → `layout`
- `index: true` / `index()` → page at parent path
- `redirect` / `<Navigate>` → `redirect`
- Splat `*` may be page or special-surface; inspect the component
- Nested routes under an already rendered parent may still be pages if they have their own URL

Component-local `<Routes>` can create page-like states. Record them; if they lack a unique URL, treat as in-page states rather than extra pages.

## TanStack Router / TanStack Start

**Detect:** `@tanstack/react-router` and/or `@tanstack/react-start`, `tsr.config.json`, `createFileRoute`, `createRootRoute`, `routeTree.gen.ts`.

**Preferred evidence:** generated `routeTree.gen.ts` (read-only). Then `createFileRoute()` files, then filesystem conventions.

**File conventions:**

- `__root` → layout/root
- `index` → page at parent path
- `route` → pathless layout unless it also renders a page
- `$param`, `$` splat → dynamic page pattern
- Route groups / pathless layouts → `layout`
- `beforeLoad` `redirect` → `redirect` if the route has no remaining rendered page
- `validateSearch` → search-parameter variants, not extra pages

Thin route files that only import a page component are still pages. Follow the import.

## Generic JS/TS Fallback

Use when no first-class adapter matches.

Search:

- `package.json` dependencies (`vue-router`, `@remix-run/*`, `gatsby`, `nuxt`, `@sveltejs/kit`, `astro`)
- Central route config files
- `href` / `to` / `navigate(` / `Link` usage
- Sidebar/nav config

Mark routing as `unsupported-or-partial`. Inventory only evidenced URLs/components. Put unknown routing in Coverage Gaps.

## Ignore While Walking Source

Skip unless the user scoped them in:

- `node_modules`, `.git`, `dist`, `build`, `.next`, `.output`, `.nuxt`, `.svelte-kit`, `coverage`, `playwright-report`
- Generated files except as read-only manifests (`routeTree.gen.ts`, Next types)
- Storybook/test fixtures unless they document real product routes

## Completeness Check

A routing pass is incomplete until:

- Every adapter has evidence
- Every candidate has a kind
- Generated manifests are reconciled with source files
- Navigation items that do not match a route are listed as unresolved or redirects
- Dynamic routes have named parameters and fixture notes
