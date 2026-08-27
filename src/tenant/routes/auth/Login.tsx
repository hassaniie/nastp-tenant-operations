/**
 * The three doors.
 *
 * Separate routes per experience, sharing one composition so they stay
 * siblings rather than three divergent screens. Each renders outside every
 * shell — no rail, no top bar, nothing to navigate to but signing in.
 *
 * The demo accounts panel is deliberate, not scaffolding: there is no mail
 * server in the simulation, so a hidden password would make the product
 * unopenable. It states plainly that these are seeded accounts.
 */

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';
import { Button, IconBox } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/form';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../store/auth';
import { DEMO_PASSWORD, SIGN_IN_MESSAGE, doorFor, lockoutRemainingMs } from '../../data/auth';
import { useLive } from '../../data/live';
import type { Experience } from '../../data/types';
import type { Tone } from '../../lib/meta';
import { cn } from '../../lib/utils';

interface DoorConfig {
  experience: Experience;
  icon: LucideIcon;
  tone: Tone;
  eyebrow: string;
  title: string;
  blurb: string;
  otherDoors: Experience[];
}

const DOORS: Record<Experience, DoorConfig> = {
  admin: {
    experience: 'admin',
    icon: ShieldCheck,
    tone: 'primary',
    eyebrow: 'NASTP Administration',
    title: 'Control plane',
    blurb: 'Park-wide operations across every tenant, meter, visitor and service request.',
    otherDoors: ['portal', 'tech'],
  },
  portal: {
    experience: 'portal',
    icon: Building2,
    tone: 'visitor',
    eyebrow: 'Tenant Portal',
    title: 'Your organisation',
    blurb: 'Your energy, your visitors and your service requests — nobody else’s.',
    otherDoors: ['admin', 'tech'],
  },
  tech: {
    experience: 'tech',
    icon: Wrench,
    tone: 'service',
    eyebrow: 'Service Workforce',
    title: 'Technician workspace',
    blurb: 'The jobs assigned to you, in the order you should work them.',
    otherDoors: ['admin', 'portal'],
  },
};

const DOOR_LABEL: Record<Experience, string> = {
  admin: 'Administrator',
  portal: 'Tenant user',
  tech: 'Technician',
};

function LoginScreen({ door }: { door: Experience }) {
  const config = DOORS[door];
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ReactNode>(null);
  const [busy, setBusy] = useState(false);

  // Seeded accounts for this door, so the screen can be opened at all.
  const demoAccounts = useLive((w) => {
    if (door === 'admin') return w.admins.map((a) => ({ email: a.email, label: a.title }));
    if (door === 'tech') {
      // Ordered by open workload so the door opens on someone with a queue
      // rather than whoever happens to be first in the roster.
      const open = new Map<string, number>();
      for (const r of w.requests) {
        if (!r.technicianId) continue;
        if (!['assigned', 'in_progress', 'waiting_tenant', 'reopened'].includes(r.status)) continue;
        open.set(r.technicianId, (open.get(r.technicianId) ?? 0) + 1);
      }
      return [...w.technicians]
        .sort((a, b) => (open.get(b.id) ?? 0) - (open.get(a.id) ?? 0))
        .slice(0, 3)
        .map((t) => ({
          email: t.email,
          label: `${w.departments.find((d) => d.id === t.departmentId)?.name ?? 'Technician'} · ${open.get(t.id) ?? 0} open`,
        }));
    }
    return w.users
      .filter((u) => u.status !== 'disabled' && w.tenantById[u.tenantId]?.status === 'active')
      .slice(0, 3)
      .map((u) => ({ email: u.email, label: w.tenantById[u.tenantId]?.name ?? 'Tenant' }));
  });

  const lockedMs = useMemo(() => (email ? lockoutRemainingMs(email) : 0), [email]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result = signIn(email, password, door);
    setBusy(false);

    // No navigation here on purpose — `RedirectIfSignedIn` sends the person on
    // once the session has committed, which is what keeps a deep link intact.
    if (result.ok) return;

    if (result.reason === 'wrong_door' && result.detail) {
      const other = result.detail as Experience;
      setError(
        <>
          {SIGN_IN_MESSAGE.wrong_door}{' '}
          <Link to={doorFor(other)} className="font-medium text-primary underline underline-offset-2">
            Sign in as a {DOOR_LABEL[other].toLowerCase()}
          </Link>
          .
        </>,
      );
      return;
    }
    setError(SIGN_IN_MESSAGE[result.reason]);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas p-5">
      <div className="flex w-full max-w-[420px] flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconBox icon={config.icon} tone={config.tone} size="lg" />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-subtle">{config.eyebrow}</p>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">{config.title}</h1>
            <p className="mx-auto max-w-[34ch] text-[13px] text-muted">{config.blurb}</p>
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <Field label="Email">
              <Input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                invalid={Boolean(error)}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                invalid={Boolean(error)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-[10px] border border-critical/25 bg-critical-dim px-3 py-2 text-[12px] text-critical">
                {error}
              </p>
            )}

            {lockedMs > 0 && !error && (
              <p className="text-[12px] text-warning">
                Locked for another {Math.ceil(lockedMs / 60000)} minute{Math.ceil(lockedMs / 60000) === 1 ? '' : 's'}.
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" loading={busy} disabled={!email || !password}>
              Sign in
            </Button>
          </form>
        </Card>

        {demoAccounts.length > 0 && (
          <Card className="flex flex-col gap-2.5 p-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-medium text-foreground">Seeded accounts</p>
              <p className="text-[11px] text-subtle">
                This build runs on simulated data with no mail server, so the accounts are listed
                here. Password for all of them is <span className="font-mono text-muted">{DEMO_PASSWORD}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                    'hover:bg-surface-raised',
                  )}
                >
                  <span className="truncate font-mono text-[11.5px] text-muted">{a.email}</span>
                  <span className="shrink-0 text-[11px] text-subtle">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        <p className="text-center text-[11px] text-subtle">
          Not the right door?{' '}
          {config.otherDoors.map((other, i) => (
            <span key={other}>
              {i > 0 && ' · '}
              <Link to={doorFor(other)} className="text-muted underline underline-offset-2 hover:text-foreground">
                {DOOR_LABEL[other]}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export function AdminLogin() {
  return <LoginScreen door="admin" />;
}
export function PortalLogin() {
  return <LoginScreen door="portal" />;
}
export function TechLogin() {
  return <LoginScreen door="tech" />;
}
