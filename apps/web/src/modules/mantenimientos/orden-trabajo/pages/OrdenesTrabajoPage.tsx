import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  Plus,
  Search,
  Wrench,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteOrdenTrabajo } from "../api/orden-trabajo.mutations"
import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
import type { OrdenTrabajo } from "../api/orden-trabajo.service"
import { OrdenTrabajoDetailModal } from "../components/OrdenTrabajoDetailModal"
import { OrdenTrabajoFormDialog } from "../components/OrdenTrabajoFormDialog"
import { OrdenTrabajoListView } from "../components/OrdenTrabajoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function OrdenesTrabajoPage() {
  const search = usePaginatedSearch()
  const deleteMutation = useDeleteOrdenTrabajo()

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedOT, setSelectedOT] = useState<OrdenTrabajo | null>(null)
  const [formModal, setFormModal] = useState<{
    open: boolean
    ordenTrabajo?: OrdenTrabajo | null
  }>({ open: false })

  const ordenesQuery = useQuery(
    ordenTrabajoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      q: searchQuery || undefined,
    }),
  )

  const ordenes = useMemo(
    () => ordenesQuery.data?.content ?? [],
    [ordenesQuery.data?.content],
  )
  const totalCount = ordenesQuery.data?.totalElements ?? ordenes.length

  useClampPage(search.page, search.setPage, ordenesQuery.data?.totalPages)

  function handleDelete(id: string) {
    if (confirm("¿Estás seguro de que deseas eliminar esta orden de trabajo?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8.5 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs">
                <Wrench className="size-5" />
              </div>
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Órdenes de Trabajo
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {totalCount} OTs
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <Link to="/mantenimientos/ordenes-trabajo/nuevo">
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs font-semibold gap-1 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Nueva</span>
                </Button>
              </Link>
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => ordenesQuery.refetch()}
                isRefreshing={ordenesQuery.isFetching}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Administración, seguimiento técnico de actividades, evidencias y diagnóstico de órdenes de trabajo.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
          <Link to="/mantenimientos/ordenes-trabajo/nuevo">
            <Button
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nueva Orden de Trabajo</span>
            </Button>
          </Link>

          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            onRefresh={() => ordenesQuery.refetch()}
            isRefreshing={ordenesQuery.isFetching}
          />
        </div>
      </header>

      {/* Toolbar Search */}
      <div className="flex items-center justify-between gap-2 py-2 shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por OT, activo o responsable…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              search.setPage(0)
            }}
            className="h-8 pl-8 text-xs rounded-lg shadow-2xs"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-1">
        {ordenesQuery.isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-20 rounded-xl"
            className="space-y-2"
          />
        ) : ordenesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(ordenesQuery.error)}
            className="text-destructive"
          />
        ) : ordenes.length === 0 ? (
          <EmptyState
            icon={<Wrench className="size-9 text-sky-500" />}
            title="No hay órdenes de trabajo registradas"
            description={
              searchQuery
                ? "No se encontraron órdenes que coincidan con la búsqueda."
                : "Crea una nueva orden de trabajo para iniciar las actividades técnicas de mantenimiento."
            }
            action={
              <Link to="/mantenimientos/ordenes-trabajo/nuevo">
                <Button
                  size="sm"
                  className="text-xs font-semibold gap-1.5 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Crear Primera Orden</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-0.5",
                ordenesQuery.isFetching && "opacity-75",
              )}
            >
              <OrdenTrabajoListView
                ordenesTrabajo={ordenes}
                onQuickView={(ot) => setSelectedOT(ot)}
                onEdit={(ot) => setFormModal({ open: true, ordenTrabajo: ot })}
                onDelete={handleDelete}
              />
            </div>

            {ordenesQuery.data ? (
              <Pagination
                page={ordenesQuery.data}
                onPageChange={search.setPage}
                className="border-t pt-2 shrink-0 text-xs"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Modals */}
      <OrdenTrabajoDetailModal
        ordenTrabajo={selectedOT}
        open={Boolean(selectedOT)}
        onOpenChange={(open) => !open && setSelectedOT(null)}
        onUpdated={() => ordenesQuery.refetch()}
      />

      <OrdenTrabajoFormDialog
        open={formModal.open}
        onOpenChange={(open) => setFormModal((prev) => ({ ...prev, open }))}
        ordenTrabajo={formModal.ordenTrabajo}
        onSuccess={(savedOT) => {
          ordenesQuery.refetch()
          setSelectedOT(savedOT)
        }}
      />
    </PageShell>
  )
}
