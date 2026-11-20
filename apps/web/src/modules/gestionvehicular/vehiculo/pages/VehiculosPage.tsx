import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CarFront,
  CheckCircle2,
  Filter,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { ActivoImagePreviewModal } from "@/modules/activos/activo/components/detalle-activo/modals/ActivoImagePreviewModal"
import { estadoOperativoQueries } from "@/modules/activos/estado-operativo/api/estado-operativo.queries"
import { flotaQueries } from "@/modules/gestionvehicular/flota-vehicular/api/flota.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { vehiculoQueries } from "../api/vehiculo.queries"
import type { VehiculoCatalogo } from "../api/vehiculo.types"
import { VehiculoListView } from "../components/VehiculoListView"
import { VehiculoTableView } from "../components/VehiculoTableView"
import {
  getAtributosVisibles,
  getVehiculoTituloDinamico,
} from "../lib/vehiculo-atributos.utils"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_VALUE = "__all__"
const VIEW_MODE_STORAGE_KEY = "sigma.gv.vehiculos.viewMode"

type StatusFilter = "all" | "active" | "inactive"
type ViewMode = "list" | "table"

function readStoredViewMode(): ViewMode {
  try {
    const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    return saved === "table" ? "table" : "list"
  } catch {
    return "list"
  }
}

export function VehiculosPage() {
  const [estadoOperativoId, setEstadoOperativoId] = useState<string>(ALL_VALUE)
  const [ubicacionId, setUbicacionId] = useState<string>(ALL_VALUE)
  const [flotaId, setFlotaId] = useState<string>(ALL_VALUE)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>(readStoredViewMode)
  const [previewVehiculo, setPreviewVehiculo] =
    useState<VehiculoCatalogo | null>(null)

  const search = usePaginatedSearch({
    resetKey: `${estadoOperativoId}-${ubicacionId}-${flotaId}-${statusFilter}`,
  })

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode)
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
    } catch {
      // Ignore storage quota / private mode issues
    }
  }

  const estadosQuery = useQuery(
    estadoOperativoQueries.list({
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
  const flotasQuery = useQuery(flotaQueries.activas())

  const estados = useMemo(
    () => estadosQuery.data?.content ?? [],
    [estadosQuery.data?.content],
  )
  const ubicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )
  const flotas = useMemo(() => flotasQuery.data ?? [], [flotasQuery.data])

  const queryParams = useMemo(() => {
    const activo =
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
          ? false
          : undefined

    return {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC" as const,
      ...(search.query ? { q: search.query } : {}),
      ...(estadoOperativoId !== ALL_VALUE ? { estadoOperativoId } : {}),
      ...(ubicacionId !== ALL_VALUE ? { ubicacionId } : {}),
      ...(flotaId !== ALL_VALUE ? { flotaId } : {}),
      ...(activo !== undefined ? { activo } : {}),
    }
  }, [
    search.page,
    search.query,
    estadoOperativoId,
    ubicacionId,
    flotaId,
    statusFilter,
  ])

  const vehiculosQuery = useQuery(vehiculoQueries.list(queryParams))
  const vehiculos = useMemo(
    () => vehiculosQuery.data?.content ?? [],
    [vehiculosQuery.data?.content],
  )

  useClampPage(search.page, search.setPage, vehiculosQuery.data?.totalPages)

  const summary = useMemo(() => {
    const total = vehiculosQuery.data?.totalElements ?? vehiculos.length
    const habilitados = vehiculos.filter((v) => v.activo !== false).length
    const conImagen = vehiculos.filter((v) => Boolean(v.urlImagen)).length
    const attrCount =
      vehiculos.length > 0 ? getAtributosVisibles(vehiculos[0]).length : 0
    return { total, habilitados, conImagen, attrCount }
  }, [vehiculos, vehiculosQuery.data?.totalElements])

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (estadoOperativoId !== ALL_VALUE) {
      const name =
        estados.find((e) => e.id === estadoOperativoId)?.nombre ?? "Estado"
      chips.push({
        key: "estado",
        label: `Estado: ${name}`,
        onRemove: () => {
          setEstadoOperativoId(ALL_VALUE)
          search.setPage(0)
        },
      })
    }

    if (flotaId !== ALL_VALUE) {
      const name = flotas.find((f) => f.id === flotaId)?.nombre ?? "Flota"
      chips.push({
        key: "flota",
        label: `Flota: ${name}`,
        onRemove: () => {
          setFlotaId(ALL_VALUE)
          search.setPage(0)
        },
      })
    }

    if (ubicacionId !== ALL_VALUE) {
      const name =
        ubicaciones.find((u) => u.id === ubicacionId)?.nombre ?? "Ubicación"
      chips.push({
        key: "ubicacion",
        label: `Ubicación: ${name}`,
        onRemove: () => {
          setUbicacionId(ALL_VALUE)
          search.setPage(0)
        },
      })
    }

    if (statusFilter !== "all") {
      chips.push({
        key: "status",
        label:
          statusFilter === "active"
            ? "Estado: Habilitados"
            : "Estado: Inactivos",
        onRemove: () => {
          setStatusFilter("all")
          search.setPage(0)
        },
      })
    }

    return chips
  }, [
    estadoOperativoId,
    estados,
    flotaId,
    flotas,
    ubicacionId,
    ubicaciones,
    statusFilter,
    search,
  ])

  const hasActiveFilters =
    search.search.trim().length > 0 || activeFilterChips.length > 0

  function handleResetFilters() {
    search.setSearch("")
    setEstadoOperativoId(ALL_VALUE)
    setUbicacionId(ALL_VALUE)
    setFlotaId(ALL_VALUE)
    setStatusFilter("all")
    search.setPage(0)
  }

  return (
    <PageShell
      size="full"
      padding="none"
      layout="auto"
      className="w-full space-y-4 pb-12"
    >
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-2xs">
            <CarFront className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                Parque Vehicular
              </h1>
              {vehiculosQuery.data ? (
                <Badge
                  variant="secondary"
                  className="font-mono text-[11px] font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                >
                  {summary.total}{" "}
                  {summary.total === 1 ? "vehículo" : "vehículos"}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Consulta de vehículos por placa, estado operativo, flotas y
              atributos técnicos visibles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented View Switcher */}
          <div
            role="group"
            aria-label="Modo de visualización"
            className="inline-flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 shadow-2xs"
          >
            <Button
              type="button"
              size="xs"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("list")}
              className="h-7 px-3 text-xs gap-1.5 rounded-lg cursor-pointer"
            >
              <List className="size-3.5" />
              <span>Lista</span>
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("table")}
              className="h-7 px-3 text-xs gap-1.5 rounded-lg cursor-pointer"
            >
              <Table2 className="size-3.5" />
              <span>Tabla</span>
            </Button>
          </div>

          <RefreshButton
            queries={[
              vehiculosQuery,
              estadosQuery,
              ubicacionesQuery,
              flotasQuery,
            ]}
            className="h-8"
          />
        </div>
      </header>

      {/* Filter Toolbar */}
      <section className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.search}
              onChange={(e) => search.setSearch(e.target.value)}
              placeholder="Buscar por placa, marca, modelo, color o atributo..."
              className="h-8.5 pl-8 pr-7 text-xs bg-background"
            />
            {search.search ? (
              <button
                type="button"
                onClick={() => search.setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* Estado Operativo */}
          <Select
            value={estadoOperativoId}
            onValueChange={(val) => {
              setEstadoOperativoId(val ?? ALL_VALUE)
              search.setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-auto min-w-[170px] px-3 text-xs bg-background">
              <SelectValue placeholder="Estado operativo">
                {estadoOperativoId === ALL_VALUE
                  ? "Todos los estados"
                  : (estados.find((e) => e.id === estadoOperativoId)?.nombre ??
                    "Estado operativo")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="w-auto min-w-[var(--anchor-width)] max-w-[340px]"
            >
              <SelectItem value={ALL_VALUE} className="text-xs">
                Todos los estados
              </SelectItem>
              {estados.map((est) => (
                <SelectItem key={est.id} value={est.id} className="text-xs">
                  {est.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Flota */}
          <Select
            value={flotaId}
            onValueChange={(val) => {
              setFlotaId(val ?? ALL_VALUE)
              search.setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-auto min-w-[165px] px-3 text-xs bg-background">
              <SelectValue placeholder="Flota">
                {flotaId === ALL_VALUE
                  ? "Todas las flotas"
                  : (flotas.find((f) => f.id === flotaId)?.nombre ?? "Flota")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="w-auto min-w-[var(--anchor-width)] max-w-[340px]"
            >
              <SelectItem value={ALL_VALUE} className="text-xs">
                Todas las flotas
              </SelectItem>
              {flotas.map((flota) => (
                <SelectItem key={flota.id} value={flota.id} className="text-xs">
                  {flota.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ubicación */}
          <Select
            value={ubicacionId}
            onValueChange={(val) => {
              setUbicacionId(val ?? ALL_VALUE)
              search.setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-auto min-w-[185px] px-3 text-xs bg-background">
              <SelectValue placeholder="Ubicación">
                {ubicacionId === ALL_VALUE
                  ? "Todas las ubicaciones"
                  : (ubicaciones.find((u) => u.id === ubicacionId)?.nombre ??
                    "Ubicación")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="w-auto min-w-[var(--anchor-width)] max-w-[360px]"
            >
              <SelectItem value={ALL_VALUE} className="text-xs">
                Todas las ubicaciones
              </SelectItem>
              {ubicaciones.map((ub) => (
                <SelectItem key={ub.id} value={ub.id} className="text-xs">
                  {ub.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Habilitación */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter((val as StatusFilter) ?? "all")
              search.setPage(0)
            }}
          >
            <SelectTrigger className="h-8.5 w-auto min-w-[135px] px-3 text-xs bg-background">
              <SelectValue placeholder="Habilitación">
                {statusFilter === "all"
                  ? "Alta y Baja"
                  : statusFilter === "active"
                    ? "Habilitados"
                    : "Inactivos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="w-auto min-w-[var(--anchor-width)]"
            >
              <SelectItem value="all" className="text-xs">
                Alta y Baja
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Habilitados
              </SelectItem>
              <SelectItem value="inactive" className="text-xs">
                Inactivos
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="h-8.5 px-2.5 text-xs gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Limpiar</span>
            </Button>
          ) : null}
        </div>

        {/* Active Filter Chips + Quick Stats Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilterChips.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                  <Filter className="size-3" />
                  Filtros:
                </span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors cursor-pointer"
                  >
                    <span>{chip.label}</span>
                    <X className="size-3" />
                  </button>
                ))}
              </>
            ) : (
              <span>
                Mostrando{" "}
                <strong className="text-foreground">{vehiculos.length}</strong>{" "}
                de <strong className="text-foreground">{summary.total}</strong>{" "}
                {summary.total === 1 ? "vehículo" : "vehículos"}
              </span>
            )}
          </div>

          {vehiculos.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>
                  <strong className="text-foreground">
                    {summary.habilitados}
                  </strong>{" "}
                  habilitados en vista
                </span>
              </span>
              {summary.attrCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <SlidersHorizontal className="size-3 text-cyan-600 dark:text-cyan-400" />
                  <span>
                    <strong className="text-foreground">
                      {summary.attrCount}
                    </strong>{" "}
                    atributos visibles
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* Content */}
      <section className="flex flex-col space-y-4">
        {vehiculosQuery.isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-32 rounded-2xl"
            className="space-y-3"
          />
        ) : vehiculosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(vehiculosQuery.error)}
            description="No se pudo obtener el listado de vehículos."
            className="text-destructive py-12"
          />
        ) : vehiculos.length === 0 ? (
          <EmptyState
            icon={<CarFront className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin vehículos para los filtros aplicados"
                : "No hay vehículos registrados"
            }
            description={
              hasActiveFilters
                ? "Intenta ajustar la búsqueda o limpiar los filtros activos."
                : "Aún no existen activos registrados bajo el tipo de activo Vehículo."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : undefined
            }
            className="py-12"
          />
        ) : (
          <>
            <div
              className={cn(
                "transition-opacity",
                vehiculosQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "list" ? (
                <VehiculoListView
                  vehiculos={vehiculos}
                  onPreviewImage={setPreviewVehiculo}
                />
              ) : (
                <VehiculoTableView
                  vehiculos={vehiculos}
                  onPreviewImage={setPreviewVehiculo}
                />
              )}
            </div>

            {vehiculosQuery.data ? (
              <Pagination
                page={vehiculosQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-3 bg-transparent"
              />
            ) : null}
          </>
        )}
      </section>

      {/* Image Preview Modal */}
      <ActivoImagePreviewModal
        open={Boolean(previewVehiculo)}
        onOpenChange={(open) => {
          if (!open) setPreviewVehiculo(null)
        }}
        imageUrl={previewVehiculo?.urlImagen}
        altText={
          previewVehiculo
            ? getVehiculoTituloDinamico(previewVehiculo)
            : "Vehículo"
        }
      />
    </PageShell>
  )
}
