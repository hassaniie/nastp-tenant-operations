/**
 * progress — vendored from the shadcn/ui registry.
 *
 * Source: https://ui.shadcn.com/r/styles/new-york/progress.json
 * Installed from reui-registry/progress.json — do not edit by hand; re-install to update.
 *
 * Local adaptations (see styles/shadcn-compat.css):
 *   @/components/ui/* -> @/components/shadcn/*
 *   bg-muted -> bg-muted-surface (theme.css uses --color-muted as a text colour)
 */
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
