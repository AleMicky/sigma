import * as React from "react"
import { cn } from "@/shared/lib/utils"

export type WorkflowListViewProps = {
  children: React.ReactNode
  className?: string
}

export function WorkflowListView({
  children,
  className,
}: WorkflowListViewProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs",
        className,
      )}
    >
      <ul className="divide-y divide-border/50">{children}</ul>
    </div>
  )
}
