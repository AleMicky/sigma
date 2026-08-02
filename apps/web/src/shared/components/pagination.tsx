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
        "flex items-center justify-between gap-3 border-t px-3 py-2",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        {from}–{to} de {page.totalElements}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Página anterior"
          disabled={page.first}
          onClick={() => onPageChange(page.page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-16 px-1 text-center text-xs text-muted-foreground">
          {currentDisplay} / {Math.max(page.totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
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
