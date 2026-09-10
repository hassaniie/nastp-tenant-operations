import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
const dir = new URL('../dist/assets/', import.meta.url);
const scripts = readdirSync(dir).filter(name => name.endsWith('.js'));
assert.ok(scripts.length, 'Run npm run build first');
for (const name of scripts) {
  const source = readFileSync(new URL(name, dir), 'utf8');
  for (const forbidden of ['DEMO-101', 'Sample Aero Labs', 'DesignWorkbench', 'admin/design-system']) {
    assert.ok(!source.includes(forbidden), `${name} contains development-only content: ${forbidden}`);
  }
}
console.log('Production boundary passed: no workbench route, module or fixtures in emitted JavaScript.');
