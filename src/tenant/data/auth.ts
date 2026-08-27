/**
 * Authentication for the three experiences.
 *
 * Credentials are derived from the world's own people — administrators,
 * tenant users and technicians — so there is exactly one roster and a person
 * added anywhere can sign in. Sessions are issued per experience: the guard
 * checks *which* experience a session grants, not merely that one exists, so
 * a technician credential cannot walk into the control plane.
 *
 * On the honesty of the password handling: `digest()` below is a
 * non-cryptographic hash. It exists so that nothing in this codebase ever
 * compares a plaintext password, which keeps the shape of the system correct.
 * It is not security and is not pretending to be — a real deployment hashes
 * server-side with argon2 or bcrypt and never ships a credential table to the
 * browser at all. This is the one place the simulation cannot stand in for the
 * real thing, so it says so out loud.
 */

import { simulation } from './live';
import type {
  AuthEvent, AuthEventKind, AuthSession, Credential, Experience, SignInFailure,
} from './types';

/** Every seeded account uses this. Shown on the sign-in screens on purpose —
 *  there is no mail server here, so a hidden password would be a locked door. */
export const DEMO_PASSWORD = 'nastp2026';

/** Five failures inside this window locks the account for the same duration. */
export const LOCKOUT_THRESHOLD = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function digest(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, '0');
}

const normalise = (email: string) => email.trim().toLowerCase();

/* ------------------------------------------------------------ credentials */

/**
 * Built from the live world on every lookup rather than cached, so a tenant
 * onboarded during the session can sign in immediately.
 */
function credentials(): Credential[] {
  const w = simulation.getState();
  const out: Credential[] = [];

  for (const a of w.admins) {
    out.push({ email: normalise(a.email), digest: digest(DEMO_PASSWORD), experience: 'admin', subjectId: a.id });
  }
  for (const u of w.users) {
    out.push({ email: normalise(u.email), digest: digest(DEMO_PASSWORD), experience: 'portal', subjectId: u.id });
  }
  for (const t of w.technicians) {
    out.push({ email: normalise(t.email), digest: digest(DEMO_PASSWORD), experience: 'tech', subjectId: t.id });
  }
  return out;
}

/* ------------------------------------------------- failures and the audit */

interface FailureRecord {
  count: number;
  firstAt: number;
  lockedUntil?: number;
}

const failures = new Map<string, FailureRecord>();
const events: AuthEvent[] = [];

function record(kind: AuthEventKind, email: string, experience: Experience, subjectId?: string, detail?: string) {
  events.unshift({
    id: `ae-${Date.now()}-${events.length}`,
    ts: Date.now(),
    kind,
    email,
    experience,
    subjectId,
    detail,
  });
  if (events.length > 400) events.length = 400;
}

/** Newest first. Read by the access log in Settings. */
export const authEvents = (): AuthEvent[] => [...events];

export function lockoutRemainingMs(email: string): number {
  const rec = failures.get(normalise(email));
  if (!rec?.lockedUntil) return 0;
  const left = rec.lockedUntil - Date.now();
  if (left <= 0) {
    failures.delete(normalise(email));
    return 0;
  }
  return left;
}

function noteFailure(email: string, experience: Experience) {
  const key = normalise(email);
  const now = Date.now();
  const rec = failures.get(key);

  if (!rec || now - rec.firstAt > LOCKOUT_WINDOW_MS) {
    failures.set(key, { count: 1, firstAt: now });
    return;
  }
  rec.count += 1;
  if (rec.count >= LOCKOUT_THRESHOLD) {
    rec.lockedUntil = now + LOCKOUT_WINDOW_MS;
    record('lockout', key, experience, undefined, `${rec.count} failed attempts`);
  }
}

/** A completed password reset clears the lock — otherwise recovery is a dead end. */
export function clearLockout(email: string) {
  failures.delete(normalise(email));
}

/* -------------------------------------------------------------- sign in */

export type SignInResult =
  | { ok: true; session: AuthSession }
  | { ok: false; reason: SignInFailure; detail?: string };

/**
 * `door` is the experience whose login screen this came from. A credential for
 * a different experience is refused with `wrong_door` and the caller names the
 * correct one — it is never silently accepted into the wrong shell.
 */
export function signIn(email: string, password: string, door: Experience): SignInResult {
  const key = normalise(email);
  const w = simulation.getState();

  if (lockoutRemainingMs(key) > 0) {
    record('signin_failed', key, door, undefined, 'locked out');
    return { ok: false, reason: 'locked_out' };
  }

  const match = credentials().find((c) => c.email === key);

  // No account, or the wrong password: the same answer either way, so the
  // screen never reveals which addresses exist.
  if (!match || match.digest !== digest(password)) {
    noteFailure(key, door);
    record('signin_failed', key, door, undefined, 'bad credentials');
    return { ok: false, reason: 'bad_credentials' };
  }

  if (match.experience !== door) {
    record('signin_failed', key, door, match.subjectId, `credential is for ${match.experience}`);
    return { ok: false, reason: 'wrong_door', detail: match.experience };
  }

  const now = Date.now();
  const base = { experience: match.experience, subjectId: match.subjectId, issuedAt: now, lastSeenAt: now };

  if (match.experience === 'admin') {
    const admin = w.admins.find((a) => a.id === match.subjectId);
    if (!admin || admin.status === 'disabled') {
      record('signin_failed', key, door, match.subjectId, 'account disabled');
      return { ok: false, reason: 'user_disabled' };
    }
  }

  if (match.experience === 'tech') {
    const tech = w.technicians.find((t) => t.id === match.subjectId);
    if (!tech || tech.status === 'disabled') {
      record('signin_failed', key, door, match.subjectId, 'account disabled');
      return { ok: false, reason: 'user_disabled' };
    }
    // Being off-shift changes what can be assigned, never whether you can look.
  }

  if (match.experience === 'portal') {
    const user = w.users.find((u) => u.id === match.subjectId);
    if (!user || user.status === 'disabled') {
      record('signin_failed', key, door, match.subjectId, 'account disabled');
      return { ok: false, reason: 'user_disabled' };
    }
    const tenant = w.tenantById[user.tenantId];
    const blocked: Partial<Record<string, SignInFailure>> = {
      suspended: 'tenant_suspended',
      expired: 'tenant_expired',
      archived: 'tenant_archived',
    };
    const reason = tenant ? blocked[tenant.status] : 'tenant_archived';
    if (reason) {
      record('signin_failed', key, door, match.subjectId, `tenant ${tenant?.status}`);
      return { ok: false, reason };
    }
    failures.delete(key);
    record('signin', key, door, match.subjectId);
    return { ok: true, session: { ...base, tenantId: user.tenantId } };
  }

  failures.delete(key);
  record('signin', key, door, match.subjectId);
  return { ok: true, session: base };
}

export function signOut(session: AuthSession) {
  const email = emailFor(session) ?? '—';
  if (session.impersonating) {
    record('impersonation_end', email, 'admin', session.subjectId, session.impersonating.tenantId);
  }
  record('signout', email, session.experience, session.subjectId);
}

export function noteImpersonationStart(session: AuthSession, tenantId: string) {
  record('impersonation_start', emailFor(session) ?? '—', 'admin', session.subjectId, tenantId);
}

export function noteImpersonationEnd(session: AuthSession, tenantId: string) {
  record('impersonation_end', emailFor(session) ?? '—', 'admin', session.subjectId, tenantId);
}

/* ------------------------------------------------------------- resolution */

/** The display name and email behind a session, whichever roster it points at. */
export function subjectFor(session: AuthSession): { name: string; email: string; title: string } | undefined {
  const w = simulation.getState();
  if (session.experience === 'admin') {
    const a = w.admins.find((x) => x.id === session.subjectId);
    return a && { name: a.name, email: a.email, title: a.title };
  }
  if (session.experience === 'tech') {
    const t = w.technicians.find((x) => x.id === session.subjectId);
    const dept = t && w.departments.find((d) => d.id === t.departmentId);
    return t && { name: t.name, email: t.email, title: dept ? `${dept.name} Technician` : 'Technician' };
  }
  const u = w.users.find((x) => x.id === session.subjectId);
  return u && { name: u.name, email: u.email, title: u.role.replace(/_/g, ' ') };
}

const emailFor = (session: AuthSession) => subjectFor(session)?.email;

/** The door a given experience is reached through. */
export const doorFor = (experience: Experience): string =>
  experience === 'admin' ? '/admin/login' : experience === 'tech' ? '/tech/login' : '/portal/login';

/** Where a signed-in session lands when it has nowhere particular to go. */
export const homeFor = (experience: Experience): string =>
  experience === 'admin' ? '/admin' : experience === 'tech' ? '/tech' : '/portal';

/** Which experience owns a path — used by the guard to pick the right door. */
export function experienceForPath(pathname: string): Experience {
  if (pathname.startsWith('/tech')) return 'tech';
  if (pathname.startsWith('/portal')) return 'portal';
  return 'admin';
}

export const SIGN_IN_MESSAGE: Record<SignInFailure, string> = {
  bad_credentials: 'That email and password do not match. Check both and try again.',
  wrong_door: 'That account signs in at a different door.',
  user_disabled: 'This account has been disabled. Contact NASTP operations to restore it.',
  tenant_suspended: 'Your organisation’s access is suspended. Contact NASTP operations.',
  tenant_expired: 'Your organisation’s tenancy has expired. Contact NASTP operations.',
  tenant_archived: 'This account is no longer active.',
  locked_out: 'Too many failed attempts. Try again shortly, or reset your password.',
};
