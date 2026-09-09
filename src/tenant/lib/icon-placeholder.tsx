/**
 * Shim for the docs-only helper the shadcn registry components import.
 * Resolves the `lucide` prop to the real icon — lucide is this preset's
 * declared icon library, so nothing is substituted.
 */
import * as Lucide from 'lucide-react';
import type { ComponentType } from 'react';

export function IconPlaceholder({ lucide, ...props }: { lucide: string } & Record<string, unknown>) {
  const Icon = (Lucide as unknown as Record<string, ComponentType<Record<string, unknown>>>)[lucide] ?? Lucide.CircleIcon;
  return <Icon {...props} />;
}
