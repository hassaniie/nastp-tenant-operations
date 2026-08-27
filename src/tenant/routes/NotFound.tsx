/**
 * The catch-all.
 *
 * Previously an unmatched URL silently redirected to the admin dashboard,
 * which quietly swallowed typos and stale links and made them look like the
 * product working. It now says what happened and offers the three doors.
 */

import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { IconBox } from '../components/ui/primitives';
import { Card } from '../components/ui/card';
import { useAuth } from '../store/auth';
import { doorFor, homeFor } from '../data/auth';
import type { Experience } from '../data/types';

const LABEL: Record<Experience, string> = {
  admin: 'NASTP Administration',
  portal: 'Tenant Portal',
  tech: 'Technician workspace',
};

export default function NotFound() {
  const { session } = useAuth();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas p-5">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-5 text-center">
        <IconBox icon={Compass} tone="neutral" size="lg" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">This page does not exist</h1>
          <p className="text-[13px] text-muted">
            The link may be out of date, or the address mistyped.
          </p>
        </div>

        <Card className="flex w-full flex-col gap-1 p-3">
          {session ? (
            <Link
              to={homeFor(session.experience)}
              className="rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-surface-raised"
            >
              Back to {LABEL[session.experience]}
            </Link>
          ) : (
            (['admin', 'portal', 'tech'] as Experience[]).map((exp) => (
              <Link
                key={exp}
                to={doorFor(exp)}
                className="rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-surface-raised"
              >
                Sign in — {LABEL[exp]}
              </Link>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
