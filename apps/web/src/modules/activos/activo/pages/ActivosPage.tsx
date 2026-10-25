import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Package,
  Plus,
  PowerOff,
  RotateCcw,
  Wrench,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"
import type { Activo } from "../api/activo.service"
import { ActivoFilterToolbar, type StatusFilter } from "../components/ActivoFilterToolbar"
import { ActivoGridView } from "../components/ActivoGridView"
import { ActivoHeader } from "../components/ActivoHeader"
import { ActivoListView } from "../components/ActivoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

export function ActivosPage() {
  const navigate = useNavigate()
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const search = usePaginatedSearch({ resetKey: `${tipoActivoId}-${statusFilter}` })

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tipos = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content],
  )
  const tiposById = useMemo(
    () => new Map(tipos.map((tipo) => [tipo.id, tipo])),
    [tipos],
  )
  const ubicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )
  const ubicacionesById = useMemo(
    () => new Map(ubicaciones.map((u) => [u.id, u])),
    [ubicaciones],
  )

  const activoParam =
    statusFilter === "active"
      ? true
      : statusFilter === "inactive"
        ? false
        : undefined

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(tipoActivoId !== ALL_TIPOS ? { tipoActivoId } : {}),
      ...(activoParam !== undefined ? { activo: activoParam } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const kpiStats = useMemo(() => {
    const total = activosQuery.data?.totalElements ?? activos.length
    const deBaja = activos.filter((a) => a.activo === false).length
    const enMantenimiento = activos.filter((a) =>
      a.estadoOperativo?.nombre?.toLowerCase().includes("mantenimiento"),
    ).length
    const operativos = activos.filter((a) => {
      const nombre = a.estadoOperativo?.nombre?.toLowerCase() || ""
      return (
        nombre.includes("operativo") ||
        (!nombre.includes("mantenimiento") && a.activo !== false)
      )
    }).length

    return { total, deBaja, enMantenimiento, operativos }
  }, [activosQuery.data?.totalElements, activos])

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  function goCreate() {
    void navigate({
      to: "/activos/nuevo",
      search: {
        tipoActivoId:
          tipoActivoId !== ALL_TIPOS
            ? tipoActivoId
            : undefined,
      },
    })
  }

  function goEdit(activo: Activo) {
    void navigate({
      to: "/activos/$activoId/editar",
      params: { activoId: activo.id },
    })
  }

  function resetFilters() {
    search.setSearch("")
    setTipoActivoId(ALL_TIPOS)
    setStatusFilter("all")
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    statusFilter !== "all"

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Header */}
      <ActivoHeader
        totalActivos={activosQuery.data?.totalElements}
        onCreate={goCreate}
        queries={[activosQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              Total Activos
            </p>
            <p className="text-xl font-bold font-heading text-foreground">
              {kpiStats.total}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              Operativos
            </p>
            <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
              {kpiStats.operativos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Wrench className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              En Mantenimiento
            </p>
            <p className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400">
              {kpiStats.enMantenimiento}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <PowerOff className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              De Baja
            </p>
            <p className="text-xl font-bold font-heading text-muted-foreground">
              {kpiStats.deBaja}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar with Status Tabs & View Switcher */}
      <ActivoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={(val) => {
          setTipoActivoId(val)
          search.setPage(0)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st)
          search.setPage(0)
        }}
        tipos={tipos}
        tiposById={tiposById}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex flex-col pt-1">
        {activosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-2xl"
            className="p-0 space-y-3"
          />
        ) : activosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(activosQuery.error)}
            className="text-destructive py-12"
          />
        ) : activos.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para la búsqueda"
                : "No hay activos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los filtros seleccionados o el estado (Alta / Baja)."
                : "Comienza a registrar tu inventario creando el primer activo."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={goCreate}>
                  <Plus className="size-4" />
                  Nuevo Activo
                </Button>
              )
            }
            className="py-12"
          />
        ) : (
          <div className="flex flex-col space-y-4">
            <div
              className={cn(
                activosQuery.isFetching && "opacity-75 transition-opacity",
              )}
            >
              {viewMode === "list" ? (
                <ActivoListView
                  activos={activos}
                  tiposById={tiposById}
                  ubicacionesById={ubicacionesById}
                  onEdit={goEdit}
                />
              ) : (
                <ActivoGridView
                  activos={activos}
                  tiposById={tiposById}
                  ubicacionesById={ubicacionesById}
                  onEdit={goEdit}
                />
              )}
            </div>

            {activosQuery.data ? (
              <Pagination
                page={activosQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-3 bg-transparent"
              />
            ) : null}
          </div>
        )}
      </div>
    </PageShell>
  )
}
