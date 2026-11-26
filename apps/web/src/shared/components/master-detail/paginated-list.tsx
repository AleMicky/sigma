import type { ReactNode } from "react"
import { AlertCircle, Plus, RotateCcw } from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

type EmptyConfig = {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  searchTitle?: string
  searchDescription?: string
}

type PaginatedListProps<T> = {
  items: T[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  isLoading: boolean
  isFetching?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  hasSearch?: boolean
  empty: EmptyConfig
  onPageChange: (page: number) => void
  skeletonRows?: number
  skeletonRowClassName?: string
  listClassName?: string
  children: (item: T) => ReactNode
  getKey: (item: T) => string
  /** true = lista con scroll propio; false = crece con la página y usa el scroll principal */
  fill?: boolean
}

export function PaginatedList<T>({
  items,
  page,
  isLoading,
  isFetching = false,
  errorMessage,
  onRetry,
  hasSearch = false,
  empty,
  onPageChange,
  skeletonRows,
  skeletonRowClassName,
  listClassName,
  children,
  getKey,
  fill = true,
}: PaginatedListProps<T>) {
  return (
    <div
      className={cn("flex flex-1 flex-col", fill && "min-h-0 overflow-hidden")}
    >
      {isLoading ? (
        <ListSkeleton
          rows={skeletonRows}
          rowClassName={skeletonRowClassName}
        />
      ) : errorMessage ? (
        <div role="alert" className="text-destructive">
          <EmptyState
            icon={<AlertCircle className="size-8 text-destructive/70" />}
            title="No se pudieron cargar los datos"
            description={errorMessage}
            action={
              onRetry ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RotateCcw className="size-4" />
                  Reintentar
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          title={
            hasSearch ? (empty.searchTitle ?? "Sin resultados") : empty.title
          }
          description={
            hasSearch
              ? (empty.searchDescription ??
                "Prueba con otro término de búsqueda.")
              : empty.description
          }
          action={
            !hasSearch && empty.onAction ? (
              <Button size="sm" type="button" onClick={empty.onAction}>
                <Plus />
                {empty.actionLabel ?? "Crear"}
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <ul
            className={cn(
              "flex-1 p-2",
              fill && "min-h-0 overflow-y-auto overscroll-contain",
              isFetching && "opacity-70",
              listClassName,
            )}
          >
            {items.map((item) => (
              <li key={getKey(item)}>{children(item)}</li>
            ))}
          </ul>
          {page ? (
            <Pagination
              page={page}
              onPageChange={onPageChange}
              className="shrink-0"
            />
          ) : null}
        </>
      )}
    </div>
  )
}
