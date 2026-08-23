import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Calendar,
  Clock,
  Eye,
  FileCheck2,
  Flame,
  Paperclip,
  ShieldCheck,
  User,
  UserCheck,
  Wrench,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
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
import { formatDate } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import { SolicitudQuickViewSheet } from "../components/SolicitudQuickViewSheet"
import {
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const navigate = useNavigate()
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>("all")
  const [quickView, setQuickView] = useState<SolicitudMantenimiento | null>(null)

  const search = usePaginatedSearch()

  // Solicitudes en estado 'solicitado' (pendientes de aprobación)
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      estado: "solicitado",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const solicitudes = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  // Filtrado local por prioridad si se selecciona
  const filteredSolicitudes = useMemo(() => {
    if (!selectedPrioridad || selectedPrioridad === "all") {
      return solicitudes
    }
    const nivel = parseInt(selectedPrioridad, 10)
    return solicitudes.filter((s) => (s.prioridad?.nivel ?? 1) === nivel)
  }, [solicitudes, selectedPrioridad])

  // KPIs de la bandeja de aprobaciones
  const totalPendientes = solicitudesQuery.data?.totalElements ?? solicitudes.length

  const criticasCount = useMemo(
    () => solicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4).length,
    [solicitudes],
  )

  const preventivasCount = useMemo(
    () =>
      solicitudes.filter((s) =>
        (s.tipoMantenimiento?.nombre ?? "")
          .toLowerCase()
          .includes("preventiv"),
      ).length,
    [solicitudes],
  )

  const correctivasCount = useMemo(
    () =>
      solicitudes.filter((s) =>
        (s.tipoMantenimiento?.nombre ?? "")
          .toLowerCase()
          .includes("correctiv"),
      ).length,
    [solicitudes],
  )

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function openEdit(solicitud: SolicitudMantenimiento) {
    navigate({
      to: routes.mantenimientos.editarSolicitud(solicitud.id),
    })
  }

  const hasActiveFilters = Boolean(
    search.search.trim() ||
      (selectedPrioridad && selectedPrioridad !== "all"),
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedPrioridad("all")
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="size-4.5" />
              </div>
              <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                Bandeja de Aprobaciones
              </h1>
              {totalPendientes > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {totalPendientes} pendientes
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => solicitudesQuery.refetch()}
                isRefreshing={solicitudesQuery.isFetching}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Supervisa, analiza y gestiona las solicitudes de mantenimiento pendientes de validación y aprobación.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => solicitudesQuery.refetch()}
            isRefreshing={solicitudesQuery.isFetching}
          />
        </div>
      </header>

      {/* KPI Stats Section for Approvers */}
      <div className="shrink-0 pt-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Total Pendientes */}
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 sm:p-3 shadow-2xs">
            <div className="relative flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <UserCheck className="size-4" />
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 truncate">
                Por Aprobar
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-amber-700 dark:text-amber-300">
                {totalPendientes}
              </p>
            </div>
          </div>

          {/* Críticas / Urgentes */}
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 p-2.5 sm:p-3 shadow-2xs">
            <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-2xs">
              <Flame className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Alta / Crítica
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {criticasCount}
              </p>
            </div>
          </div>

          {/* Preventivas */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 sm:p-3 shadow-2xs">
            <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Preventivas
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {preventivasCount}
              </p>
            </div>
          </div>

          {/* Correctivas */}
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-2.5 sm:p-3 shadow-2xs">
            <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Wrench className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Correctivas
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {correctivasCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 pt-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="w-full sm:w-80">
            <SearchField
              placeholder="Buscar por título, número, activo o solicitante..."
              value={search.search}
              onChange={search.setSearch}
              className="w-full h-9 text-xs"
            />
          </div>

          <div className="w-48">
            <Select
              value={selectedPrioridad}
              onValueChange={(val) => setSelectedPrioridad(val ?? "all")}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Todas las prioridades
                </SelectItem>
                <SelectItem value="5" className="text-xs text-rose-600">
                  🔴 Crítica (Nivel 5)
                </SelectItem>
                <SelectItem value="4" className="text-xs text-orange-600">
                  🟠 Alta (Nivel 4)
                </SelectItem>
                <SelectItem value="3" className="text-xs text-amber-600">
                  🟡 Media (Nivel 3)
                </SelectItem>
                <SelectItem value="2" className="text-xs text-blue-600">
                  🔵 Baja (Nivel 2)
                </SelectItem>
                <SelectItem value="1" className="text-xs text-emerald-600">
                  🟢 Menor (Nivel 1)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters ? (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={resetFilters}
              className="h-9 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="size-3.5" />
              <span>Limpiar filtros</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {solicitudesQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-44 rounded-2xl"
            className="grid grid-cols-1 gap-3.5 p-0.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          />
        ) : solicitudesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(solicitudesQuery.error)}
            className="text-destructive"
          />
        ) : filteredSolicitudes.length === 0 ? (
          <EmptyState
            icon={<FileCheck2 className="size-8 text-amber-500" />}
            title={
              hasActiveFilters
                ? "Sin resultados para este filtro"
                : "¡Bandeja de Aprobaciones al día!"
            }
            description={
              hasActiveFilters
                ? "No se encontraron solicitudes pendientes con los criterios especificados."
                : "No hay solicitudes de mantenimiento pendientes de aprobación en este momento."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  type="button"
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => solicitudesQuery.refetch()}
                  className="h-8 text-xs gap-1.5"
                >
                  <RefreshButton
                    size="sm"
                    className="h-6 px-1"
                    onRefresh={() => solicitudesQuery.refetch()}
                    isRefreshing={solicitudesQuery.isFetching}
                  />
                  <span>Actualizar Bandeja</span>
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                solicitudesQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3.5 p-0.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredSolicitudes.map((item) => {
                  const prioridadStyle = getPrioridadBadgeStyles(
                    item.prioridad?.nivel ?? 1,
                  )
                  const adjuntosCount = item.adjuntos?.length ?? 0
                  const isCritica = (item.prioridad?.nivel ?? 1) >= 4

                  return (
                    <li
                      key={item.id}
                      onClick={() => setQuickView(item)}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border bg-card p-4 text-card-foreground shadow-2xs transition-all cursor-pointer overflow-hidden hover:shadow-md",
                        isCritica
                          ? "border-rose-500/40 hover:border-rose-500/80 bg-rose-500/[0.02]"
                          : "border-amber-500/40 hover:border-amber-500/80 bg-amber-500/[0.02]",
                      )}
                    >
                      {/* Top Section */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            {item.numero ? (
                              <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary border border-primary/20">
                                {item.numero}
                              </code>
                            ) : null}
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              <Clock className="size-2.5" />
                              Por Aprobar
                            </span>
                            {item.prioridad ? (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                                  prioridadStyle,
                                )}
                              >
                                {item.prioridad.nombre}
                              </span>
                            ) : null}
                          </div>

                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setQuickView(item)
                            }}
                            className="size-7 text-primary hover:bg-primary/10 rounded-lg shrink-0"
                            title="Revisar Solicitud"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>

                        {/* Title and Motivo */}
                        <div className="space-y-1">
                          <h3 className="line-clamp-1 font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.titulo}
                          </h3>
                          {item.motivoMantenimiento ? (
                            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
                              <span className="text-foreground/80 font-semibold">
                                Motivo:
                              </span>{" "}
                              {item.motivoMantenimiento}
                            </p>
                          ) : null}
                          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                            {item.descripcion}
                          </p>
                        </div>

                        {/* Activo Card Strip */}
                        {item.activo ? (
                          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2 border border-border/60 text-xs">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border shadow-2xs text-primary">
                              <Box className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1 truncate">
                              <p className="font-semibold text-foreground truncate text-xs">
                                <span className="font-mono text-primary font-bold mr-1 text-[11px]">
                                  {item.activo.codigo}
                                </span>
                                {item.activo.nombre}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Footer Info Row & Review Action */}
                      <div className="mt-4 pt-2.5 border-t border-border/60 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          {/* Tipo Mantenimiento */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.tipoMantenimiento ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border truncate",
                                  getTipoMantenimientoBadgeClass(
                                    item.tipoMantenimiento.nombre,
                                    false,
                                  ),
                                )}
                              >
                                <Wrench className="size-3 shrink-0" />
                                <span className="truncate">
                                  {item.tipoMantenimiento.nombre}
                                </span>
                              </span>
                            ) : null}

                            {adjuntosCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                                <Paperclip className="size-3" />
                                <span>{adjuntosCount}</span>
                              </span>
                            )}
                          </div>

                          {/* Solicitante & Fecha */}
                          <div className="flex items-center gap-2 shrink-0 text-[10.5px] text-muted-foreground">
                            {item.solicitante && (
                              <div className="hidden sm:flex items-center gap-1">
                                <User className="size-3" />
                                <span className="truncate max-w-[90px]">
                                  {item.solicitante.nombre}
                                </span>
                              </div>
                            )}
                            {item.fechaSolicitud && (
                              <div className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                <span>{formatDate(item.fechaSolicitud)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct Review CTA Button */}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setQuickView(item)
                          }}
                          className="w-full h-7.5 gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                        >
                          <FileCheck2 className="size-3.5" />
                          <span>Revisar y Evaluar Expediente</span>
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {solicitudesQuery.data ? (
              <Pagination
                page={solicitudesQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Quick View & Review Sheet */}
      <SolicitudQuickViewSheet
        solicitud={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />
    </PageShell>
  )
}
