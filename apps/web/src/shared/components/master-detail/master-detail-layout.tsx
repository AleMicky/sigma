import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type MasterDetailLayoutProps = {
  title: string
  showMaster: boolean
  showDetail: boolean
  showBack?: boolean
  backLabel?: string
  onBack?: () => void
  headerAction?: ReactNode
  master: ReactNode
  detail: ReactNode
  children?: ReactNode
  /** true = panel fijo con scroll internos; false = crece con la página y usa el scroll principal */
  fill?: boolean
}

export function MasterDetailLayout({
  title,
  showMaster,
  showDetail,
  showBack = false,
  backLabel = "Volver",
  onBack,
  headerAction,
  master,
  detail,
  children,
  fill = true,
}: MasterDetailLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        fill ? "h-full min-h-0 overflow-hidden" : "w-full",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={backLabel}
              onClick={onBack}
            >
              <ArrowLeft />
            </Button>
          ) : null}
          <h1 className="truncate font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
        </div>
        {headerAction}
      </div>

      <div
        className={cn(
          "grid flex-1",
          fill ? "min-h-0 overflow-hidden" : "w-full",
          "md:grid-cols-[minmax(220px,32%)_1fr] lg:grid-cols-[minmax(260px,340px)_1fr]",
        )}
      >
        <div
          className={cn(
            "min-w-0 flex-col",
            fill ? "h-full min-h-0 overflow-hidden" : "w-full",
            showMaster ? "flex" : "hidden",
            "md:flex",
          )}
        >
          {master}
        </div>
        <div
          className={cn(
            "min-w-0 flex-col",
            fill ? "h-full min-h-0 overflow-hidden" : "w-full",
            showDetail ? "flex" : "hidden",
            "md:flex",
          )}
        >
          {detail}
        </div>
      </div>

      {children}
    </div>
  )
}
