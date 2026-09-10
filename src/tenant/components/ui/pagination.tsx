import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export function Pagination({ page, pageCount, total, pageSize, onChange }: { page: number; pageCount: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  const from = total ? page * pageSize + 1 : 0;
  const to = Math.min(total, (page + 1) * pageSize);
  return <nav aria-label="Pagination" className="flex items-center justify-between border-t border-border px-5 py-3"><p className="tnum text-[12px] text-subtle">{from}–{to} of {total.toLocaleString()}</p><div className="flex items-center gap-1"><Button variant="ghost" size="icon-sm" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></Button><span className="tnum px-2 text-[12px] text-muted">{page + 1} / {pageCount}</span><Button variant="ghost" size="icon-sm" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-3.5 w-3.5" /></Button></div></nav>;
}
