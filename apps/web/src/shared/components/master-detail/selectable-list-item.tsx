import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

type SelectableListItemProps = {
  active: boolean
  onSelect: () => void
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function SelectableListItem({
  active,
  onSelect,
  title,
  subtitle,
  actions,
}: SelectableListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-1 rounded-lg transition-colors",
        active ? "bg-muted text-foreground" : "hover:bg-muted/60",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 flex flex-col gap-0.5 px-3 py-2.5 text-left"
      >
        <span className="truncate text-sm font-medium">{title}</span>
        {subtitle}
      </button>
      {actions ? <div className="py-2 pr-2">{actions}</div> : null}
    </div>
  )
}
