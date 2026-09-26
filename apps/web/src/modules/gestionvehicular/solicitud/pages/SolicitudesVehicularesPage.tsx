import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, RotateCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { tipoSolicitudVehicularQueries } from "@/modules/gestionvehicular/tipo-solicitud/api/tipo-solicitud.queries"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteSolicitudVehicular } from "../api/solicitud-vehicular.mutations"
import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"
import { SolicitudVehicularCardView } from "../components/SolicitudVehicularCardView"
import { SolicitudVehicularDetailDialog } from "../components/SolicitudVehicularDetailDialog"
import {
  SolicitudVehicularFilters,
  type SolicitudVehicularFilterState,
} from "../components/SolicitudVehicularFilters"
import { SolicitudVehicularHeader } from "../components/SolicitudVehicularHeader"
import { SolicitudVehicularKPIs } from "../components/SolicitudVehicularKPIs"
import { SolicitudVehicularTableView } from "../components/SolicitudVehicularTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type ViewMode = "table" | "grid"

export function SolicitudesVehicularesPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<SolicitudVehicular | null>(null)
  const [deleting, setDeleting] = useState<SolicitudVehicular | null>(null)

  // Filtros adicionales
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [tipoFilter, setTipoFilter] = useState<string | undefined>(undefined)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteSolicitudVehicular()

  // Cargar catálogo de tipos para filtros
  const tiposQuery = useQuery(
    tipoSolicitudVehicularQueries.list({ size: 100 })
  )
  const tiposList = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content]
  )

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      ...(search.query && { search: search.query }),
      ...(estadoFilter && { estado: estadoFilter }),
      ...(tipoFilter && { tipoSolicitudVehicularId: tipoFilter }),
    }),
    [search.page, search.query, estadoFilter, tipoFilter]
  )

  const solicitudesQuery = useQuery(
    solicitudVehicularQueries.list(queryParams)
  )

  // Consulta global en caché para métricas precisas
  const allSolicitudesQuery = useQuery({
    ...solicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })

  const solicitudesList = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content]
  )

  // Cálculo de KPIs
  const kpiStats = useMemo(() => {
    const list = allSolicitudesQuery.data?.content ?? solicitudesList
    const total = allSolicitudesQuery.data?.totalElements ?? list.length

    let pendientes = 0
    let aprobadas = 0
    let enCurso = 0

    for (const item of list) {
      const estado = (item.estado || "").toUpperCase()
      if (estado.includes("PENDIENTE")) pendientes++
      else if (estado.includes("APROBAD")) aprobadas++
      else if (estado.includes("CURSO") || estado.includes("PROCESO")) enCurso++
    }

    return { total, pendientes, aprobadas, enCurso }
  }, [allSolicitudesQuery.data, solicitudesList])

  useClampPage(search.page, search.setPage, solicitudesQuery.data?.totalPages)

  const openCreate = () => {
    navigate({ to: routes.gestionVehicular.nuevaSolicitud })
  }

  const openEdit = (solicitud: SolicitudVehicular) => {
    navigate({ to: routes.gestionVehicular.editarSolicitud(solicitud.id) })
  }

  const openView = (solicitud: SolicitudVehicular) => {
    setSelectedSolicitud(solicitud)
    setDetailOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Notificado en la mutación
    }
  }

  const handleFilterChange = (
    filters: Partial<SolicitudVehicularFilterState>
  ) => {
    if ("search" in filters) {
      search.setSearch(filters.search ?? "")
    }
    if ("estado" in filters) {
      setEstadoFilter(filters.estado)
      search.setPage(0)
    }
    if ("tipoSolicitudVehicularId" in filters) {
      setTipoFilter(filters.tipoSolicitudVehicularId)
      search.setPage(0)
    }
  }

  const resetFilters = () => {
    search.setSearch("")
    setEstadoFilter(undefined)
    setTipoFilter(undefined)
    search.setPage(0)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || estadoFilter || tipoFilter
  )

  return (
    <TooltipProvider>
      <div className="flex w-full flex-col gap-3.5 px-2 sm:px-4 pt-2 pb-6 max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <SolicitudVehicularHeader
          isRefreshing={solicitudesQuery.isFetching}
          onRefresh={() => {
            solicitudesQuery.refetch()
            allSolicitudesQuery.refetch()
          }}
          onCreate={openCreate}
        />

        {/* MÉTRICAS / KPIS */}
        <SolicitudVehicularKPIs
          stats={kpiStats}
          isLoading={allSolicitudesQuery.isPending && !allSolicitudesQuery.data}
        />

        {/* BANNER DE ERROR */}
        {solicitudesQuery.isError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <p className="font-medium">
                Ocurrió un error al cargar las solicitudes de vehículos.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => solicitudesQuery.refetch()}
              className="h-7 gap-1.5 rounded-md border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer"
            >
              <RotateCw className="size-3" />
              Reintentar
            </Button>
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL */}
        <div className="flex-1 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-xs backdrop-blur-sm flex flex-col transition-all">
          {/* BARRA DE FILTROS */}
          <SolicitudVehicularFilters
            filters={{
              search: search.search,
              estado: estadoFilter,
              tipoSolicitudVehicularId: tipoFilter,
            }}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            tiposList={tiposList}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* VISTA (TABLA O TARJETAS) */}
          <div className="flex-1 min-h-0">
            {viewMode === "grid" ? (
              <SolicitudVehicularCardView
                data={solicitudesList}
                isLoading={solicitudesQuery.isLoading}
                hasFilters={hasActiveFilters}
                onResetFilters={resetFilters}
                onCreate={openCreate}
                onView={openView}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ) : (
              <SolicitudVehicularTableView
                data={solicitudesList}
                isLoading={solicitudesQuery.isLoading}
                hasFilters={hasActiveFilters}
                onResetFilters={resetFilters}
                onCreate={openCreate}
                onView={openView}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            )}
          </div>

          {/* PAGINACIÓN */}
          {solicitudesQuery.data && (
            <Pagination
              page={solicitudesQuery.data}
              onPageChange={search.setPage}
            />
          )}
        </div>

        {/* DIÁLOGO DETALLE */}
        <SolicitudVehicularDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          solicitud={selectedSolicitud}
          onEdit={openEdit}
        />

        {/* DIÁLOGO CONFIRMAR ELIMINACIÓN */}
        <ConfirmDeleteDialog
          open={Boolean(deleting)}
          onOpenChange={(open) => !open && setDeleting(null)}
          title="¿Eliminar Solicitud Vehicular?"
          description={`¿Estás seguro de eliminar la solicitud "${deleting?.numero}"? Esta acción no se puede deshacer y eliminará los respaldos adjuntos asociados.`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      </div>
    </TooltipProvider>
  )
}
