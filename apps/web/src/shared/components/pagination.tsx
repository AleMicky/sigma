import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

type PaginationProps = {
  page: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  onPageChange,
  className,
}: PaginationProps) {
  if (page.totalElements === 0) {
    return null
  }

  const from = page.page * page.size + 1
  const to = Math.min((page.page + 1) * page.size, page.totalElements)
  const currentDisplay = page.page + 1

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t px-2 py-2 sm:gap-3 sm:px-3",
        className,
      )}
    >
      <p className="min-w-0 text-[11px] text-muted-foreground sm:text-xs">
        <span className="sm:hidden">
          {currentDisplay}/{Math.max(page.totalPages, 1)} · {page.totalElements}
        </span>
        <span className="hidden sm:inline">
          {from}–{to} de {page.totalElements}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          aria-label="Página anterior"
          disabled={page.first}
          onClick={() => onPageChange(page.page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="hidden min-w-16 px-1 text-center text-xs text-muted-foreground sm:inline">
          {currentDisplay} / {Math.max(page.totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          aria-label="Página siguiente"
          disabled={page.last}
          onClick={() => onPageChange(page.page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
