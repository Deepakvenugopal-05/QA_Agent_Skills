#!/usr/bin/env node
/**
 * Join inventory IDs with Gherkin metadata.
 * Usage: node validate-traceability.mjs --inventory <file> --suite <dir>
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

function arg(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `Failed ${script}\n`);
    process.exit(result.status || 1);
  }
  return JSON.parse(result.stdout);
}

function splitCsv(value) {
  if (!value || value === "—" || value === "-") return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

const inventoryPath = arg("--inventory");
const suite = arg("--suite");
if (!inventoryPath || !suite) {
  process.stderr.write("Usage: node validate-traceability.mjs --inventory <file> --suite <dir>\n");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const inventory = run(path.join(here, "parse-inventory.mjs"), ["--inventory", inventoryPath]);
const gherkin = run(path.join(here, "parse-gherkin.mjs"), ["--suite", suite]);

const pageIds = new Set(inventory.pages.map((p) => p.id));
const stateIds = new Set(inventory.states.map((s) => s.id));
const interactionIds = new Set(inventory.interactions.map((i) => i.id));
const errors = [];
const warnings = [];
const seen = new Set();

for (const scenario of gherkin.scenarios) {
  const id = scenario.meta["Scenario-ID"];
  if (!id) {
    errors.push(`${scenario.file} :: "${scenario.title}" missing Scenario-ID`);
    continue;
  }
  if (seen.has(id)) errors.push(`Duplicate Scenario-ID ${id}`);
  seen.add(id);
  if (!scenario.meta["Fixture-Profile"]) errors.push(`${id} missing Fixture-Profile`);
  if (!scenario.meta["Actor-Grant-Scope"]) errors.push(`${id} missing Actor-Grant-Scope`);
  const mutation = (scenario.meta.Mutation || "").toLowerCase();
  const destructive = (scenario.meta.Destructive || "").toLowerCase();
  if (destructive === "yes" && mutation !== "yes") {
    errors.push(`${id} is destructive but Mutation is not yes`);
  }
  for (const page of splitCsv(scenario.meta["Inventory-Pages"])) {
    if (!pageIds.has(page) && !page.startsWith("S")) warnings.push(`${id} unknown page ${page}`);
  }
  for (const state of splitCsv(scenario.meta["Inventory-States"])) {
    if (!stateIds.has(state)) warnings.push(`${id} unknown state ${state}`);
  }
  for (const interaction of splitCsv(scenario.meta["Inventory-Interactions"])) {
    if (!interactionIds.has(interaction)) warnings.push(`${id} unknown interaction ${interaction}`);
  }
}

const report = {
  scenarios: gherkin.scenarios.length,
  inventoryPages: inventory.pages.length,
  inventoryInteractions: inventory.interactions.length,
  errors,
  warnings,
  inventoryDiagnostics: inventory.diagnostics,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (errors.length) process.exit(1);
