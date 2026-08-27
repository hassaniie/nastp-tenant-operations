/**
 * Route guards.
 *
 * `RequireExperience` checks *which* experience a session grants, not merely
 * that one exists — an admin credential must not walk into the portal shell,
 * and a technician must not reach the control plane. A session for the wrong
 * experience is sent to its own home rather than to a door, because that
 * person is signed in; they are just in the wrong place.
 *
 * When there is no session at all the full path — search string included — is
 * stashed before redirecting, so the person lands where they were headed once
 * they sign in.
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { doorFor, homeFor } from '../data/auth';
import type { Experience } from '../data/types';

export function RequireExperience({ experience, children }: { experience: Experience; children: React.ReactNode }) {
  const { session, setIntended } = useAuth();
  const location = useLocation();

  if (!session) {
    // Stash during render rather than in an effect: the redirect happens
    // immediately, so an effect would run too late to be read by the door.
    setIntended(location.pathname + location.search);
    return <Navigate to={doorFor(experience)} replace />;
  }

  if (session.experience !== experience) {
    return <Navigate to={homeFor(session.experience)} replace />;
  }

  return <>{children}</>;
}

/**
 * The doors themselves, and the only place that decides where a freshly
 * signed-in person lands.
 *
 * The redirect deliberately happens *here* rather than in the sign-in handler.
 * Navigating straight after `signIn()` raced the session state: the guard on
 * the destination still saw no session, re-stashed the path and bounced back,
 * and by then this component had a session and sent the person to the
 * experience home — silently losing the page they had asked for. Resolving the
 * target in an effect means it is only computed once the session has actually
 * committed.
 *
 * A live session also has no business sitting on a login form, so the same
 * path covers someone navigating back to a door after signing in.
 */
export function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { session, takeIntended } = useAuth();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (session && target === null) setTarget(takeIntended() ?? homeFor(session.experience));
  }, [session, target, takeIntended]);

  if (session) {
    // One frame while the intended path is consumed — rendering the form again
    // here would flash a login screen the person has already passed.
    return target ? <Navigate to={target} replace /> : null;
  }
  return <>{children}</>;
}
