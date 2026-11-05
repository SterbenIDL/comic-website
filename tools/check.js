#!/usr/bin/env node
/**
 * Validates the story data. Run it after every edit:   node tools/check.js
 * Add --skip-images to skip the "does the image file exist" check.
 */
const fs = require('fs');
const path = require('path');
const { root, loadChapters } = require('./lib');

const skipImages = process.argv.includes('--skip-images');
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const exists = (p) => p && fs.existsSync(path.join(root, p));

// Known speakers, read from the main page so a typo in a name is caught
let speakers = new Set();
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
  const html = fs.readFileSync(path.join(root, cfg.mainPage || 'comics.html'), 'utf8');
  const block = html.match(/const speakerStyles = \{([\s\S]*?)\n\s*\};/);
  if (block) for (const m of block[1].matchAll(/^\s*['"]?([^'":\n]+?)['"]?\s*:\s*\{/gm)) speakers.add(m[1].trim());
} catch (e) { /* optional */ }

const chapters = loadChapters();
if (!chapters.length) err('No chapters found in data/');

for (const ch of chapters) {
  const where = (i) => `${ch.key}${i == null ? '' : ' page ' + (i + 1)}`;
  for (const f of ['name', 'title', 'category', 'img']) if (!ch.meta || !ch.meta[f]) err(`${ch.key}: meta.${f} is missing`);
  if (!skipImages && ch.meta && !exists(ch.meta.img) && !exists(ch.meta.fallbackImg)) err(`${ch.key}: cover image not found (${ch.meta.img})`);
  if (!Array.isArray(ch.pages) || !ch.pages.length) { err(`${ch.key}: no pages`); continue; }

  ch.pages.forEach((p, i) => {
    if (p.page !== i + 1) warn(`${where(i)}: "page" is ${p.page}, expected ${i + 1}`);
    if (!p.img) err(`${where(i)}: img is missing`);
    else if (!skipImages && !exists(p.img) && !exists(p.fallbackImg)) err(`${where(i)}: image not found (${p.img})`);
    if (!p.title) err(`${where(i)}: title is missing`);
    if (!Array.isArray(p.dialogue) || !p.dialogue.length) { warn(`${where(i)}: no dialogue`); return; }
    if (p.dialogue.length > 3) warn(`${where(i)}: ${p.dialogue.length} bubbles - only 3 positions exist, the rest will overlap`);
    p.dialogue.forEach((d, j) => {
      if (!d.speaker) err(`${where(i)} bubble ${j + 1}: speaker is missing`);
      else if (speakers.size && !speakers.has(d.speaker)) warn(`${where(i)} bubble ${j + 1}: unknown speaker "${d.speaker}" (will use the default colour)`);
      if (!d.speech || !String(d.speech).trim()) err(`${where(i)} bubble ${j + 1}: speech is empty`);
    });
  });
  console.log(`${ch.key}: ${ch.pages.length} pages`);
}

warnings.forEach(w => console.log('warning: ' + w));
errors.forEach(e => console.log('ERROR:   ' + e));
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK - ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
