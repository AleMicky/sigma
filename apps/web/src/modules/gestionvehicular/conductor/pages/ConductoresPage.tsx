import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteConductor } from "../api/conductor.mutations"
import { conductorQueries } from "../api/conductor.queries"
import type { Conductor } from "../api/conductor.service"
import { ConductorCardView } from "../components/ConductorCardView"
import { ConductorFormDialog } from "../components/ConductorFormDialog"
import { ConductoresFilters, type ViewMode } from "../components/ConductoresFilters"
import { ConductoresHeader } from "../components/ConductoresHeader"
import { ConductorKPIs } from "../components/ConductorKPIs"
import { ConductorTableView } from "../components/ConductorTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ConductoresPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Conductor | null>(null)
  const [deleting, setDeleting] = useState<Conductor | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState("")
  const [selectedEstado, setSelectedEstado] = useState("")

  const search = usePaginatedSearch({
    resetKey: `${selectedCategoria}-${selectedEstado}`,
  })
  const deleteMutation = useDeleteConductor()

  const queryParams = {
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESC" as const,
    ...(search.query && { search: search.query }),
    ...(selectedCategoria && { categoria: selectedCategoria }),
    ...(selectedEstado && { activo: selectedEstado === "ACTIVO" }),
  }

  const conductoresQuery = useQuery(conductorQueries.list(queryParams))
  const allConductoresQuery = useQuery(conductorQueries.list({ size: 1000 }))

  const conductores = conductoresQuery.data?.content ?? []

  const kpiStats = useMemo(() => {
    const list = allConductoresQuery.data?.content ?? conductores
    const total = allConductoresQuery.data?.totalElements ?? list.length
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    let activos = 0
    let porVencer = 0
    let vencidas = 0

    for (const c of list) {
      if (c.activo) activos++
      if (c.fechaVencimiento) {
        const diffDays = Math.ceil(
          (new Date(c.fechaVencimiento).getTime() - hoy.getTime()) / 86_400_000
        )
        if (diffDays < 0) vencidas++
        else if (diffDays <= 30) porVencer++
      }
    }
    return { total, activos, porVencer, vencidas }
  }, [allConductoresQuery.data, conductores])

  useClampPage(search.page, search.setPage, conductoresQuery.data?.totalPages)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (conductor: Conductor) => {
    setEditing(conductor)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled in mutation
    }
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || selectedCategoria || selectedEstado
  )

  const resetFilters = () => {
    search.setSearch("")
    setSelectedCategoria("")
    setSelectedEstado("")
  }

  const viewProps = {
    conductores,
    isLoading: conductoresQuery.isFetching,
    page: conductoresQuery.data,
    onPageChange: search.setPage,
    onEdit: openEdit,
    onDelete: setDeleting,
    emptyTitle: hasActiveFilters
      ? "No se encontraron conductores"
      : "No hay conductores registrados",
    emptyDescription: hasActiveFilters
      ? "No hay resultados que coincidan con los filtros seleccionados."
      : "Registra conductores autorizados para gestionar la flota vehicular.",
    emptyIcon: (
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary/70 shadow-2xs">
        <Car className="size-6" />
      </div>
    ),
    emptyAction: !hasActiveFilters && (
      <Button onClick={openCreate} size="sm" className="mt-3 gap-1.5 rounded-lg text-xs font-semibold">
        <Plus className="size-3.5" />
        Registrar Conductor
      </Button>
    ),
  }

  return (
    <div className="flex w-full flex-col gap-3 px-1 sm:px-2 pt-1 pb-4">
      {/* HEADER */}
      <ConductoresHeader
        isRefreshing={conductoresQuery.isFetching}
        onRefresh={() => {
          conductoresQuery.refetch()
          allConductoresQuery.refetch()
        }}
        onOpenCreate={openCreate}
      />

      {/* COMPACT KPI METRICS */}
      <ConductorKPIs
        totalCount={kpiStats.total}
        activosCount={kpiStats.activos}
        porVencerCount={kpiStats.porVencer}
        vencidasCount={kpiStats.vencidas}
        isLoading={allConductoresQuery.isFetching && !allConductoresQuery.data}
      />

      {/* UNIFIED CONTAINER */}
      <div className="flex-1 w-full overflow-hidden rounded-xl border border-border/70 bg-card/75 shadow-2xs flex flex-col">
        <ConductoresFilters
          search={search.search}
          setSearch={search.setSearch}
          categoria={selectedCategoria}
          setCategoria={setSelectedCategoria}
          estado={selectedEstado}
          setEstado={setSelectedEstado}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="flex-1 min-h-0">
          {viewMode === "grid" ? (
            <div className="p-3">
              <ConductorCardView {...viewProps} />
            </div>
          ) : (
            <ConductorTableView {...viewProps} />
          )}
        </div>

        {/* PAGINACIÓN UNIFICADA AL FINAL */}
        {conductoresQuery.data && conductores.length > 0 && (
          <Pagination
            page={conductoresQuery.data}
            onPageChange={search.setPage}
          />
        )}
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <ConductorFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          conductor={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar conductor"
          description={`¿Estás seguro de que deseas eliminar al conductor con licencia "${deleting.numeroLicencia}" (${deleting.empleado?.nombreCompleto || "Empleado asignado"})?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

