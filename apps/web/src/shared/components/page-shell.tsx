import type { PropsWithChildren } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const pageShellVariants = cva("mx-auto w-full flex flex-col transition-all", {
  variants: {
    size: {
      sm: "max-w-3xl",
      md: "max-w-4xl",
      lg: "max-w-5xl",
      xl: "max-w-7xl",
      full: "max-w-none",
    },
    padding: {
      none: "p-0",
      compact: "px-4 py-2.5 sm:px-6 sm:py-3 md:px-8",
      default: "px-4 py-4 sm:px-6 sm:py-6 md:px-8",
      relaxed: "px-6 py-6 md:px-10 md:py-8",
    },
    layout: {
      fill: "h-full min-h-0 flex-1 overflow-hidden",
      scroll: "min-h-full flex-1 overflow-y-auto",
      auto: "flex-1",
    },
  },
  defaultVariants: {
    size: "xl",
    padding: "compact",
    layout: "fill",
  },
})

export type PageShellProps = PropsWithChildren<
  VariantProps<typeof pageShellVariants> & {
    className?: string
  }
>

export function PageShell({
  children,
  size,
  padding,
  layout,
  className,
}: PageShellProps) {
  return (
    <div className={cn(pageShellVariants({ size, padding, layout }), className)}>
      {children}
    </div>
  )
}
