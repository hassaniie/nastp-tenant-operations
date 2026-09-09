/**
 * separator — vendored from the shadcn/ui registry.
 *
 * Source: https://ui.shadcn.com/r/styles/new-york/separator.json
 * Installed from reui-registry/separator.json — do not edit by hand; re-install to update.
 *
 * Local adaptations (see styles/shadcn-compat.css):
 *   @/components/ui/* -> @/components/shadcn/*
 *   bg-muted -> bg-muted-surface (theme.css uses --color-muted as a text colour)
 */
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
