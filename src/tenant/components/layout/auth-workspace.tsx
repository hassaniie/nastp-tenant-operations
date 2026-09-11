import { Moon, Sun, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tone } from '../../lib/meta';
import { cn } from '../../lib/utils';
import { IconBox } from '../ui/icon-box';
import { IconButton } from '../ui/button';
import { useSession } from '../../store/session';

export function AuthWorkspace({ eyebrow, title, description, icon, tone = 'primary', children, footer, className }: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const { prefs, setPrefs } = useSession();
  return (
    <main className={cn('ds-auth-workspace', className)}>
      <IconButton className="ds-auth-theme" variant="ghost" size="sm" label="Toggle theme" title={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`}
        onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}>
        {prefs.theme === 'dark' ? <Sun /> : <Moon />}
      </IconButton>
      <aside className="ds-auth-context">
        <div className="ds-auth-brand">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 25V7l20 18V7M6 16l20 9M6 7l20 9" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>
          <div><strong>NASTP<sup>®</sup></strong><span>Tenant operations</span></div>
        </div>
        <div className="ds-auth-context-copy">
          <p>Connected operations</p>
          <h2>One park.<br />One workspace.</h2>
          <span>Energy, visitors and service delivery in a single operational system.</span>
        </div>
        <small>National Aerospace Science & Technology Park</small>
      </aside>
      <section className="ds-auth-main">
        <div className="ds-auth-inner">
          <header className="ds-auth-header">
            <IconBox icon={icon} tone={tone} size="lg" />
            <div>
              <p>{eyebrow}</p>
              <h1>{title}</h1>
              {description && <div className="ds-auth-description">{description}</div>}
            </div>
          </header>
          {children}
          {footer && <footer className="ds-auth-footer">{footer}</footer>}
        </div>
      </section>
    </main>
  );
}

export function AuthPanel({ children, className, subtle = false }: { children: ReactNode; className?: string; subtle?: boolean }) {
  return <section className={cn('ds-auth-panel', subtle && 'is-subtle', className)}>{children}</section>;
}
