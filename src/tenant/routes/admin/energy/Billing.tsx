/**
 * Admin — Charges & Billing (§16). Invoices across every tenant with payment
 * status, outstanding tracking and a downloadable invoice. Realistic mock
 * invoice data with export-ready structures; no online payment.
 */

import { useState } from 'react';
import { ListToolbar } from '../../../components/layout/list-toolbar';
import { MetricBand } from '../../../components/layout/metric-band';
import { Page } from '../../../components/layout/page';
import { PageHeader } from '../../../components/patterns/page-header';
import { StatCard } from '../../../components/patterns/stat-card';
import { Field } from '../../../components/ui/field';
import { SearchInput } from '../../../components/ui/input';
import { SimpleSelect } from '../../../components/ui/select';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { PaymentBadge } from '../../../components/patterns/status-badge';
import { InvoiceDialog } from '../../energyShared';
import { useLive } from '../../../data/live';
import { currency, fmtDateFull, num } from '../../../lib/utils';
import type { Invoice, PaymentStatus } from '../../../data/types';

export default function Billing() {
  const invoices = useLive((w) => w.invoices.map((i) => ({ ...i, tenantName: w.tenantById[i.tenantId]?.name ?? '—' })).sort((a, b) => b.periodStart - a.periodStart));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all');
  const [open, setOpen] = useState<Invoice | null>(null);

  const filtered = invoices.filter((i) => {
    if (status !== 'all' && i.paymentStatus !== status) return false;
    const t = search.trim().toLowerCase();
    if (t && !(i.tenantName.toLowerCase().includes(t) || i.number.toLowerCase().includes(t))) return false;
    return true;
  });

  const outstanding = invoices.filter((i) => i.paymentStatus === 'due' || i.paymentStatus === 'overdue').reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.paymentStatus === 'overdue').length;
  const monthTotal = invoices.slice(0, 20).reduce((s, i) => s + i.total, 0);

  const columns: Column<(typeof invoices)[number]>[] = [
    { key: 'number', header: 'Invoice', cell: (i) => <span className="tnum whitespace-nowrap text-[12px] font-medium text-foreground">{i.number}</span>, sortValue: (i) => i.number },
    { key: 'tenant', header: 'Tenant', cell: (i) => i.tenantName, sortValue: (i) => i.tenantName, hideBelow: 'sm' },
    { key: 'period', header: 'Period', cell: (i) => i.periodLabel, hideBelow: 'md' },
    { key: 'kwh', header: 'kWh', align: 'right', cell: (i) => <span className="tnum">{num(i.totalKwh)}</span>, sortValue: (i) => i.totalKwh, hideBelow: 'lg' },
    { key: 'total', header: 'Amount', align: 'right', cell: (i) => <span className="tnum font-medium text-foreground">{currency(i.total)}</span>, sortValue: (i) => i.total },
    { key: 'due', header: 'Due', cell: (i) => <span className="tnum text-muted">{fmtDateFull(i.dueDate)}</span>, hideBelow: 'xl' },
    { key: 'status', header: 'Status', cell: (i) => <PaymentBadge status={i.paymentStatus} size="sm" /> },
  ];

  return (
    <Page workspace archetype="data" className="ds-data-workspace">
      <PageHeader eyebrow="Energy finance · Park operations" title="Charges & billing" description="Energy invoices and payment status across all tenants." />
      <MetricBand columns={4}>
        <StatCard variant="inline" label="Invoices" value={num(invoices.length)} caption="All billing periods" />
        <StatCard variant="inline" label="Recent billed" value={currency(monthTotal, { compact: true })} caption="Last 20 invoices" />
        <StatCard variant="inline" label="Outstanding" value={currency(outstanding, { compact: true })} caption="Due and overdue" />
        <StatCard variant="inline" label="Overdue" value={num(overdue)} caption={overdue ? 'Requires collection' : 'No overdue invoices'} />
      </MetricBand>
      <ListToolbar summary={`${filtered.length} matching invoices`} onReset={search || status !== 'all' ? () => { setSearch(''); setStatus('all'); } : undefined}>
        <Field label="Search"><SearchInput value={search} onChange={setSearch} placeholder="Tenant or invoice…" label="Search invoices" /></Field>
        <Field label="Status" className="sm:max-w-[240px]"><SimpleSelect value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'paid', label: 'Paid' }, { value: 'due', label: 'Due' }, { value: 'overdue', label: 'Overdue' }]} /></Field>
      </ListToolbar>
      <DataTable rows={filtered} columns={columns} rowKey={(i) => i.id} rowLabel={(i) => `${i.number}: ${i.tenantName}`} label="Energy invoices" onRowClick={(i) => setOpen(i)} emptyTitle="No invoices match" emptyDescription="Try a different tenant, invoice number or status." pageSize={14} resetKey={`${search}|${status}`} />

      <InvoiceDialog invoice={open} open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)} tenantName={open ? (open as { tenantName?: string }).tenantName : undefined} />
    </Page>
  );
}
