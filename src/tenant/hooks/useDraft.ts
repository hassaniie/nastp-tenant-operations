/**
 * Persists a value to `sessionStorage` as it changes, and hands back whatever
 * was there on mount.
 *
 * Built for the case idle-expiry has to handle honestly: a tenant is most of
 * the way through a form when the session times out. Without this, an idle
 * sign-out is indistinguishable from losing the work. `sessionStorage` — not
 * `localStorage` — is deliberate: a draft should survive the redirect through
 * a login screen, not linger forever across unrelated visits.
 */

import { useEffect, useRef, useState, type SetStateAction } from 'react';

export function useDraft<T>(key: string, initial: T): [T, (v: SetStateAction<T>) => void, () => void] {
  const storageKey = `nastp-tenant-ops.draft.${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Avoid writing the untouched initial value straight back out on mount.
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* draft simply doesn't survive this tab — not fatal */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clear = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* nothing to clear */
    }
  };

  return [value, setValue, clear];
}
