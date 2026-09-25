import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
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
  const [selectedCategoria, setSelectedCategoria] = useState<string>("")
  const [selectedEstado, setSelectedEstado] = useState<string>("")

  const search = usePaginatedSearch({
    resetKey: `${selectedCategoria}-${selectedEstado}`,
  })
  const deleteMutation = useDeleteConductor()

  const queryParams = {
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESC" as const,
    ...(search.query ? { search: search.query } : {}),
    ...(selectedCategoria ? { categoria: selectedCategoria } : {}),
    ...(selectedEstado === "ACTIVO"
      ? { activo: true }
      : selectedEstado === "INACTIVO"
      ? { activo: false }
      : {}),
  }

  const conductoresQuery = useQuery(conductorQueries.list(queryParams))
  const conductores = conductoresQuery.data?.content ?? []

  // Global query for KPIs calculation
  const allConductoresQuery = useQuery(
    conductorQueries.list({ size: 1000 })
  )

  const kpiStats = useMemo(() => {
    const list = allConductoresQuery.data?.content ?? conductores
    const total = allConductoresQuery.data?.totalElements ?? list.length
    let activos = 0
    let porVencer = 0
    let vencidas = 0

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    for (const c of list) {
      if (c.activo) activos++
      if (c.fechaVencimiento) {
        const vencimiento = new Date(c.fechaVencimiento)
        const diffDays = Math.ceil(
          (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (diffDays < 0) {
          vencidas++
        } else if (diffDays <= 30) {
          porVencer++
        }
      }
    }

    return { total, activos, porVencer, vencidas }
  }, [allConductoresQuery.data, conductores])

  useClampPage(
    search.page,
    search.setPage,
    conductoresQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(conductor: Conductor) {
    setEditing(conductor)
    setDialogOpen(true)
  }

  async function handleDelete() {
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

  function resetFilters() {
    search.setSearch("")
    setSelectedCategoria("")
    setSelectedEstado("")
  }

  const emptyTitle = hasActiveFilters
    ? "No se encontraron conductores"
    : "No hay conductores registrados"
  const emptyDescription = hasActiveFilters
    ? "No hay resultados que coincidan con los filtros seleccionados."
    : "Registra conductores autorizados para gestionar la flota vehicular."
  const emptyIcon = (
    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
      <Car className="size-8" />
    </div>
  )
  const emptyAction = !hasActiveFilters && (
    <Button onClick={openCreate} className="mt-4 gap-2">
      <Plus className="size-4" />
      Registrar Conductor
    </Button>
  )

  return (
    <div className="flex w-full flex-col gap-4 px-2 pt-2 pb-6">
      {/* HEADER */}
      <ConductoresHeader
        isRefreshing={conductoresQuery.isFetching}
        onRefresh={() => {
          conductoresQuery.refetch()
          allConductoresQuery.refetch()
        }}
        onOpenCreate={openCreate}
      />

      {/* KPI METRICS (INTERACTIVE) */}
      <ConductorKPIs
        totalCount={kpiStats.total}
        activosCount={kpiStats.activos}
        porVencerCount={kpiStats.porVencer}
        vencidasCount={kpiStats.vencidas}
        isLoading={allConductoresQuery.isFetching && !allConductoresQuery.data}
        selectedEstado={selectedEstado}
        onSelectEstado={setSelectedEstado}
      />

      {/* UNIFIED CONTAINER */}
      <div className="flex-1 w-full overflow-hidden rounded-2xl border border-border/80 bg-card/75 shadow-xs">
        {/* Integrated Toolbar */}
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

        {/* Content Area */}
        {viewMode === "grid" ? (
          <div className="p-4">
            <ConductorCardView
              conductores={conductores}
              isLoading={conductoresQuery.isFetching}
              page={conductoresQuery.data}
              onPageChange={search.setPage}
              onEdit={openEdit}
              onDelete={setDeleting}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              emptyIcon={emptyIcon}
              emptyAction={emptyAction}
            />
          </div>
        ) : (
          <ConductorTableView
            conductores={conductores}
            isLoading={conductoresQuery.isFetching}
            page={conductoresQuery.data}
            onPageChange={search.setPage}
            onEdit={openEdit}
            onDelete={setDeleting}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyIcon={emptyIcon}
            emptyAction={emptyAction}
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
