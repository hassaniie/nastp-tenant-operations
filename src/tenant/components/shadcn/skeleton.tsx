/**
 * skeleton — vendored from the shadcn/ui registry.
 *
 * Source: https://ui.shadcn.com/r/styles/new-york/skeleton.json
 * Installed from reui-registry/skeleton.json — do not edit by hand; re-install to update.
 *
 * Local adaptations (see styles/shadcn-compat.css):
 *   @/components/ui/* -> @/components/shadcn/*
 *   bg-muted -> bg-muted-surface (theme.css uses --color-muted as a text colour)
 */
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
