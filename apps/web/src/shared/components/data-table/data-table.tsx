import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { DataTableSkeleton } from "./data-table-skeleton"
import { DataTableViewOptions } from "./data-table-view-options"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  skeletonRowCount?: number
  // Server-side pagination
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  // Client/Controlled Sorting
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  manualSorting?: boolean
  // Column Visibility
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  showViewOptions?: boolean
  // Row Selection
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  // Row Click
  onRowClick?: (row: TData) => void
  // Empty State
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
  // Custom toolbar / headers
  toolbar?: (table: TanStackTable<TData>) => React.ReactNode
  // Styling
  className?: string
  containerClassName?: string
  density?: "compact" | "normal"
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  skeletonRowCount = 5,
  page,
  onPageChange,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  manualSorting = false,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: externalOnColumnVisibilityChange,
  showViewOptions = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  onRowClick,
  emptyTitle = "No se encontraron resultados",
  emptyDescription = "No hay registros disponibles para mostrar.",
  emptyIcon,
  emptyAction,
  toolbar,
  className,
  containerClassName,
  density = "normal",
}: DataTableProps<TData, TValue>) {
  "use no memo"

  // Internal state when not controlled
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const sorting = externalSorting ?? internalSorting
  const onSortingChange = externalOnSortingChange ?? setInternalSorting

  const columnVisibility = externalColumnVisibility ?? internalColumnVisibility
  const onColumnVisibilityChange = externalOnColumnVisibilityChange ?? setInternalColumnVisibility

  const rowSelection = externalRowSelection ?? internalRowSelection
  const onRowSelectionChange = externalOnRowSelectionChange ?? setInternalRowSelection

  const isServerPaged = !!page && !!onPageChange

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own internal reactivity and memoization
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    manualPagination: isServerPaged,
    manualSorting,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isServerPaged ? undefined : getPaginationRowModel(),
  })

  return (
    <div className={cn("flex flex-col gap-3", containerClassName)}>
      {(toolbar || showViewOptions) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            {toolbar?.(table)}
          </div>
          {showViewOptions && <DataTableViewOptions table={table} />}
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs",
          className
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className={cn(density === "compact" && "h-8 px-3 text-[11px]")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton
                columnCount={columns.length}
                rowCount={skeletonRowCount}
              />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/60"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={cn(density === "compact" && "py-1.5 px-3")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-36 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {isServerPaged && page ? (
          <Pagination page={page} onPageChange={onPageChange} />
        ) : null}
      </div>
    </div>
  )
}
