#!/usr/bin/env node
/**
 * Downloads the genuine free ReUI registry files needed for the
 * NASTP Admin Shell + Dashboard pilot.
 *
 * Run this on your Mac (it needs plain internet access to reui.io — the
 * Claude Code session cannot reach it). Node only, no dependencies.
 *
 *   node reui-fetch.mjs
 *
 * It writes ./reui-registry/<name>.json plus a manifest, and resolves every
 * `registryDependencies` entry recursively so the offline install cannot be
 * missing a transitive file.
 *
 * Style: `radix-nova` is ReUI's Radix UI base. This project already depends on
 * nine @radix-ui packages, so the Radix variant reuses them instead of adding
 * Base UI as a second primitive library. The script verifies the style
 * actually resolves before downloading, and falls back to `base-nova`.
 *
 * Free items only. No licence, no premium blocks, no Motion Icons.
 */

const OUT = 'reui-registry';
const STYLES = process.argv[2] ? [process.argv[2]] : ['radix-nova', 'base-nova'];
const REUI = (style, name) => `https://reui.io/r/${style}/${name}.json`;
const SHADCN = (name) => `https://ui.shadcn.com/r/styles/new-york/${name}.json`;

/** Seeds for the Admin Shell + Dashboard pilot. Everything else is pulled in
 *  automatically as a registry dependency of one of these. */
const SEEDS = [
  // ReUI components — the visual language
  'frame',        // the surface backbone: Frame / FramePanel, concentric radii
  'badge',        // status vocabulary
  'alert',        // attention / risk states
  'icon-tile',    // icon treatment
  // primitives the shell and dashboard compose with
  'button',
  'card',
  'separator',
  'dropdown-menu',
  'scroll-area',
  'tooltip',
  'tabs',
  'avatar',
  'input',
  'progress',
  'skeleton',
  // free c-* examples — the compositional patterns to copy
  'c-card-15',    // stat card with trend + overflow menu  -> KPI tiles
  'c-alert-13',   // stacked alerts within a Frame         -> attention feed
  'c-alert-17',   // service status summary in a frame     -> attention feed
  'c-accordion-9',// user list w/ avatars + role indicators-> data rows
];

const fs = await import('node:fs/promises');

async function head(url) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    return r.ok ? r : null;
  } catch { return null; }
}

/* ---------------------------------------------------- verify the style */
let STYLE = null;
for (const s of STYLES) {
  process.stdout.write(`Probing style "${s}" ... `);
  const r = await head(REUI(s, 'frame'));
  console.log(r ? 'OK' : 'not found');
  if (r) { STYLE = s; break; }
}
if (!STYLE) {
  console.error(`\nCould not resolve a ReUI style from: ${STYLES.join(', ')}`);
  console.error('Open https://reui.io/docs/registry and pass the correct one:');
  console.error('  node reui-fetch.mjs <style>');
  process.exit(1);
}
console.log(`\nUsing style: ${STYLE}\n`);

/* --------------------------------------------- breadth-first download */
await fs.mkdir(OUT, { recursive: true });
const queue = [...SEEDS];
const done = new Map();   // name -> {source, deps}
const failed = [];

while (queue.length) {
  const raw = queue.shift();
  if (!raw) continue;
  // deps may arrive as "badge", "@reui/badge", or a full URL
  const isUrl = /^https?:\/\//.test(raw);
  const name = isUrl ? raw.split('/').pop().replace(/\.json$/, '') : raw.replace(/^@reui\//, '');
  if (done.has(name)) continue;

  let res = isUrl ? await head(raw) : await head(REUI(STYLE, name));
  let source = isUrl ? raw : 'reui';
  if (!res && !isUrl) { res = await head(SHADCN(name)); source = res ? 'shadcn' : null; }

  if (!res) { failed.push(name); console.log(`  MISS  ${name}`); continue; }

  const json = await res.json();
  await fs.writeFile(`${OUT}/${name}.json`, JSON.stringify(json, null, 2));
  const deps = Array.isArray(json.registryDependencies) ? json.registryDependencies : [];
  done.set(name, { source, deps, files: (json.files || []).length });
  console.log(`  OK    ${name}  (${source}, ${(json.files || []).length} file(s)${deps.length ? ', deps: ' + deps.join(', ') : ''})`);
  for (const d of deps) queue.push(d);
}

/* ------------------------------------------------------------ manifest */
const manifest = {
  fetchedAt: new Date().toISOString(),
  style: STYLE,
  registry: `https://reui.io/r/${STYLE}/{name}.json`,
  seeds: SEEDS,
  items: Object.fromEntries([...done].map(([k, v]) => [k, v])),
  failed,
};
await fs.writeFile(`${OUT}/_manifest.json`, JSON.stringify(manifest, null, 2));

console.log(`\nDownloaded ${done.size} registry files into ./${OUT}/`);
if (failed.length) console.log(`Could not resolve: ${failed.join(', ')}`);
console.log(`Manifest: ./${OUT}/_manifest.json`);
console.log(`\nNext:\n  git add ${OUT} && git commit -m "Add ReUI registry files for offline install" && git push`);
