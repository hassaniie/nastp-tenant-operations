#!/usr/bin/env node
/**
 * Installs the downloaded ReUI / shadcn registry items into the app.
 *
 * The shadcn CLI cannot run here (reui.io is blocked by the egress policy),
 * so this performs the same job from the registry JSON the user downloaded:
 * it writes each item's `files[].content` to the path its own `target`
 * declares, remapped onto this project's layout.
 *
 *   ReUI components  -> src/tenant/components/reui/<name>.tsx
 *   shadcn primitives -> src/tenant/components/shadcn/<name>.tsx
 *
 * The c-* examples are deliberately NOT written: they import
 * `@/app/(create)/components/icon-placeholder`, a helper that only exists
 * inside ReUI's own docs site, so they would not compile. They stay in
 * reui-registry/ as committed provenance and as the compositional reference.
 *
 * Two rewrites are applied, both mechanical and both explained in
 * styles/shadcn-compat.css:
 *   1. `@/components/ui/*` -> `@/components/shadcn/*`  (this project keeps
 *      its own components/ui, which the CLI must never collide with)
 *   2. `bg-muted` -> `bg-muted-surface`, `var(--color-muted)` ->
 *      `var(--color-muted-surface)`. theme.css maps --color-muted to a TEXT
 *      colour used by `text-muted` in 103 places; ReUI uses `muted` as a
 *      SURFACE. Every hit is in a vendored file, since `bg-muted` appears
 *      zero times in the hand-written app.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'reui-registry';
const REUI_DIR = 'src/tenant/components/reui';
const SHADCN_DIR = 'src/tenant/components/shadcn';

const manifest = JSON.parse(await fs.readFile(`${SRC}/_manifest.json`, 'utf8'));
await fs.mkdir(REUI_DIR, { recursive: true });
await fs.mkdir(SHADCN_DIR, { recursive: true });

const rewrite = (code) =>
  code
    .replace(/@\/components\/ui\//g, '@/components/shadcn/')
    .replace(/\bbg-muted\b/g, 'bg-muted-surface')
    .replace(/var\(--color-muted\)/g, 'var(--color-muted-surface)')
    // ReUI and shadcn disagree on what `*-foreground` means for a status
    // colour. ReUI's solid badges hardcode `text-white` and reserve
    // --destructive-foreground for the *tinted* variants, where it must be a
    // readable dark red. shadcn's Button instead treats it as the contrast
    // partner for a solid fill. The token follows ReUI (it is the design
    // language being adopted, and success/warning/info all behave that way),
    // so the one shadcn solid fill is pinned to white to match.
    .replace(/bg-destructive text-destructive-foreground/g, 'bg-destructive text-white');

const banner = (name, source, style) =>
  `/**\n` +
  ` * ${name} — vendored from the ${source === 'reui' ? 'ReUI' : 'shadcn/ui'} registry.\n` +
  ` *\n` +
  ` * Source: ${source === 'reui' ? `https://reui.io/r/${style}/${name}.json` : `https://ui.shadcn.com/r/styles/new-york/${name}.json`}\n` +
  ` * Installed from reui-registry/${name}.json — do not edit by hand; re-install to update.\n` +
  ` *\n` +
  ` * Local adaptations (see styles/shadcn-compat.css):\n` +
  ` *   @/components/ui/* -> @/components/shadcn/*\n` +
  ` *   bg-muted -> bg-muted-surface (theme.css uses --color-muted as a text colour)\n` +
  ` */\n`;

let reui = 0, shad = 0, skipped = [];
for (const [name, meta] of Object.entries(manifest.items)) {
  const item = JSON.parse(await fs.readFile(`${SRC}/${name}.json`, 'utf8'));
  const file = item.files[0];
  if (item.type === 'registry:block' || name.startsWith('c-')) { skipped.push(name); continue; }

  const dir = meta.source === 'reui' ? REUI_DIR : SHADCN_DIR;
  const out = path.join(dir, `${name}.tsx`);
  await fs.writeFile(out, banner(name, meta.source, manifest.style) + rewrite(file.content));
  meta.source === 'reui' ? reui++ : shad++;
  console.log(`  ${meta.source === 'reui' ? 'reui   ' : 'shadcn '} ${out}`);
}

console.log(`\n${reui} ReUI + ${shad} shadcn components installed.`);
console.log(`Skipped (docs-only imports, kept as provenance): ${skipped.join(', ')}`);
