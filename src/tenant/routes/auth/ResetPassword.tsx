/**
 * Forgotten passwords, in two stages: request a link, then use it.
 *
 * The request stage answers identically whether or not the address matched an
 * account — the entire point of the screen is to give an attacker nothing to
 * learn from it. Because there is no mail server, a fresh link is surfaced in
 * a clearly separate "demo tools" disclosure rather than in the confirmation
 * itself, so the confirmation stays a true no-op for an unknown address while
 * the flow is still genuinely completable.
 */

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, Mail, MailWarning, ShieldCheck } from 'lucide-react';
import { Button, IconBox } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/form';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../store/auth';
import { completeReset, doorFor, homeFor, lookupToken, requestPasswordReset } from '../../data/auth';
import type { Experience } from '../../data/types';

const DOOR_LABEL: Record<Experience, string> = { admin: 'Administrator', portal: 'Tenant user', tech: 'Technician' };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-canvas p-5 text-center">
      {children}
    </div>
  );
}

export function RequestReset() {
  const [params] = useSearchParams();
  const door = (params.get('door') as Experience) || 'portal';

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const t = requestPasswordReset(email, door);
    setBusy(false);
    setSent(true);
    // Only ever set when a real token was minted — an unknown address leaves
    // this null, so the screen below cannot be used to test which is true.
    setDemoLink(t ? `${location.origin}${location.pathname}#/reset/${t.token}` : null);
  }

  if (sent) {
    return (
      <Shell>
        <IconBox icon={Mail} tone="primary" size="lg" />
        <h1 className="text-[20px] font-semibold text-foreground">Check your email</h1>
        <p className="max-w-[36ch] text-[13px] text-muted">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset
          link is on its way. It will expire in an hour.
        </p>
        <Link to={doorFor(door)} className="text-[13px] font-medium text-primary underline underline-offset-2">
          Back to sign in
        </Link>

        {/* Demo tools — a separate, clearly-labelled panel. This is not part of
            the answer above: it only ever appears when a token was actually
            minted, but its presence is never how a person is meant to learn
            that — it exists purely because no mail server can deliver the
            link this build would otherwise send. */}
        {demoLink && (
          <Card className="mt-4 w-full max-w-[420px] p-4 text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">Demo tools</p>
            <p className="mt-1 text-[11px] text-subtle">
              No mail server exists in this build, so the link that would have been emailed is shown here.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-2">
              <code className="flex-1 truncate text-[11px] text-muted">{demoLink}</code>
              <Button variant="secondary" size="xs" onClick={() => navigator.clipboard.writeText(demoLink)}>Copy</Button>
            </div>
          </Card>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <IconBox icon={KeyRound} tone="primary" size="lg" />
      <h1 className="text-[20px] font-semibold text-foreground">Reset your password</h1>
      <p className="max-w-[34ch] text-[13px] text-muted">
        Enter the email for your {DOOR_LABEL[door].toLowerCase()} account and we’ll send a reset link.
      </p>
      <Card className="w-full max-w-[380px] p-5">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Email">
            <Input type="email" autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Button type="submit" variant="primary" size="lg" loading={busy} disabled={!email}>Send reset link</Button>
        </form>
      </Card>
      <Link to={doorFor(door)} className="text-[12px] text-subtle underline underline-offset-2 hover:text-foreground">
        Back to sign in
      </Link>
    </Shell>
  );
}

const REASON_COPY: Record<'not_found' | 'expired' | 'used', { title: string; body: string }> = {
  not_found: { title: 'This link isn’t valid', body: 'Check that the whole link was copied, or request a new one.' },
  expired: { title: 'This link has expired', body: 'Reset links are valid for one hour. Request a new one.' },
  used: { title: 'This link has already been used', body: 'If you already reset your password, sign in with it now.' },
};

export function CompleteReset() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const found = lookupToken(token);

  if (session) return <Navigate to={homeFor(session.experience)} replace />;

  if (!found.ok && !done) {
    const copy = REASON_COPY[found.reason];
    return (
      <Shell>
        <IconBox icon={MailWarning} tone="warning" size="lg" />
        <h1 className="text-[20px] font-semibold text-foreground">{copy.title}</h1>
        <p className="max-w-[34ch] text-[13px] text-muted">{copy.body}</p>
        <Link to="/reset" className="text-[13px] font-medium text-primary underline underline-offset-2">Request a new link</Link>
      </Shell>
    );
  }

  if (done) {
    const door = found.ok ? found.token.experience : 'portal';
    return (
      <Shell>
        <IconBox icon={CheckCircle2} tone="success" size="lg" />
        <h1 className="text-[20px] font-semibold text-foreground">Password updated</h1>
        <p className="max-w-[34ch] text-[13px] text-muted">
          Sign in with your new password. For your security this did not sign you in automatically.
        </p>
        <Button variant="primary" onClick={() => navigate(doorFor(door as Experience))}>Go to sign in</Button>
      </Shell>
    );
  }

  const t = found.ok ? found.token : undefined;
  const valid = password.length >= 8 && password === confirm;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const result = completeReset(token, password);
    setBusy(false);
    if (!result.ok) {
      setError('This link is no longer valid. Refresh the page for details.');
      return;
    }
    setDone(true);
  }

  return (
    <Shell>
      <IconBox icon={ShieldCheck} tone="primary" size="lg" />
      <h1 className="text-[20px] font-semibold text-foreground">Choose a new password</h1>
      {t && <p className="max-w-[34ch] text-[13px] text-muted">For <span className="font-medium text-foreground">{t.email}</span>.</p>}
      <Card className="w-full max-w-[380px] p-5">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" autoFocus autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirm password" error={confirm && password !== confirm ? 'Passwords do not match.' : undefined}>
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          {error && <p role="alert" className="text-[12px] text-critical">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={busy} disabled={!valid}>Update password</Button>
        </form>
      </Card>
    </Shell>
  );
}
