#!/usr/bin/env node
/**
 * Tolerant parser for frontend-page-inventory Markdown.
 * Usage: node parse-inventory.mjs --inventory <file>
 */
import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}

function cells(line) {
  if (!line || !line.includes("|")) return [];
  return line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

function isMarkdownSeparator(line) {
  const parts = cells(line);
  return parts.length > 0 && parts.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseInventory(text) {
  const pages = [];
  const states = [];
  const interactions = [];
  const diagnostics = [];
  const pageRe = /^### (P\d{3}) — (.+)$/;
  const surfaceRe = /^### (S\d{3}) — (.+)$/;
  const lines = text.split(/\r?\n/);
  let current = null;
  let table = null;
  let headers = [];

  const flushTable = () => {
    table = null;
    headers = [];
  };

  for (const line of lines) {
    const pageMatch = line.match(pageRe);
    const surfaceMatch = line.match(surfaceRe);
    if (pageMatch) {
      current = { id: pageMatch[1], title: pageMatch[2], kind: "page" };
      pages.push(current);
      flushTable();
      continue;
    }
    if (surfaceMatch) {
      current = { id: surfaceMatch[1], title: surfaceMatch[2], kind: "surface" };
      pages.push(current);
      flushTable();
      continue;
    }
    if (/^\| State ID \|/i.test(line) || /^\| Interaction ID \|/i.test(line)) {
      headers = cells(line).map((h) => h.toLowerCase());
      table = /state id/i.test(line) ? "states" : "interactions";
      continue;
    }
    if (table && isMarkdownSeparator(line)) continue;
    if (table && line.startsWith("|")) {
      const row = cells(line);
      if (!row.length || row[0] === "—") continue;
      const rec = {};
      headers.forEach((h, i) => {
        rec[h] = row[i];
      });
      if (table === "states") {
        states.push({
          id: rec["state id"],
          name: rec.name,
          kind: rec.kind,
          owner: current?.id,
        });
      } else {
        const locator = rec["preferred playwright locator"] || rec["preferred locator"] || "";
        interactions.push({
          id: rec["interaction id"],
          stateId: rec["state id"],
          name: rec.name,
          action: rec.action,
          locator,
          alternate: rec["alternate locator"],
          status: rec["locator status"],
          stability: rec.stability,
          destructive: rec.destructive,
          owner: current?.id,
        });
        if (/getByTestId\('/i.test(locator)) {
          diagnostics.push({ kind: "testid-candidate", id: rec["interaction id"], locator });
        }
      }
      continue;
    }
    if (table && line.startsWith("##")) flushTable();
  }

  if (!pages.length) diagnostics.push({ kind: "schema-drift", detail: "No ### P### page headings found" });
  return {
    pages: pages.filter((p) => p.kind === "page"),
    surfaces: pages.filter((p) => p.kind === "surface"),
    states,
    interactions,
    diagnostics,
  };
}

const inventoryPath = arg("--inventory");
if (!inventoryPath) {
  process.stderr.write("Usage: node parse-inventory.mjs --inventory <file>\n");
  process.exit(1);
}
const abs = path.resolve(inventoryPath);
if (!fs.existsSync(abs)) {
  process.stderr.write(`Inventory not found: ${abs}\n`);
  process.exit(1);
}
const parsed = parseInventory(fs.readFileSync(abs, "utf8"));
parsed.file = abs;
process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
