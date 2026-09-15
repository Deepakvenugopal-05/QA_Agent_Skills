#!/usr/bin/env node
/**
 * Structural validator for business-functional-gherkin output.
 * Does not claim Cucumber executability.
 *
 * Usage:
 *   node validate-gherkin-suite.mjs --root <repo> --suite <suite-dir> [--inventory <inventory.md>]
 */
import fs from "node:fs";
import path from "node:path";

const REQUIRED_KEYS = [
  "Scenario-ID",
  "Inventory-Pages",
  "Inventory-States",
  "Inventory-Interactions",
  "Semantic-Keys",
  "Business-Rules",
  "Evidence",
  "Sources",
  "Actor-Grant-Scope",
  "Fixture-Profile",
  "Mutation",
  "Destructive",
];

const EVIDENCE = new Set(["implemented", "accepted", "planned", "conflicted", "inferred"]);
const WEAK_STEP_RE =
  /\b(click|type into|getByTestId|getByRole|locator\(|css=|xpath=|should work|is successful)\b/i;
const LOCATOR_RE = /getBy(TestId|Role|Label|Placeholder|Text)|data-testid|page\.locator/i;
const ID_RE = /^BF-[A-Z][A-Z0-9]+-\d{3}$/;

function parseArgs(argv) {
  const args = { root: process.cwd(), suite: null, inventory: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--root") args.root = argv[++i];
    else if (token === "--suite") args.suite = argv[++i];
    else if (token === "--inventory") args.inventory = argv[++i];
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir, acc = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function splitCsv(value) {
  if (!value || value.trim() === "—" || value.trim() === "-") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseInventoryIds(text) {
  const ids = {
    pages: new Set(),
    states: new Set(),
    interactions: new Set(),
    surfaces: new Set(),
  };
  if (!text) return ids;
  for (const match of text.matchAll(/\b(P|S|X)\d{3}\b/g)) {
    const id = match[0];
    if (id.startsWith("P")) ids.pages.add(id);
    else ids.surfaces.add(id);
  }
  for (const match of text.matchAll(/\b(?:P|S)\d{3}-ST\d{3}\b/g)) ids.states.add(match[0]);
  for (const match of text.matchAll(/\b(?:P|S)\d{3}-ST\d{3}-I\d{3}\b/g)) ids.interactions.add(match[0]);
  return ids;
}

function parseMetadata(commentBlock) {
  const meta = {};
  const sources = [];
  for (const rawLine of commentBlock.split("\n")) {
    const line = rawLine.replace(/^\s*#\s?/, "").trim();
    if (!line) continue;
    if (line.startsWith("- ")) {
      sources.push(line.slice(2).trim());
      continue;
    }
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key === "Sources" && !value) continue;
    meta[key] = value;
  }
  if (sources.length) meta.Sources = sources.join("; ");
  return meta;
}

function parseFeature(filePath, text) {
  const lines = text.split(/\r?\n/);
  const feature = {
    path: filePath,
    tags: [],
    title: null,
    scenarios: [],
  };
  let pendingTags = [];
  let commentBuf = [];
  let current = null;
  let inExamples = false;
  let exampleHeaders = [];

  const flush = () => {
    if (current) feature.scenarios.push(current);
    current = null;
    inExamples = false;
    exampleHeaders = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("@") && !current) {
      pendingTags = trimmed.split(/\s+/).filter(Boolean);
      continue;
    }
    if (trimmed.startsWith("Feature:")) {
      feature.title = trimmed.slice("Feature:".length).trim();
      feature.tags = pendingTags;
      pendingTags = [];
      continue;
    }
    if (trimmed.startsWith("#")) {
      commentBuf.push(trimmed);
      continue;
    }
    if (/^(Scenario Outline|Scenario):/.test(trimmed)) {
      flush();
      const isOutline = trimmed.startsWith("Scenario Outline:");
      current = {
        title: trimmed.replace(/^Scenario Outline:|^Scenario:/, "").trim(),
        tags: pendingTags,
        meta: parseMetadata(commentBuf.join("\n")),
        comments: commentBuf.slice(),
        steps: [],
        isOutline,
        examplesHeaders: [],
        placeholders: new Set(),
        hasGiven: false,
        hasWhen: false,
        hasThen: false,
      };
      pendingTags = [];
      commentBuf = [];
      continue;
    }
    if (current && /^Examples:/.test(trimmed)) {
      inExamples = true;
      continue;
    }
    if (current && inExamples && trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c, i, arr) => !(i === 0 || i === arr.length - 1) || c)
        .filter((_, i, arr) => i > 0 && i < arr.length - 1 || true);
      const parts = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      if (!exampleHeaders.length) {
        exampleHeaders = parts;
        current.examplesHeaders = parts;
      }
      continue;
    }
    if (current && /^(Given|When|Then|And|But)\b/.test(trimmed)) {
      inExamples = false;
      current.steps.push(trimmed);
      if (trimmed.startsWith("Given")) current.hasGiven = true;
      if (trimmed.startsWith("When")) current.hasWhen = true;
      if (trimmed.startsWith("Then")) current.hasThen = true;
      if (trimmed.startsWith("And") || trimmed.startsWith("But")) {
        if (!current.hasGiven && !current.hasWhen && !current.hasThen) current.hasGiven = true;
      }
      for (const ph of trimmed.matchAll(/<([A-Za-z0-9_]+)>/g)) current.placeholders.add(ph[1]);
    }
  }
  flush();
  return feature;
}

function parentState(interactionId) {
  const match = interactionId.match(/^(.*)-I\d{3}$/);
  return match ? match[1] : null;
}

function parentPage(stateId) {
  const match = stateId.match(/^((?:P|S)\d{3})-ST\d{3}$/);
  return match ? match[1] : null;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.suite) {
    process.stdout.write(
      "Usage: node validate-gherkin-suite.mjs --root <repo> --suite <suite-dir> [--inventory <file>]\n",
    );
    process.exit(args.help ? 0 : 1);
  }

  const root = path.resolve(args.root);
  const suite = path.resolve(root, args.suite);
  const errors = [];
  const warnings = [];
  const scenarioIds = new Map();
  const ruleIds = new Set();

  if (!fs.existsSync(suite)) {
    process.stderr.write(`Suite directory does not exist: ${suite}\n`);
    process.exit(1);
  }

  let inventoryIds = null;
  if (args.inventory) {
    const invPath = path.resolve(root, args.inventory);
    if (!fs.existsSync(invPath)) {
      errors.push(`Inventory not found: ${toPosix(path.relative(root, invPath))}`);
    } else {
      inventoryIds = parseInventoryIds(fs.readFileSync(invPath, "utf8"));
    }
  }

  const featureFiles = walk(suite).filter((file) => file.endsWith(".feature"));
  if (!featureFiles.length) errors.push("No .feature files found in suite.");

  const requiredDocs = ["README.md", "traceability-matrix.md", "validation-report.md"];
  for (const doc of requiredDocs) {
    if (!fs.existsSync(path.join(suite, doc))) {
      warnings.push(`Missing suite document: ${doc}`);
    }
  }

  for (const file of featureFiles) {
    const rel = toPosix(path.relative(root, file));
    const text = fs.readFileSync(file, "utf8");
    const feature = parseFeature(rel, text);
    if (!feature.tags.some((tag) => tag.startsWith("@domain_"))) {
      errors.push(`${rel}: Feature is missing @domain_ tag`);
    }
    const titles = new Map();
    for (const scenario of feature.scenarios) {
      const id = scenario.meta["Scenario-ID"];
      if (!id) errors.push(`${rel} :: "${scenario.title}": missing Scenario-ID`);
      else if (!ID_RE.test(id)) errors.push(`${rel}: invalid Scenario-ID ${id}`);
      else if (scenarioIds.has(id)) errors.push(`${rel}: duplicate Scenario-ID ${id} (also ${scenarioIds.get(id)})`);
      else scenarioIds.set(id, rel);

      if (titles.has(scenario.title)) errors.push(`${rel}: duplicate scenario title "${scenario.title}"`);
      else titles.set(scenario.title, true);

      for (const key of REQUIRED_KEYS) {
        if (!scenario.meta[key]) errors.push(`${rel} :: ${id || scenario.title}: missing ${key}`);
      }
      const evidence = (scenario.meta.Evidence || "").toLowerCase();
      if (evidence && !EVIDENCE.has(evidence)) {
        errors.push(`${rel} :: ${id}: invalid Evidence ${scenario.meta.Evidence}`);
      }
      for (const rule of splitCsv(scenario.meta["Business-Rules"])) ruleIds.add(rule);

      if (!scenario.hasGiven || !scenario.hasWhen || !scenario.hasThen) {
        errors.push(`${rel} :: ${id || scenario.title}: scenario must include Given, When, and Then`);
      }
      for (const step of scenario.steps) {
        if (WEAK_STEP_RE.test(step) || LOCATOR_RE.test(step)) {
          errors.push(`${rel} :: ${id}: weak or locator step: ${step}`);
        }
      }
      if (scenario.isOutline) {
        for (const ph of scenario.placeholders) {
          if (!scenario.examplesHeaders.includes(ph)) {
            errors.push(`${rel} :: ${id}: placeholder <${ph}> missing from Examples`);
          }
        }
      } else if (scenario.placeholders.size) {
        errors.push(`${rel} :: ${id}: unresolved <placeholder> outside Scenario Outline`);
      }

      const pages = splitCsv(scenario.meta["Inventory-Pages"]);
      const states = splitCsv(scenario.meta["Inventory-States"]);
      const interactions = splitCsv(scenario.meta["Inventory-Interactions"]);
      for (const state of states) {
        const parent = parentPage(state);
        if (parent && pages.length && !pages.includes(parent) && !parent.startsWith("S")) {
          warnings.push(`${rel} :: ${id}: state ${state} parent ${parent} not listed in Inventory-Pages`);
        }
        if (inventoryIds && !inventoryIds.states.has(state) && !inventoryIds.surfaces.has(parent || "")) {
          warnings.push(`${rel} :: ${id}: state ${state} not found in inventory`);
        }
      }
      for (const interaction of interactions) {
        const state = parentState(interaction);
        if (state && states.length && !states.includes(state)) {
          warnings.push(`${rel} :: ${id}: interaction ${interaction} parent ${state} not listed in Inventory-States`);
        }
        if (inventoryIds && !inventoryIds.interactions.has(interaction)) {
          warnings.push(`${rel} :: ${id}: interaction ${interaction} not found in inventory`);
        }
      }
      for (const page of pages) {
        if (inventoryIds && !inventoryIds.pages.has(page) && !inventoryIds.surfaces.has(page)) {
          warnings.push(`${rel} :: ${id}: page ${page} not found in inventory`);
        }
      }

      const sources = scenario.meta.Sources || "";
      for (const source of sources.split(";").map((s) => s.trim()).filter(Boolean)) {
        const filePart = source.split("#")[0].trim();
        if (!filePart || filePart === "—") continue;
        const abs = path.resolve(root, filePart);
        if (!fs.existsSync(abs)) warnings.push(`${rel} :: ${id}: source path does not exist: ${filePart}`);
      }
    }
  }

  const report = {
    suite: toPosix(path.relative(root, suite)),
    features: featureFiles.length,
    scenarios: scenarioIds.size,
    rules: ruleIds.size,
    errors,
    warnings,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (errors.length) process.exit(1);
}

main();
