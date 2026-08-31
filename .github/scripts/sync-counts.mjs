#!/usr/bin/env node
// Owns every plugin count printed in README.md.
//
// Why this exists: the badge said 48 and the lede two lines below it said 33 for six
// days (2026-08-25 -> 2026-08-31). Both were hand-written, so a catalog change only ever
// updated whichever one the editor happened to be looking at. A number a human types is a
// number that goes stale; this script makes the catalog itself the only source of truth
// and rewrites both copies from it.
//
// Rule: no count is written by hand anywhere in this README. If a new one is needed, wrap
// it in a marker pair and add it to TARGETS below.
//
//   node .github/scripts/sync-counts.mjs           # rewrite README.md in place
//   node .github/scripts/sync-counts.mjs --check    # exit 1 if a count is stale, write nothing

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const CHECK = process.argv.includes('--check');
const FILE = 'README.md';

// The one section that is the catalog. Everything below the next H2 is a different list
// (the not-yet-plugins punch list) and must never be counted.
const SECTION = '## The catalog: verified Agent Plugins';

// Each target names a marker pair and how to render the count inside it.
const TARGETS = [
  { name: 'badge', render: (n) =>
      `<img src="https://img.shields.io/badge/plugins-${n}-blueviolet" alt="Plugin count" />` },
  { name: 'lede', render: (n) => String(n) },
];

let text = readFileSync(FILE, 'utf8');

// --- count the catalog --------------------------------------------------------------
const start = text.indexOf(`\n${SECTION}`);
if (start === -1) {
  console.error(`FAIL: catalog section not found ("${SECTION}"). Refusing to guess.`);
  process.exit(1);
}
const after = text.slice(start + 1 + SECTION.length);
const end = after.search(/\n## /);
const section = end === -1 ? after : after.slice(0, end);

// Strip HTML comments before parsing: an entry shape left inside a commented-out TODO
// is not an entry, and counting one would inflate every number on the page.
const entries = section
  .replace(/<!--[\s\S]*?-->/g, '')
  .split('\n')
  .filter((l) => /^- \[/.test(l));
const count = entries.length;

if (count === 0) {
  console.error('FAIL: catalog parsed to 0 entries. That is a parser break, not an empty list.');
  process.exit(1);
}

// --- read what the page currently claims, and refuse a silent shrink ------------------
const markers = {};
for (const t of TARGETS) {
  const re = new RegExp(`<!-- count:${t.name} -->([\\s\\S]*?)<!-- /count:${t.name} -->`);
  const m = text.match(re);
  if (!m) {
    console.error(`FAIL: marker pair <!-- count:${t.name} --> ... <!-- /count:${t.name} --> is missing.`);
    process.exit(1);
  }
  markers[t.name] = { re, was: m[1] };
}

const wasNum = Number((markers.badge.was.match(/badge\/plugins-(\d+)-/) || [])[1] || 0);
if (wasNum && count < wasNum * 0.8) {
  console.error(
    `FAIL: catalog would shrink ${wasNum} -> ${count} (>20%). A parser break looks exactly like ` +
    `this. Re-run after checking the catalog section really lost those entries.`
  );
  process.exit(1);
}

// --- rewrite -------------------------------------------------------------------------
const stale = [];
for (const t of TARGETS) {
  const want = t.render(count);
  if (markers[t.name].was !== want) stale.push(`${t.name}: "${markers[t.name].was}" -> "${want}"`);
  text = text.replace(
    markers[t.name].re,
    `<!-- count:${t.name} -->${want}<!-- /count:${t.name} -->`
  );
}

console.log(`Catalog: ${count} entries.`);
for (const s of stale) console.log(`  stale ${s}`);

if (CHECK) {
  if (stale.length) {
    console.error(`FAIL: ${stale.length} count(s) stale. Run: node .github/scripts/sync-counts.mjs`);
    process.exit(1);
  }
  console.log('All counts current.');
  process.exit(0);
}

if (stale.length) writeFileSync(FILE, text);
else console.log('All counts already current; nothing written.');

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${stale.length ? 'true' : 'false'}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `count=${count}\n`);
}
