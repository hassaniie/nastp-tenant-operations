import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/tenant/components/ui/table-model.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { sortRows, pageRows, togglePageSelection } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('numeric sorting uses magnitude and never mutates live records', () => {
  const rows = Object.freeze([{ n: 12 }, { n: 3 }, { n: 8 }]);
  assert.deepEqual(sortRows(rows, r => r.n).map(r => r.n), [3, 8, 12]);
  assert.deepEqual(sortRows(rows, r => r.n, 'desc').map(r => r.n), [12, 8, 3]);
  assert.deepEqual(rows.map(r => r.n), [12, 3, 8]);
});
test('text sorting and unsorted inputs preserve expected ordering', () => {
  const rows = ['Zulu', 'Alpha', 'Bravo'];
  assert.deepEqual(sortRows(rows, r => r), ['Alpha', 'Bravo', 'Zulu']);
  assert.equal(sortRows(rows), rows);
});
test('filtering clamps an obsolete page and handles empty/unpaged lists', () => {
  assert.deepEqual(pageRows([1, 2, 3, 4], 9, 3), { count: 2, current: 1, visible: [4] });
  assert.deepEqual(pageRows([], 9, 3), { count: 1, current: 0, visible: [] });
  assert.deepEqual(pageRows([1, 2], -1, 0), { count: 1, current: 0, visible: [1, 2] });
});
test('page selection retains other pages and does not mutate controlled state', () => {
  const selected = new Set(['other-page', 'a']);
  assert.deepEqual([...togglePageSelection(selected, ['a', 'b'], true)], ['other-page', 'a', 'b']);
  assert.deepEqual([...togglePageSelection(selected, ['a', 'b'], false)], ['other-page']);
  assert.deepEqual([...selected], ['other-page', 'a']);
});
