/** Pure table state helpers, shared by DataTable and focused tests. */
export function sortRows<T>(rows: T[], value: ((row: T) => string | number) | undefined, direction: 'asc' | 'desc' = 'asc'): T[] {
  if (!value) return rows;
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = value(a), bv = value(b);
    return sign * (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv)));
  });
}
export function pageRows<T>(rows: T[], page: number, size: number) {
  const count = size > 0 ? Math.max(1, Math.ceil(rows.length / size)) : 1;
  const current = Math.max(0, Math.min(page, count - 1));
  return { count, current, visible: size > 0 ? rows.slice(current * size, (current + 1) * size) : rows };
}
export function togglePageSelection(selected: Set<string>, keys: string[], checked: boolean): Set<string> {
  const next = new Set(selected);
  for (const key of keys) checked ? next.add(key) : next.delete(key);
  return next;
}
