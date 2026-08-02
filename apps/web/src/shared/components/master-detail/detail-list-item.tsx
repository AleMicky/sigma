import type { ReactNode } from "react"

type DetailListItemProps = {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}

export function DetailListItem({
  title,
  subtitle,
  meta,
  actions,
}: DetailListItemProps) {
  return (
    <div className="group flex items-start justify-between gap-2 rounded-lg px-2 py-2.5 hover:bg-muted/50 sm:items-center sm:gap-3 sm:px-3">
      <div className="min-w-0 flex flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{title}</span>
        {subtitle}
        {meta}
      </div>
      {actions}
    </div>
  )
}
