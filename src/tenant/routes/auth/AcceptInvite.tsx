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
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { AuthPanel, AuthWorkspace } from '../../components/layout/auth-workspace';
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

  // Skip the screen only if this exact account already holds a live session
  // here — accepting again would be redundant. A session for someone else
  // (a different portal user, or the admin who generated the link, in the
  // same browser) does not preempt this: accepting replaces it, the same as
  // signing out of one account and into another would.
  if (session && found.ok && session.experience === found.token.experience && session.subjectId === found.token.subjectId) {
    return <Navigate to={homeFor(session.experience)} replace />;
  }

  if (!found.ok) {
    const copy = REASON_COPY[found.reason === 'not_found' ? 'not_found' : found.reason];
    return (
      <AuthWorkspace eyebrow="Account invitation" title={copy.title} description={copy.body} icon={MailWarning} tone="warning"
        footer={<Link to={doorFor('portal')} className="font-medium text-primary underline underline-offset-2">Go to sign in</Link>} />
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
    <AuthWorkspace eyebrow="Account invitation" title="Set your password" icon={KeyRound} description={
      <p>
        For <span className="font-medium text-foreground">{t.email}</span>. This activates your account.
      </p>}>
      <AuthPanel>
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
      </AuthPanel>
    </AuthWorkspace>
  );
}
