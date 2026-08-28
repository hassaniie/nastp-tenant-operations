/**
 * Idle session expiry.
 *
 * Thirty minutes of no mouse, key, scroll or touch activity ends the session;
 * a warning appears two minutes out with a way to stay. Expiry stashes the
 * current path exactly the way an unauthenticated guard would, so signing
 * back in resumes precisely where the session left off — the same mechanism
 * that keeps a notification deep link intact, reused here so idle expiry
 * isn't a second, different way to lose your place.
 *
 * Mounted once, inside each experience's shell, so it only ever runs while a
 * session actually exists.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button, IconBox } from '../components/ui/primitives';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../components/ui/overlay';
import { useAuth } from '../store/auth';
import { doorFor } from '../data/auth';

const IDLE_LIMIT_MS = 30 * 60 * 1000;
const WARNING_AT_MS = 28 * 60 * 1000;
const CHECK_INTERVAL_MS = 5000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

export function IdleMonitor() {
  const { session, signOut, setIntended, markIdleSignOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [warn, setWarn] = useState(false);
  const [remainingMs, setRemainingMs] = useState(WARNING_AT_MS);
  const lastActivity = useRef(Date.now());

  const expire = () => {
    if (!session) return;
    // Fresh work in an unsubmitted form is preserved via `useDraft`
    // (sessionStorage), which this redirect does not touch — only the
    // session and the stashed intended path are cleared here.
    setIntended(location.pathname + location.search);
    markIdleSignOut();
    signOut();
    navigate(doorFor(session.experience), { replace: true });
  };

  const extend = () => {
    lastActivity.current = Date.now();
    setWarn(false);
  };

  useEffect(() => {
    if (!session) return;

    const onActivity = () => {
      // While the warning is showing, only a deliberate "stay signed in"
      // click counts — otherwise a stray mouse twitch during the warning
      // would silently cancel it and the person would never learn their
      // session was ever at risk.
      if (!warn) lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const id = window.setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_LIMIT_MS) {
        expire();
      } else if (idleFor >= WARNING_AT_MS) {
        setWarn(true);
        setRemainingMs(IDLE_LIMIT_MS - idleFor);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, warn]);

  if (!session) return null;

  return (
    <Dialog open={warn} onOpenChange={(open) => !open && extend()}>
      <DialogContent size="sm">
        <DialogHeader
          title="Still there?"
          description="You’ve been idle for a while. For your security this session will end soon."
          icon={<IconBox icon={Clock} tone="warning" size="sm" />}
        />
        <DialogBody>
          <p className="text-[13px] text-muted">
            Signing out in <span className="tnum font-medium text-foreground">{Math.max(0, Math.ceil(remainingMs / 1000))}s</span>.
            Anything unsaved on this page is kept as a draft where the page supports it.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={expire}>Sign out now</Button>
          <Button variant="primary" onClick={extend}>Stay signed in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
