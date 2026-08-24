import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  FileCheck2,
  Flame,
  ShieldCheck,
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
import { cn } from "@/shared/lib/utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import { SolicitudAprobacionListView } from "../components/SolicitudAprobacionListView"
import { SolicitudQuickViewSheet } from "../components/SolicitudQuickViewSheet"
import { WorkflowActionDialog } from "../components/WorkflowActionDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<string>("all")
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>("all")
  const [quickView, setQuickView] = useState<SolicitudMantenimiento | null>(null)
  const [workflowActionTarget, setWorkflowActionTarget] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch()

  // Solicitudes con filtro de estado (solicitado, asignado, o all)
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(selectedEstado !== "all" ? { estado: selectedEstado } : {}),
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
  const totalElements = solicitudesQuery.data?.totalElements ?? solicitudes.length

  const porAprobarCount = useMemo(
    () =>
      solicitudes.filter(
        (s) => (s.estado ?? "").toLowerCase() === "solicitado",
      ).length,
    [solicitudes],
  )

  const asignadasCount = useMemo(
    () =>
      solicitudes.filter(
        (s) => (s.estado ?? "").toLowerCase() === "asignado",
      ).length,
    [solicitudes],
  )

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

  function handleActionSelect(
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) {
    setWorkflowActionTarget({
      solicitud,
      action,
      taskName,
      fields,
    })
  }

  const hasActiveFilters = Boolean(
    search.search.trim() ||
      (selectedPrioridad && selectedPrioridad !== "all") ||
      (selectedEstado && selectedEstado !== "all"),
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedPrioridad("all")
    setSelectedEstado("all")
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
                Bandeja de Aprobaciones y Asignaciones
              </h1>
              {totalElements > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {totalElements} registros
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
            Supervisa, evalúa y gestiona las solicitudes de mantenimiento en proceso de aprobación y asignación técnica.
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

      {/* KPI Stats Section for Approvers and Coordinators */}
      <div className="shrink-0 pt-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Por Aprobar (Solicitado) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "solicitado" ? "all" : "solicitado",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "solicitado"
                ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30"
                : "border-amber-500/40 bg-amber-500/10",
            )}
          >
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
                {selectedEstado === "solicitado"
                  ? totalElements
                  : porAprobarCount}
              </p>
            </div>
          </div>

          {/* Asignadas (Para Asignar / En Asignación) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "asignado" ? "all" : "asignado",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "asignado"
                ? "border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/30"
                : "border-sky-500/30 bg-sky-500/5",
            )}
          >
            <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shadow-2xs">
              <Wrench className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300 truncate">
                Asignadas
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-sky-600 dark:text-sky-400">
                {selectedEstado === "asignado"
                  ? totalElements
                  : asignadasCount}
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

          {/* Preventivas / Correctivas */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 sm:p-3 shadow-2xs">
            <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Prev: {preventivasCount} | Corr: {correctivasCount}
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {totalElements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 pt-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="w-full sm:w-72">
            <SearchField
              placeholder="Buscar por título, número, activo o solicitante..."
              value={search.search}
              onChange={search.setSearch}
              className="w-full h-9 text-xs"
            />
          </div>

          {/* Estado Filter Selector */}
          <div className="w-48">
            <Select
              value={selectedEstado}
              onValueChange={(val) => setSelectedEstado(val ?? "all")}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">
                  📋 Todos los pendientes
                </SelectItem>
                <SelectItem value="solicitado" className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  🟡 Por Aprobar (Solicitado)
                </SelectItem>
                <SelectItem value="asignado" className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                  🔵 Asignado (Para Asignar)
                </SelectItem>
                <SelectItem value="aprobado" className="text-xs text-emerald-600 dark:text-emerald-400">
                  🟢 Aprobado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prioridad Filter */}
          <div className="w-44">
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
            rows={6}
            rowClassName="h-28 rounded-2xl"
            className="space-y-3"
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
              <SolicitudAprobacionListView
                solicitudes={filteredSolicitudes}
                onQuickView={(s) => setQuickView(s)}
                onActionSelect={handleActionSelect}
                onEdit={openEdit}
              />
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
        onWorkflowAction={handleActionSelect}
      />

      {/* Workflow Action Dialog */}
      <WorkflowActionDialog
        open={Boolean(workflowActionTarget)}
        onOpenChange={(open) => !open && setWorkflowActionTarget(null)}
        solicitud={workflowActionTarget?.solicitud ?? null}
        action={workflowActionTarget?.action ?? null}
        taskName={workflowActionTarget?.taskName}
        fields={workflowActionTarget?.fields}
        onSuccess={() => {
          if (quickView && workflowActionTarget?.solicitud.id === quickView.id) {
            setQuickView(null)
          }
        }}
      />
    </PageShell>
  )
}

