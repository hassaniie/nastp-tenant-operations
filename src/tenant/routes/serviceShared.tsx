/**
 * Shared Service Center building blocks: the request detail drawer with its
 * timeline, comments, attachments and lifecycle actions (§27–29), used by both
 * the admin management workspace and the tenant portal. Admin advances the
 * ticket and assigns; the tenant confirms resolution, reopens and rates.
 */

import {
  Check, CheckCheck, MessageSquarePlus, Paperclip, PencilLine, RotateCcw, Send, ThumbsUp, UserCog,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button, IconBox, Avatar } from '../components/ui/primitives';
import {
  Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTrigger,
  Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader,
  Popover, PopoverContent, PopoverTrigger,
} from '../components/ui/overlay';
import { DefList } from '../components/ui/data';
import { SimpleSelect, Textarea } from '../components/ui/form';
import { Timeline, RatingStars, type TimelineItem } from '../components/common';
import { PriorityBadge, ServiceStatusBadge, CATEGORY_ICON } from '../components/status';
import { SERVICE_STATUS } from '../lib/meta';
import {
  SERVICE_CATEGORY_LABEL, departmentById, departmentForCategory, technicianOpenLoad,
} from '../data/catalog';
import { simulation, useLive } from '../data/live';
import { useSession } from '../store/session';
import { useAuth } from '../store/auth';
import { ago, cn, fmtDateTime } from '../lib/utils';
import type { ServiceCategory, ServiceRequest, ServiceStatus } from '../data/types';

const DISPATCHABLE_STATUSES: ReadonlySet<ServiceStatus> = new Set([
  'acknowledged', 'assigned', 'in_progress', 'waiting_tenant', 'reopened',
]);
const RECATEGORISABLE_STATUSES: ReadonlySet<ServiceStatus> = new Set([
  'submitted', 'acknowledged', 'assigned', 'in_progress', 'waiting_tenant', 'reopened',
]);

// Simple category labels for the drawer meta.
const catLabel = (c: string) => SERVICE_CATEGORY_LABEL[c] ?? c;

/** The sensible next transitions an admin can make from each state. Getting
 *  to `assigned` in the first place goes through the technician picker below,
 *  not a one-click button — the system never names a person on its own. */
const ADMIN_NEXT: Partial<Record<ServiceStatus, Array<{ to: ServiceStatus; label: string }>>> = {
  submitted: [{ to: 'acknowledged', label: 'Acknowledge' }],
  assigned: [{ to: 'in_progress', label: 'Start work' }],
  in_progress: [{ to: 'waiting_tenant', label: 'Wait for tenant' }, { to: 'resolved', label: 'Resolve' }],
  waiting_tenant: [{ to: 'in_progress', label: 'Resume' }, { to: 'resolved', label: 'Resolve' }],
  reopened: [{ to: 'in_progress', label: 'Resume' }],
};

export function ServiceRequestDrawer({ request, open, onOpenChange, mode, tenantName }: { request: ServiceRequest | null; open: boolean; onOpenChange: (o: boolean) => void; mode: 'admin' | 'tenant'; tenantName?: string }) {
  const { toast } = useSession();
  const { subject } = useAuth();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  // The assignee is a reference now, so it's resolved from the roster rather
  // than carried on the request as a frozen string. Called unconditionally,
  // above the early return below, so this component's hook count never
  // changes between a closed drawer (request is null) and an open one.
  const assignee = useLive((w) => w.technicians.find((t) => t.id === request?.technicianId));
  if (!request) return null;
  const r = request;
  // The signed-in admin, not a fixed name — several admins share this drawer.
  const actor = mode === 'admin' ? (subject?.name ?? 'NASTP Admin') : r.createdBy;
  const Icon = CATEGORY_ICON[r.category];
  const department = departmentById(r.departmentId);

  const timeline: TimelineItem[] = r.timeline.map((e, i) => ({
    id: `${e.status}-${i}`,
    tone: SERVICE_STATUS[e.status].tone,
    title: SERVICE_STATUS[e.status].label,
    detail: e.note ? e.note : `by ${e.by}`,
    meta: ago(e.ts),
  }));

  const postComment = () => {
    if (!comment.trim()) return;
    simulation.addRequestComment(r.id, { author: actor, authorRole: mode, body: comment.trim() });
    setComment('');
  };

  const transition = (to: ServiceStatus, label: string) => {
    simulation.transitionRequest(r.id, to, actor);
    toast({ title: `Request ${label.toLowerCase()}`, description: `${r.reference} is now ${SERVICE_STATUS[to].label.toLowerCase()}.`, variant: to === 'resolved' ? 'success' : 'default' });
  };

  const confirm = () => { simulation.transitionRequest(r.id, 'confirmed', actor); if (rating) simulation.rateRequest(r.id, rating); toast({ title: 'Resolution confirmed', description: 'Thank you for confirming.', variant: 'success' }); onOpenChange(false); };
  const reopen = () => { simulation.transitionRequest(r.id, 'reopened', actor, 'Reopened by tenant'); toast({ title: 'Request reopened', variant: 'warning' }); };

  const assign = (technicianId: string, reason?: string) => {
    const wasAssigned = Boolean(r.technicianId);
    simulation.assignTechnician(r.id, technicianId, actor, reason);
    toast({ title: wasAssigned ? 'Request reassigned' : 'Request assigned', description: `${r.reference} dispatched.`, variant: 'success' });
  };

  const recategorise = (category: ServiceCategory, reason: string) => {
    simulation.overrideCategory(r.id, category, actor, reason);
    toast({ title: 'Category updated', description: `${r.reference} routed to ${departmentForCategory(category).name}.`, variant: 'default' });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent width="560px">
        <DrawerHeader
          title={r.title}
          subtitle={`${r.reference}${tenantName ? ' · ' + tenantName : ''}`}
          badge={<div className="flex items-center gap-1.5"><PriorityBadge priority={r.priority} size="sm" /><ServiceStatusBadge status={r.status} size="sm" /></div>}
        />
        <DrawerBody className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-inset/50 p-3">
            <IconBox icon={Icon} tone="service" size="md" />
            <p className="text-[13px] leading-relaxed text-muted">{r.description}</p>
          </div>

          <DefList columns={2} items={[
            { label: 'Category', value: catLabel(r.category) },
            { label: 'Location', value: r.location ?? '—' },
            { label: 'Created', value: fmtDateTime(r.createdAt) },
            { label: 'Due', value: r.dueAt ? fmtDateTime(r.dueAt) : '—' },
            // Admin gets the actionable versions of these two below instead.
            ...(mode === 'tenant' ? [
              { label: 'Department', value: department?.name ?? 'Unrouted' },
              { label: 'Assignee', value: assignee?.name ?? 'Unassigned' },
            ] : []),
          ]} />

          {mode === 'admin' && !department?.triageOnly && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-inset/50 p-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Assignment</p>
                <p className="mt-1 truncate text-[13px] font-medium text-foreground">{assignee ? assignee.name : 'Unassigned'}</p>
                <p className="text-[11px] text-subtle">
                  {department?.name ?? 'Unrouted'}{assignee ? ` · ${assignee.availability.replace(/_/g, ' ')}` : ''}
                </p>
              </div>
              {DISPATCHABLE_STATUSES.has(r.status) && (
                <TechnicianPicker
                  departmentId={r.departmentId}
                  currentId={r.technicianId}
                  requireReason={Boolean(r.technicianId)}
                  onAssign={assign}
                  trigger={<Button variant="secondary" size="sm"><UserCog className="h-3.5 w-3.5" />{r.technicianId ? 'Reassign' : 'Assign'}</Button>}
                />
              )}
            </div>
          )}

          {mode === 'admin' && RECATEGORISABLE_STATUSES.has(r.status) && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-inset/50 p-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Category</p>
                <p className="mt-1 text-[13px] font-medium text-foreground">{catLabel(r.category)}</p>
                <p className="text-[11px] text-subtle">Routed to {department?.name ?? 'Unrouted'}</p>
              </div>
              <CategoryOverrideDialog
                current={r.category}
                onSubmit={recategorise}
                trigger={<Button variant="ghost" size="sm"><PencilLine className="h-3.5 w-3.5" />Change</Button>}
              />
            </div>
          )}

          {r.attachments.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {r.attachments.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-inset px-2.5 py-1.5 text-[12px] text-muted">
                    <Paperclip className="h-3.5 w-3.5" />{a.name} <span className="text-subtle">· {Math.round(a.sizeKb)} KB</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Timeline</p>
            <Timeline items={timeline} />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Comments</p>
            <div className="flex flex-col gap-3">
              {r.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author} seed={c.author.length} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-foreground">{c.author}</span>
                      <span className="rounded bg-surface-inset px-1.5 py-0.5 text-[11px] text-subtle">{c.authorRole === 'admin' ? 'NASTP' : c.authorRole === 'tenant' ? 'Tenant' : 'System'}</span>
                      <span className="text-[11px] text-subtle">{ago(c.ts)}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="flex-1" />
              <Button variant="secondary" size="sm" disabled={!comment.trim()} onClick={postComment}><Send className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {mode === 'tenant' && r.status === 'resolved' && (
            <div className="rounded-xl border border-success/25 bg-success-dim/40 p-3.5">
              <p className="text-[13px] font-medium text-foreground">This request is marked resolved.</p>
              <p className="mt-0.5 text-[12px] text-muted">Rate the service and confirm, or reopen if the issue persists.</p>
              <div className="mt-2.5"><RatingStars value={rating} onChange={setRating} size={20} /></div>
            </div>
          )}
          {r.rating && (
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-inset/50 p-3">
              <RatingStars value={r.rating.score} size={16} />
              <span className="text-[12px] text-muted">{r.rating.feedback ?? 'Rated by tenant'}</span>
            </div>
          )}
        </DrawerBody>

        <DrawerFooter>
          {mode === 'admin' && (ADMIN_NEXT[r.status]?.length ? (
            ADMIN_NEXT[r.status]!.map((t) => (
              <Button key={t.to} variant={t.to === 'resolved' ? 'success' : 'secondary'} size="sm" onClick={() => transition(t.to, t.label)}>{t.label}</Button>
            ))
          ) : (
            <span className="text-[12px] text-subtle">
              {r.status === 'acknowledged'
                ? 'Use Assignment above to dispatch.'
                : ['resolved', 'confirmed', 'closed'].includes(r.status)
                ? 'Awaiting tenant / closed.'
                : 'No further action.'}
            </span>
          ))}
          {mode === 'tenant' && r.status === 'resolved' && (
            <>
              <Button variant="ghost" size="sm" onClick={reopen}><RotateCcw className="h-4 w-4" />Reopen</Button>
              <Button variant="success" size="sm" onClick={confirm}><ThumbsUp className="h-4 w-4" />Confirm{rating ? ' & rate' : ''}</Button>
            </>
          )}
          {mode === 'tenant' && (r.status === 'confirmed' || r.status === 'closed') && !r.rating && (
            <Button variant="secondary" size="sm" onClick={() => { if (rating) { simulation.rateRequest(r.id, rating); toast({ title: 'Thanks for the rating', variant: 'success' }); } }} disabled={!rating}><CheckCheck className="h-4 w-4" />Submit rating</Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Names the person, surfaces the load. The department scope means every
 * option is already a valid destination for this ticket; the sort just puts
 * the most sensible pick — on shift, least loaded — at the top rather than
 * choosing for the admin.
 */
function TechnicianPicker({
  departmentId, currentId, requireReason, onAssign, trigger,
}: {
  departmentId: string;
  currentId?: string;
  requireReason: boolean;
  onAssign: (technicianId: string, reason?: string) => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | undefined>(currentId);
  const [reason, setReason] = useState('');

  const techs = useLive((w) =>
    w.technicians
      .filter((t) => t.departmentId === departmentId && t.status === 'active')
      .map((t) => ({ ...t, load: technicianOpenLoad(w.requests, t.id) }))
      .sort((a, b) => (a.availability === 'on_shift' ? 0 : 1) - (b.availability === 'on_shift' ? 0 : 1) || a.load - b.load),
  );

  const canConfirm = Boolean(picked) && picked !== currentId && (!requireReason || reason.trim().length > 0);

  const confirm = () => {
    if (!canConfirm || !picked) return;
    onAssign(picked, reason.trim() || undefined);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => { setOpen(o); if (o) { setPicked(currentId); setReason(''); } }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-0">
        <div className="max-h-[240px] overflow-y-auto p-1.5">
          {techs.length === 0 && <p className="p-3 text-[12px] text-subtle">No active technicians in this department.</p>}
          {techs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPicked(t.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-raised',
                picked === t.id && 'bg-primary-muted/40',
              )}
            >
              <Avatar name={t.name} seed={t.avatarSeed} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-foreground">
                  {t.name}{t.id === currentId ? ' · current' : ''}
                </p>
                <p className="text-[11px] text-subtle">{t.availability.replace(/_/g, ' ')} · {t.load} open</p>
              </div>
              {picked === t.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
        {requireReason && (
          <div className="border-t border-border-subtle p-2.5">
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for reassignment…" />
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-border-subtle p-2.5">
          <Button variant="ghost" size="xs" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" size="xs" disabled={!canConfirm} onClick={confirm}>Confirm</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const CATEGORY_OPTIONS = Object.entries(SERVICE_CATEGORY_LABEL).map(([value, label]) => ({ value: value as ServiceCategory, label }));

/** A category change is a routing decision, not a typo fix — it re-points the
 *  ticket at a different department and drops whoever had it, so it asks for
 *  a reason rather than applying silently the way the picker above does. */
function CategoryOverrideDialog({ current, onSubmit, trigger }: { current: ServiceCategory; onSubmit: (category: ServiceCategory, reason: string) => void; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ServiceCategory>(current);
  const [reason, setReason] = useState('');

  const rerouting = category !== current;
  const canSubmit = rerouting && reason.trim().length > 0;
  const target = departmentForCategory(category);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(category, reason.trim());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setCategory(current); setReason(''); } }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader
          title="Change category"
          description="Re-routes to whichever department owns the new category, and unassigns the current technician."
        />
        <DialogBody className="flex flex-col gap-4">
          <SimpleSelect value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          {rerouting && (
            <p className="text-[12px] text-muted">
              Will route to <span className="font-medium text-foreground">{target.name}</span>
              {target.triageOnly ? ' — triage only, so it will need re-categorising again before anyone can be assigned' : ''}.
            </p>
          )}
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being re-categorised?" />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!canSubmit} onClick={submit}>Re-route</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { MessageSquarePlus };
