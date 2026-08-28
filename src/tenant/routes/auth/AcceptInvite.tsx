/**
 * Turning an invitation into a working account.
 *
 * Closes the loop opened in onboarding: a primary user is created there at
 * `status: 'invited'`, but there was nowhere for that invitation to lead.
 * Accepting moves the account to `active` and signs in immediately — no
 * second trip to the login screen for a password the person just set.
 */

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, MailWarning } from 'lucide-react';
import { Button, IconBox } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/form';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../store/auth';
import { acceptInvite, doorFor, homeFor, lookupToken } from '../../data/auth';

const REASON_COPY: Record<'not_found' | 'expired' | 'used', { title: string; body: string }> = {
  not_found: { title: 'This link isn’t valid', body: 'Check that the whole link was copied, or ask for a new one.' },
  expired: { title: 'This link has expired', body: 'Invitations are valid for 7 days. Ask NASTP operations to send a new one.' },
  used: { title: 'This link has already been used', body: 'If you already set a password, sign in instead.' },
};

export default function AcceptInvite() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { adoptSession, session } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const found = lookupToken(token);

  if (session) return <Navigate to={homeFor(session.experience)} replace />;

  if (!found.ok) {
    const copy = REASON_COPY[found.reason === 'not_found' ? 'not_found' : found.reason];
    return (
      <Shell>
        <IconBox icon={MailWarning} tone="warning" size="lg" />
        <h1 className="text-[20px] font-semibold text-foreground">{copy.title}</h1>
        <p className="max-w-[34ch] text-[13px] text-muted">{copy.body}</p>
        <Link to={doorFor('portal')} className="text-[13px] font-medium text-primary underline underline-offset-2">
          Go to sign in
        </Link>
      </Shell>
    );
  }

  const t = found.token;
  const valid = password.length >= 8 && password === confirm;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const result = acceptInvite(token, password);
    setBusy(false);

    if (!result.ok) {
      setError('This link is no longer valid. Refresh the page for details.');
      return;
    }
    // The token already proved identity — adopt the session directly rather
    // than asking for the password a second time at a login screen.
    adoptSession(result.session);
    navigate(homeFor(t.experience), { replace: true });
  }

  return (
    <Shell>
      <IconBox icon={KeyRound} tone="primary" size="lg" />
      <h1 className="text-[20px] font-semibold text-foreground">Set your password</h1>
      <p className="max-w-[34ch] text-[13px] text-muted">
        For <span className="font-medium text-foreground">{t.email}</span>. This activates your account.
      </p>

      <Card className="w-full max-w-[380px] p-5">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Password" hint="At least 8 characters.">
            <Input type="password" autoFocus autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirm password" error={confirm && password !== confirm ? 'Passwords do not match.' : undefined}>
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          {error && <p role="alert" className="text-[12px] text-critical">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={busy} disabled={!valid}>
            <CheckCircle2 className="h-4 w-4" />
            Activate account
          </Button>
        </form>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-canvas p-5 text-center">
      {children}
    </div>
  );
}
