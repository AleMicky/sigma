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
        "flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-muted/15 px-4 py-2.5",
        className,
      )}
    >
      <p className="min-w-0 text-xs text-muted-foreground">
        Mostrando <span className="font-medium text-foreground">{from}–{to}</span> de{" "}
        <span className="font-medium text-foreground">{page.totalElements}</span> registros
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Página <span className="font-medium text-foreground">{currentDisplay}</span> de{" "}
          <span className="font-medium text-foreground">{Math.max(page.totalPages, 1)}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Página anterior"
            disabled={page.first}
            onClick={() => onPageChange(page.page - 1)}
            className="size-7 cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Página siguiente"
            disabled={page.last}
            onClick={() => onPageChange(page.page + 1)}
            className="size-7 cursor-pointer"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
