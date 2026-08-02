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
}: MasterDetailLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
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
          "grid min-h-0 flex-1 overflow-hidden",
          "md:grid-cols-[minmax(220px,32%)_1fr] lg:grid-cols-[minmax(260px,340px)_1fr]",
        )}
      >
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
            showMaster ? "flex" : "hidden",
            "md:flex",
          )}
        >
          {master}
        </div>
        <div
          className={cn(
            "h-full min-h-0 min-w-0 flex-col overflow-hidden",
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
