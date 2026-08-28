/**
 * The signed-in session, and the intended path a guard is holding for it.
 *
 * Kept separate from `SessionProvider`, which owns preferences, toasts and the
 * live simulation. Those survive a sign-out; a session must not.
 *
 * The intended path lives here rather than in the URL because it has to
 * survive the redirect to a login screen and be consumed exactly once. A
 * person who follows a notification link while signed out should land on the
 * page they asked for, not on the experience's home — that round trip is the
 * flow most likely to break, so it is modelled explicitly.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import {
  doorFor, homeFor, noteImpersonationEnd, noteImpersonationStart,
  signIn as attemptSignIn, signOut as recordSignOut, subjectFor, type SignInResult,
} from '../data/auth';
import type { AuthSession, Experience } from '../data/types';

const SESSION_KEY = 'nastp-tenant-ops.session';
const INTENDED_KEY = 'nastp-tenant-ops.intended';
const IDLE_FLAG_KEY = 'nastp-tenant-ops.idle-signout';

interface AuthValue {
  session: AuthSession | null;
  /** Display identity behind the session, resolved from whichever roster it points at. */
  subject: { name: string; email: string; title: string } | undefined;
  signIn: (email: string, password: string, door: Experience) => SignInResult;
  /** Adopts an already-validated session — used by invite acceptance, which
   *  has already proven identity by way of the token itself. */
  adoptSession: (session: AuthSession) => void;
  signOut: () => void;
  /** Admin support tool: see a tenant's portal without their password. */
  startImpersonation: (tenantId: string) => void;
  endImpersonation: () => void;
  /** The path a guard stashed before redirecting to a door. Consumed once. */
  takeIntended: () => string | null;
  setIntended: (path: string) => void;
  /** Set by idle expiry, read once by the door to show why the session ended.
   *  A router `navigate(..., { state })` was tried first here and proved
   *  unreliable specifically for a redirect fired from a timer rather than a
   *  click — this reuses the same persisted-flag approach as `intended`,
   *  which is already proven to survive this exact redirect. */
  markIdleSignOut: () => void;
  takeIdleSignOut: () => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

function loadSession(): AuthSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadSession);

  // Persist so a reload — and a second tab — behave like the real thing.
  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable — the session stays tab-scoped */
    }
  }, [session]);

  const signIn = useCallback((email: string, password: string, door: Experience) => {
    const result = attemptSignIn(email, password, door);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const adoptSession = useCallback((next: AuthSession) => setSession(next), []);

  const signOut = useCallback(() => {
    setSession((current) => {
      if (current) recordSignOut(current);
      return null;
    });
    try {
      localStorage.removeItem(INTENDED_KEY);
    } catch {
      /* nothing to clear */
    }
  }, []);

  const startImpersonation = useCallback((tenantId: string) => {
    setSession((current) => {
      if (!current || current.experience !== 'admin') return current;
      noteImpersonationStart(current, tenantId);
      return { ...current, tenantId, impersonating: { tenantId, byAdminId: current.subjectId, startedAt: Date.now() } };
    });
  }, []);

  const endImpersonation = useCallback(() => {
    setSession((current) => {
      if (!current?.impersonating) return current;
      noteImpersonationEnd(current, current.impersonating.tenantId);
      const { impersonating: _dropped, tenantId: _tenant, ...rest } = current;
      return rest;
    });
  }, []);

  const setIntended = useCallback((path: string) => {
    try {
      localStorage.setItem(INTENDED_KEY, path);
    } catch {
      /* the person lands on the experience home instead — degraded, not broken */
    }
  }, []);

  const takeIntended = useCallback(() => {
    try {
      const path = localStorage.getItem(INTENDED_KEY);
      localStorage.removeItem(INTENDED_KEY);
      return path;
    } catch {
      return null;
    }
  }, []);

  const markIdleSignOut = useCallback(() => {
    try {
      localStorage.setItem(IDLE_FLAG_KEY, '1');
    } catch {
      /* the door simply won't explain why — not fatal */
    }
  }, []);

  const takeIdleSignOut = useCallback(() => {
    try {
      const flag = localStorage.getItem(IDLE_FLAG_KEY);
      localStorage.removeItem(IDLE_FLAG_KEY);
      return flag === '1';
    } catch {
      return false;
    }
  }, []);

  const subject = useMemo(() => (session ? subjectFor(session) : undefined), [session]);

  const value = useMemo<AuthValue>(
    () => ({
      session, subject, signIn, adoptSession, signOut, startImpersonation, endImpersonation,
      takeIntended, setIntended, markIdleSignOut, takeIdleSignOut,
    }),
    [
      session, subject, signIn, adoptSession, signOut, startImpersonation, endImpersonation,
      takeIntended, setIntended, markIdleSignOut, takeIdleSignOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export { doorFor, homeFor };
