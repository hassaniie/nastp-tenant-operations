/**
 * Tenant Portal — Billing & Charges (§16). Complete billing information: the
 * current period, historical bills, payment status, outstanding amounts and a
 * downloadable invoice. No estimated billing, no online payment.
 */

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { MetricBand } from '../../../components/layout/metric-band';
import { WorkspaceSection } from '../../../components/layout/workspace-section';
import { StatCard } from '../../../components/patterns/stat-card';
import { Button } from '../../../components/ui/button';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { PaymentBadge } from '../../../components/patterns/status-badge';
import { InvoiceDialog } from '../../energyShared';
import { useSession } from '../../../store/session';
import { useLive } from '../../../data/live';
import { currency, fmtDateFull, num } from '../../../lib/utils';
import type { Invoice } from '../../../data/types';

export default function PortalEnergyBilling() {
  const { tenantId } = useSession();
  const invoices = useLive((w) => w.invoices.filter((i) => i.tenantId === tenantId).sort((a, b) => b.periodStart - a.periodStart));
  const [open, setOpen] = useState<Invoice | null>(null);

  const latest = invoices[0];
  const outstanding = invoices.filter((i) => i.paymentStatus !== 'paid').reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.paymentStatus === 'overdue').length;

  const columns: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice', cell: (i) => <span className="tnum font-medium text-foreground">{i.number}</span>, sortValue: (i) => i.number },
    { key: 'period', header: 'Period', cell: (i) => i.periodLabel, sortValue: (i) => i.periodStart },
    { key: 'kwh', header: 'kWh', align: 'right', cell: (i) => <span className="tnum">{num(i.totalKwh)}</span>, hideBelow: 'md' },
    { key: 'total', header: 'Amount', align: 'right', cell: (i) => <span className="tnum font-medium text-foreground">{currency(i.total)}</span>, sortValue: (i) => i.total },
    { key: 'due', header: 'Due', cell: (i) => <span className="tnum text-muted">{fmtDateFull(i.dueDate)}</span>, hideBelow: 'lg' },
    { key: 'status', header: 'Status', cell: (i) => <PaymentBadge status={i.paymentStatus} size="sm" /> },
  ];

  return (
    <>
      <MetricBand columns={3}>
        <StatCard variant="inline" label="Current Bill" value={latest ? currency(latest.total, { compact: true }) : '—'} icon={Wallet} tone="energy" caption={latest?.periodLabel} onClick={latest ? () => setOpen(latest) : undefined} />
        <StatCard variant="inline" label="Outstanding" value={currency(outstanding, { compact: true })} icon={Wallet} tone={outstanding ? 'warning' : 'success'} />
        <StatCard variant="inline" label="Overdue" value={num(overdue)} icon={Wallet} tone={overdue ? 'critical' : 'success'} />
      </MetricBand>

      {latest && (
        <WorkspaceSection title="Current Period Breakdown" description={latest.periodLabel} actions={<Button variant="secondary" size="sm" onClick={() => setOpen(latest)}>View invoice</Button>}>
            <div className="overflow-x-auto border border-border">
              <Table className="w-full text-left text-[13px]">
                <TableHeader className="bg-surface-inset"><TableRow>
                  <TableHead className="px-3.5 py-2.5 font-semibold uppercase tracking-[0.08em] text-subtle">Component</TableHead>
                  <TableHead className="px-3.5 py-2.5 text-right font-semibold uppercase tracking-[0.08em] text-subtle">Units (kWh)</TableHead>
                  <TableHead className="px-3.5 py-2.5 text-right font-semibold uppercase tracking-[0.08em] text-subtle">Rate</TableHead>
                  <TableHead className="px-3.5 py-2.5 text-right font-semibold uppercase tracking-[0.08em] text-subtle">Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {latest.lines.map((l) => (
                    <TableRow key={l.component} className="border-t border-border-subtle">
                      <TableCell className="px-3.5 py-2.5 capitalize text-foreground">{l.component.replace('_', '-')}</TableCell>
                      <TableCell className="tnum px-3.5 py-2.5 text-right text-muted">{num(l.units)}</TableCell>
                      <TableCell className="tnum px-3.5 py-2.5 text-right text-muted">{l.rate.toFixed(2)}</TableCell>
                      <TableCell className="tnum px-3.5 py-2.5 text-right font-medium text-foreground">{currency(l.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter><TableRow className="border-t border-border bg-surface-inset/50">
                  <TableCell className="px-3.5 py-2.5 font-semibold text-foreground" colSpan={3}>Total</TableCell>
                  <TableCell className="tnum px-3.5 py-2.5 text-right text-[14px] font-semibold text-foreground">{currency(latest.total)}</TableCell>
                </TableRow></TableFooter>
              </Table>
            </div>
        </WorkspaceSection>
      )}

      <WorkspaceSection title="Historical Bills" description={`${invoices.length} invoices`} inset={false}>
        <DataTable rows={invoices} columns={columns} rowKey={(i) => i.id} onRowClick={(i) => setOpen(i)} emptyTitle="No invoices yet" emptyDescription="Invoices appear here once the first billing period closes." />
      </WorkspaceSection>

      <InvoiceDialog invoice={open} open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)} />
    </>
  );
}
