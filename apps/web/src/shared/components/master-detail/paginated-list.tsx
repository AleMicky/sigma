import type { ReactNode } from "react"
import { Plus } from "lucide-react"

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
  hasSearch?: boolean
  empty: EmptyConfig
  onPageChange: (page: number) => void
  skeletonRows?: number
  skeletonRowClassName?: string
  listClassName?: string
  children: (item: T) => ReactNode
  getKey: (item: T) => string
}

export function PaginatedList<T>({
  items,
  page,
  isLoading,
  isFetching = false,
  errorMessage,
  hasSearch = false,
  empty,
  onPageChange,
  skeletonRows,
  skeletonRowClassName,
  listClassName,
  children,
  getKey,
}: PaginatedListProps<T>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {isLoading ? (
        <ListSkeleton
          rows={skeletonRows}
          rowClassName={skeletonRowClassName}
        />
      ) : errorMessage ? (
        <EmptyState title={errorMessage} className="text-destructive" />
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
              "min-h-0 flex-1 overflow-y-auto overscroll-contain p-2",
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
