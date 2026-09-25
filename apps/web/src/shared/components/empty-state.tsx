import type { ReactNode } from "react"
import { FolderSearch } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  bordered?: boolean
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  bordered = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3.5 p-6 text-center sm:p-10 select-none",
        bordered && "rounded-xl border border-dashed border-border/80 bg-muted/10",
        className,
      )}
    >
      <div className="relative flex size-12 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground ring-1 ring-border/60 shadow-inner">
        {icon || <FolderSearch className="size-5.5 text-muted-foreground/80" />}
      </div>
      <div className="flex flex-col gap-1 px-4 max-w-md">
        <p className="text-sm font-semibold text-foreground tracking-tight">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
