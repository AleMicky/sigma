import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

type DetailListItemProps = {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  /** Color de acento (hex) para la línea lateral izquierda. */
  accentColor?: string | null
  className?: string
}

export function DetailListItem({
  leading,
  title,
  subtitle,
  meta,
  actions,
  accentColor,
  className,
}: DetailListItemProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start justify-between gap-2 rounded-lg px-2 py-2.5 hover:bg-muted/50 sm:items-center sm:gap-3 sm:px-3",
        accentColor && "pl-3.5 sm:pl-4",
        className,
      )}
    >
      {accentColor ? (
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-1 w-1 rounded-full sm:left-1.5"
          style={{ backgroundColor: accentColor }}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        {leading}
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{title}</span>
          {subtitle}
          {meta}
        </div>
      </div>
      {actions}
    </div>
  )
}
