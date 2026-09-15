#!/usr/bin/env node
/**
 * Static evidence collector for frontend-page-inventory.
 * Not a semantic authority: the agent still classifies pages, states, and locators.
 *
 * Usage:
 *   node discover-frontend.mjs --root <repo> [--scope <subdir>] [--json]
 */
import fs from "node:fs";
import path from "node:path";

const SKIP_DIR_NAMES = new Set([
  ".git",
  ".hg",
  ".svn",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".turbo",
  ".vercel",
  ".vite",
  ".vite-temp",
  "coverage",
  "dist",
  "build",
  "out",
  "node_modules",
  "playwright-report",
  "test-results",
  ".scratch",
]);

const SOURCE_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const ROUTE_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);

const INTERACTION_PATTERNS = [
  { id: "jsx-button", re: /<Button\b|<IconButton\b|<button\b/g },
  { id: "jsx-link", re: /<Link\b|<NavLink\b|<a\b/g },
  { id: "jsx-form", re: /<form\b|<Form\b|onSubmit\s*=/g },
  { id: "jsx-input", re: /<TextField\b|<Input\b|<input\b|<textarea\b|<Select\b|<Autocomplete\b/g },
  { id: "jsx-toggle", re: /<Checkbox\b|<Switch\b|<Radio\b/g },
  { id: "jsx-overlay", re: /<Dialog\b|<Drawer\b|<Modal\b|<Menu\b|<Popover\b/g },
  { id: "jsx-tabs", re: /<Tabs\b|<Tab\b/g },
  { id: "jsx-table", re: /<Table\b|<DataGrid\b|useReactTable\(|AgGridReact/g },
  { id: "aria-label", re: /aria-label\s*=/g },
  { id: "test-id", re: /data-testid\s*=|data-test\s*=|getByTestId\(/g },
  { id: "navigate", re: /\bnavigate\(|redirect\(|href\s*=|to\s*=/g },
  { id: "dnd", re: /@dnd-kit|onDragEnd|DndContext/g },
];

function parseArgs(argv) {
  const args = { root: process.cwd(), scope: null, json: true };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--root") args.root = argv[++i];
    else if (token === "--scope") args.scope = argv[++i];
    else if (token === "--json") args.json = true;
    else if (token === "--help" || token === "-h") args.help = true;
    else if (!token.startsWith("-") && !args._positional) args.root = token;
  }
  return args;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function rel(root, filePath) {
  return toPosix(path.relative(root, filePath));
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function readJson(filePath) {
  const text = readText(filePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function walkFiles(dir, acc = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      if (entry.name.startsWith(".") && ![".github", ".agents", ".copilot"].includes(entry.name)) {
        continue;
      }
      walkFiles(full, acc);
    } else if (entry.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

function countMatches(text, regex) {
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
  return (text.match(re) || []).length;
}

function detectPackageManager(root) {
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(root, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(root, "bun.lockb")) || fs.existsSync(path.join(root, "bun.lock"))) return "bun";
  if (fs.existsSync(path.join(root, "package-lock.json"))) return "npm";
  return "unknown";
}

function collectPackageJsonFiles(root, files) {
  return files
    .filter((file) => path.basename(file) === "package.json")
    .map((file) => ({
      path: rel(root, file),
      json: readJson(file),
    }))
    .filter((item) => item.json);
}

function depNames(pkg) {
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  };
}

function detectFrameworks(packages) {
  const found = [];
  for (const pkg of packages) {
    const deps = depNames(pkg.json || {});
    const names = Object.keys(deps);
    const hits = [];
    if (names.includes("next")) hits.push({ id: "next", version: deps.next });
    if (names.includes("react")) hits.push({ id: "react", version: deps.react });
    if (names.includes("react-dom")) hits.push({ id: "react-dom", version: deps["react-dom"] });
    if (names.includes("react-router") || names.includes("react-router-dom")) {
      hits.push({
        id: "react-router",
        version: deps["react-router"] || deps["react-router-dom"],
      });
    }
    if (names.includes("@tanstack/react-router")) {
      hits.push({ id: "tanstack-router", version: deps["@tanstack/react-router"] });
    }
    if (names.includes("@tanstack/react-start")) {
      hits.push({ id: "tanstack-start", version: deps["@tanstack/react-start"] });
    }
    if (names.includes("@remix-run/react") || names.includes("@remix-run/node")) {
      hits.push({ id: "remix", version: deps["@remix-run/react"] || deps["@remix-run/node"] });
    }
    if (names.includes("nuxt") || names.includes("vue-router")) {
      hits.push({ id: "vue-family", version: deps.nuxt || deps["vue-router"] });
    }
    if (names.includes("@sveltejs/kit")) hits.push({ id: "sveltekit", version: deps["@sveltejs/kit"] });
    if (names.includes("astro")) hits.push({ id: "astro", version: deps.astro });
    if (hits.length) {
      found.push({ package: pkg.path, frameworks: hits });
    }
  }
  return found;
}

function classifyNextAppFile(posixPath) {
  const base = path.posix.basename(posixPath);
  if (!posixPath.includes("/app/") && !posixPath.startsWith("app/")) return null;
  if (/^page\.(js|jsx|ts|tsx)$/.test(base)) return "page";
  if (/^layout\.(js|jsx|ts|tsx)$/.test(base) || /^template\.(js|jsx|ts|tsx)$/.test(base)) return "layout";
  if (/^(loading|error|not-found|global-error)\.(js|jsx|ts|tsx)$/.test(base)) return "special-surface";
  if (/^route\.(js|ts)$/.test(base)) return "api-handler";
  if (/^default\.(js|jsx|ts|tsx)$/.test(base)) return "layout";
  return null;
}

function classifyNextPagesFile(posixPath) {
  const normalized = posixPath.replace(/^src\//, "");
  if (!normalized.startsWith("pages/")) return null;
  const base = path.posix.basename(normalized);
  if (normalized.startsWith("pages/api/")) return "api-handler";
  if (["_app", "_document"].some((name) => base.startsWith(name))) return "layout";
  if (["_error", "404", "500"].some((name) => base.startsWith(name))) return "special-surface";
  if (ROUTE_EXT.has(path.posix.extname(base))) return "page";
  return null;
}

function tanstackKindFromFile(posixPath, text) {
  const base = path.posix.basename(posixPath);
  const dir = path.posix.dirname(posixPath);
  if (base.startsWith("__root.")) return "layout";
  if (/^route\.(ts|tsx|js|jsx)$/.test(base)) return "layout";
  if (dir.includes("/api/") || /(^|\/)api\.(ts|js)$/.test(posixPath)) return "api-handler";
  if (path.posix.extname(base) === ".ts" && !base.endsWith(".tsx") && /createFileRoute|createAPIFileRoute|server/.test(text)) {
    if (/createAPIFileRoute|json\(|Request/.test(text) && !/<[A-Z]/.test(text)) return "api-handler";
  }
  if (/\bredirect\s*\(/.test(text) && !/function\s+\w*Page|return\s*\(/.test(text)) {
    const hasComponent = /component:\s*|function\s+[A-Z]|export\s+function\s+[A-Z]/.test(text);
    if (!hasComponent) return "redirect";
  }
  if (/\bredirect\s*\(/.test(text) && /beforeLoad/.test(text) && !/<(Fragment|[A-Z])/.test(text)) {
    return "redirect";
  }
  if (/createFileRoute|createLazyFileRoute|createRootRoute/.test(text)) {
    if (/createRootRoute/.test(text)) return "layout";
    return "page";
  }
  return "unresolved";
}

function nextUrlFromAppPage(posixPath) {
  const parts = posixPath.split("/");
  const appIndex = parts.lastIndexOf("app");
  if (appIndex < 0) return null;
  const segs = parts.slice(appIndex + 1, -1).filter((seg) => {
    if (seg.startsWith("@")) return false;
    if (seg.startsWith("_")) return false;
    if (/^\(.+\)$/.test(seg)) return false;
    return true;
  });
  return `/${segs.join("/")}`.replace(/\/$/, "") || "/";
}

function nextUrlFromPagesFile(posixPath) {
  const normalized = posixPath.replace(/^src\//, "");
  if (!normalized.startsWith("pages/")) return null;
  let rest = normalized.slice("pages/".length).replace(/\.(js|jsx|ts|tsx)$/, "");
  if (rest.startsWith("api/")) return null;
  rest = rest.replace(/\/index$/, "");
  if (rest === "index") return "/";
  return `/${rest}`;
}

function collectRouteEvidence(root, files) {
  const routes = [];
  const manifests = [];
  const routerDeclarations = [];

  for (const file of files) {
    const posix = rel(root, file);
    const ext = path.extname(file);
    const base = path.basename(file);
  continue;
    
    if (base === "routeTree.gen.ts" || base === "routeTree.gen.js") {
      manifests.push({ path: posix, kind: "tanstack-route-tree" });
    }
    if (base === "tsr.config.json") {
      manifests.push({ path: posix, kind: "tanstack-router-config" });
    }
    if (base === "routes.ts" || base === "routes.tsx" || posix.endsWith("/app/routes.ts")) {
      manifests.push({ path: posix, kind: "react-router-config-candidate" });
    }

    if (!SOURCE_EXT.has(ext)) continue;
    const text = readText(file);
    if (!text) continue;

    if (/createBrowserRouter|createHashRouter|createMemoryRouter/.test(text)) {
      routerDeclarations.push({ path: posix, kind: "react-router-data-router" });
    }
    if (/<Routes[\s>]|<Route\s+path=/.test(text)) {
      routerDeclarations.push({ path: posix, kind: "react-router-jsx" });
    }
    if (/\broute\s*\(|\bindex\s*\(|\blayout\s*\(|\bprefix\s*\(/.test(text) && /react-router/.test(text)) {
      routerDeclarations.push({ path: posix, kind: "react-router-framework-helpers" });
    }

    const appKind = classifyNextAppFile(posix);
    if (appKind) {
      routes.push({
        path: posix,
        adapter: "next-app",
        kindGuess: appKind,
        urlGuess: appKind === "page" ? nextUrlFromAppPage(posix) : null,
      });
      continue;
    }
    const pagesKind = classifyNextPagesFile(posix);
    if (pagesKind) {
      routes.push({
        path: posix,
        adapter: "next-pages",
        kindGuess: pagesKind,
        urlGuess: pagesKind === "page" ? nextUrlFromPagesFile(posix) : null,
      });
      continue;
    }

    if (/createFileRoute|createLazyFileRoute|createRootRoute|createRootRouteWithContext/.test(text)) {
      const fileRoute = text.match(/createFileRoute\(\s*(['"`])([^'"`]+)\1/);
      routes.push({
        path: posix,
        adapter: "tanstack-router",
        kindGuess: tanstackKindFromFile(posix, text),
        urlGuess: fileRoute?.[2] || null,
        symbols: unique([fileRoute?.[2]]),
      });
    }
  }

  return { routes, manifests, routerDeclarations };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectNavigationEvidence(root, files) {
  const hits = [];
  const navNameRe = /(sidebar|sidenav|navigation|nav-items|menuItems|mainNav)/i;
  for (const file of files) {
    const posix = rel(root, file);
    if (!SOURCE_EXT.has(path.extname(file))) continue;
    if (!navNameRe.test(posix) && !navNameRe.test(path.basename(file))) continue;
    const text = readText(file);
    if (!text) continue;
    hits.push({
      path: posix,
      linkLikeCount: countMatches(text, /to\s*=|href\s*=|path:\s*['"`]/g),
      grantLike: /hasAuthorizationGrant|permission|role/i.test(text),
    });
  }
  return hits;
}

function collectInteractionEvidence(root, files) {
  const perFile = [];
  const totals = Object.fromEntries(INTERACTION_PATTERNS.map((p) => [p.id, 0]));
  for (const file of files) {
    const ext = path.extname(file);
    if (![".jsx", ".tsx", ".js", ".ts"].includes(ext)) continue;
    const posix = rel(root, file);
    if (posix.includes("/node_modules/")) continue;
    const text = readText(file);
    if (!text) continue;
    const counts = {};
    let fileTotal = 0;
    for (const pattern of INTERACTION_PATTERNS) {
      const n = countMatches(text, pattern.re);
      if (n) {
        counts[pattern.id] = n;
        totals[pattern.id] += n;
        fileTotal += n;
      }
    }
    if (fileTotal > 0) {
      perFile.push({ path: posix, counts, total: fileTotal });
    }
  }
  perFile.sort((a, b) => b.total - a.total);
  return { totals, topFiles: perFile.slice(0, 80), fileCount: perFile.length };
}

function collectTestEvidence(root, files) {
  return files
    .filter((file) => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(file) || /playwright\.config\./.test(file))
    .map((file) => rel(root, file))
    .slice(0, 200);
}

function collectAuthEvidence(root, files) {
  const hits = [];
  for (const file of files) {
    const posix = rel(root, file);
    if (!SOURCE_EXT.has(path.extname(file))) continue;
    if (!/auth|rbac|permission|grant|guard/i.test(posix)) continue;
    const text = readText(file);
    if (!text) continue;
    if (/authorizeFrontendRoute|getRoutePermission|ProtectedRoute|beforeLoad/.test(text)) {
      hits.push(posix);
    }
  }
  return hits.slice(0, 50);
}

function summarizeRouteGuesses(routes) {
  const byAdapter = {};
  const byKind = {};
  for (const route of routes) {
    byAdapter[route.adapter] = (byAdapter[route.adapter] || 0) + 1;
    byKind[route.kindGuess] = (byKind[route.kindGuess] || 0) + 1;
  }
  return { byAdapter, byKind, total: routes.length };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    process.stdout.write(`Usage: node discover-frontend.mjs --root <repo> [--scope <subdir>]\n`);
    process.exit(0);
  }

  const root = path.resolve(args.root);
  if (!fs.existsSync(root)) {
    process.stderr.write(`Root does not exist: ${root}\n`);
    process.exit(1);
  }
  const scopeRoot = args.scope ? path.resolve(root, args.scope) : root;
  if (!fs.existsSync(scopeRoot)) {
    process.stderr.write(`Scope does not exist: ${scopeRoot}\n`);
    process.exit(1);
  }

  const files = walkFiles(scopeRoot);
  const packages = collectPackageJsonFiles(root, walkFiles(root).filter((file) => path.basename(file) === "package.json"));
  const frameworks = detectFrameworks(packages);
  const routeEvidence = collectRouteEvidence(root, files);
  const report = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    repositoryRoot: toPosix(root),
    scope: args.scope ? toPosix(args.scope) : ".",
    packageManager: detectPackageManager(root),
    packages: packages.map((pkg) => ({
      path: pkg.path,
      name: pkg.json.name || null,
      scripts: Object.keys(pkg.json.scripts || {}),
    })),
    frameworks,
    manifests: routeEvidence.manifests,
    routerDeclarations: unique(routeEvidence.routerDeclarations.map((d) => JSON.stringify(d))).map((s) =>
      JSON.parse(s),
    ),
    routeCandidates: routeEvidence.routes,
    routeSummary: summarizeRouteGuesses(routeEvidence.routes),
    navigationCandidates: collectNavigationEvidence(root, files),
    authorizationCandidates: collectAuthEvidence(root, files),
    interactions: collectInteractionEvidence(root, files),
    tests: collectTestEvidence(root, files),
    warnings: [],
  };

  if (!frameworks.length) {
    report.warnings.push("No first-class frontend framework detected in package.json dependencies.");
  }
  if (!routeEvidence.routes.length) {
    report.warnings.push("No route candidates found. Fall back to manual search of route configs and Link/href usage.");
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
