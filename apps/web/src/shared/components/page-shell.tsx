import type { PropsWithChildren } from "react"

import { cn } from "@/shared/lib/utils"

export function PageShell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 md:px-10 md:py-10",
        className,
      )}
    >
      {children}
    </div>
  )
}
