#!/usr/bin/env node
/**
 * Parse business-functional Gherkin suite metadata.
 * Usage: node parse-gherkin.mjs --suite <dir>
 */
import fs from "node:fs";
import path from "node:path";

function arg(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function parseMetadata(commentBlock) {
  const meta = {};
  const sources = [];
  for (const raw of commentBlock.split("\n")) {
    const line = raw.replace(/^\s*#\s?/, "").trim();
    if (!line) continue;
    if (line.startsWith("- ")) {
      sources.push(line.slice(2).trim());
      continue;
    }
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  if (sources.length) meta.Sources = sources.join("; ");
  return meta;
}

function parseFeature(rel, text) {
  const scenarios = [];
  let commentBuf = [];
  let pendingTags = [];
  let current = null;
  const flush = () => {
    if (current) scenarios.push(current);
    current = null;
  };
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("@") && !current) {
      pendingTags = trimmed.split(/\s+/).filter(Boolean);
      continue;
    }
    if (trimmed.startsWith("#")) {
      commentBuf.push(trimmed);
      continue;
    }
    if (/^(Scenario Outline|Scenario):/.test(trimmed)) {
      flush();
      current = {
        title: trimmed.replace(/^Scenario Outline:|^Scenario:/, "").trim(),
        tags: pendingTags,
        meta: parseMetadata(commentBuf.join("\n")),
        steps: [],
        file: rel,
      };
      pendingTags = [];
      commentBuf = [];
      continue;
    }
    if (current && /^(Given|When|Then|And|But)\b/.test(trimmed)) current.steps.push(trimmed);
  }
  flush();
  return scenarios;
}

const suite = arg("--suite");
if (!suite) {
  process.stderr.write("Usage: node parse-gherkin.mjs --suite <dir>\n");
  process.exit(1);
}
const abs = path.resolve(suite);
if (!fs.existsSync(abs)) {
  process.stderr.write(`Suite not found: ${abs}\n`);
  process.exit(1);
}
const files = walk(abs).filter((f) => f.endsWith(".feature"));
const scenarios = files.flatMap((file) =>
  parseFeature(path.relative(process.cwd(), file).split(path.sep).join("/"), fs.readFileSync(file, "utf8")),
);
process.stdout.write(`${JSON.stringify({ suite: abs, features: files.length, scenarios }, null, 2)}\n`);
