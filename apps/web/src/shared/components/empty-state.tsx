import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center sm:p-8",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col gap-1 px-2">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="mx-auto max-w-64 text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
