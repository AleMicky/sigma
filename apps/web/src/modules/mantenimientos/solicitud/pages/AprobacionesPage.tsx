import { useMemo, useState } from "react"
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
import { SolicitudDetalleModal } from "../components/SolicitudDetalleModal"
import { WorkflowActionDialog } from "../components/WorkflowActionDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const [selectedEstado, setSelectedEstado] = useState<string>("all")
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>("all")
  const [modalSolicitud, setModalSolicitud] =
    useState<SolicitudMantenimiento | null>(null)

  const [workflowActionTarget, setWorkflowActionTarget] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch()

  // Solicitudes list query
  const isGroupFilter = selectedEstado.startsWith("GROUP_")
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(!isGroupFilter && selectedEstado !== "all" ? { estado: selectedEstado } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const solicitudes = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  // Filtrado compuesto (Grupos de flujo BPMN + Prioridad)
  const filteredSolicitudes = useMemo(() => {
    let list = solicitudes

    if (selectedEstado && selectedEstado !== "all") {
      if (selectedEstado === "SOLICITADO" || selectedEstado === "GROUP_SOLICITADO") {
        list = list.filter(
          (s) => (s.estado ?? "").toUpperCase() === "SOLICITADO",
        )
      } else if (selectedEstado === "GROUP_MANTENIMIENTO") {
        list = list.filter((s) => {
          const est = (s.estado ?? "").toUpperCase()
          return est === "ASIGNADO" || est === "EN_MANTENIMIENTO"
        })
      } else if (selectedEstado === "GROUP_REVISION") {
        list = list.filter((s) => {
          const est = (s.estado ?? "").toUpperCase()
          return (
            est === "EN_REVISION" ||
            est === "VALIDADO" ||
            est === "TRABAJO_REALIZADO"
          )
        })
      } else if (selectedEstado === "GROUP_OBSERVADAS") {
        list = list.filter((s) => {
          const est = (s.estado ?? "").toUpperCase()
          return (
            est === "OBSERVADO" ||
            est === "OBSERVADO_MANTENIMIENTO" ||
            est.includes("OBSERVAD")
          )
        })
      } else {
        list = list.filter(
          (s) =>
            (s.estado ?? "").toUpperCase() === selectedEstado.toUpperCase(),
        )
      }
    }

    if (selectedPrioridad && selectedPrioridad !== "all") {
      const nivel = parseInt(selectedPrioridad, 10)
      list = list.filter((s) => (s.prioridad?.nivel ?? 1) === nivel)
    }

    return list
  }, [solicitudes, selectedEstado, selectedPrioridad])

  // KPIs de la bandeja según el BPMN
  const totalElements =
    solicitudesQuery.data?.totalElements ?? solicitudes.length

  const porAprobarCount = useMemo(
    () =>
      solicitudes.filter(
        (s) => (s.estado ?? "").toUpperCase() === "SOLICITADO",
      ).length,
    [solicitudes],
  )

  const enMantenimientoCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toUpperCase()
        return est === "ASIGNADO" || est === "EN_MANTENIMIENTO"
      }).length,
    [solicitudes],
  )

  const enRevisionCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toUpperCase()
        return (
          est === "EN_REVISION" ||
          est === "VALIDADO" ||
          est === "TRABAJO_REALIZADO"
        )
      }).length,
    [solicitudes],
  )

  const observadasCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toUpperCase()
        return (
          est === "OBSERVADO" ||
          est === "OBSERVADO_MANTENIMIENTO" ||
          est.includes("OBSERVAD")
        )
      }).length,
    [solicitudes],
  )

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function handleOpenModal(solicitud: SolicitudMantenimiento) {
    setModalSolicitud(solicitud)
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
      <header className="flex shrink-0 flex-col gap-2 border-b py-3 sm:gap-3 sm:py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="size-4.5" />
              </div>
              <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                Bandeja de Aprobaciones y Flujo
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
            Supervisa, evalúa y toma decisiones en el flujo de trabajo de mantenimiento.
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

      {/* KPI Stats Section - Filtros interactivos por grupo de flujo */}
      <div className="shrink-0 pt-3 pb-1">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {/* 1. Por Aprobar (SOLICITADO) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "SOLICITADO" ? "all" : "SOLICITADO",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "SOLICITADO"
                ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30"
                : "border-amber-500/40 bg-amber-500/10",
            )}
          >
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <UserCheck className="size-4.5" />
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
                {selectedEstado === "SOLICITADO"
                  ? filteredSolicitudes.length
                  : porAprobarCount}
              </p>
            </div>
          </div>

          {/* 2. En Mantenimiento (ASIGNADO + EN_MANTENIMIENTO) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "GROUP_MANTENIMIENTO" ? "all" : "GROUP_MANTENIMIENTO",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "GROUP_MANTENIMIENTO"
                ? "border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30"
                : "border-blue-500/30 bg-blue-500/5",
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Wrench className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300 truncate">
                En Mantenimiento
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {selectedEstado === "GROUP_MANTENIMIENTO"
                  ? filteredSolicitudes.length
                  : enMantenimientoCount}
              </p>
            </div>
          </div>

          {/* 3. En Revisión (EN_REVISION + VALIDADO + TRABAJO_REALIZADO) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "GROUP_REVISION" ? "all" : "GROUP_REVISION",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "GROUP_REVISION"
                ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30"
                : "border-indigo-500/30 bg-indigo-500/5",
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 truncate">
                En Revisión
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {selectedEstado === "GROUP_REVISION"
                  ? filteredSolicitudes.length
                  : enRevisionCount}
              </p>
            </div>
          </div>

          {/* 4. Observadas (OBSERVADO + OBSERVADO_MANTENIMIENTO) */}
          <div
            onClick={() =>
              setSelectedEstado((prev) =>
                prev === "GROUP_OBSERVADAS" ? "all" : "GROUP_OBSERVADAS",
              )
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]",
              selectedEstado === "GROUP_OBSERVADAS"
                ? "border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/30"
                : "border-orange-500/30 bg-orange-500/5",
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 shadow-2xs">
              <Flame className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-300 truncate">
                Observadas
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-orange-600 dark:text-orange-400">
                {selectedEstado === "GROUP_OBSERVADAS"
                  ? filteredSolicitudes.length
                  : observadasCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-3 gap-3">
        {/* Search & Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <div className="w-full sm:flex-1">
            <SearchField
              placeholder="Buscar por título, número de folio, activo o solicitante..."
              value={search.search}
              onChange={search.setSearch}
              className="w-full h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedEstado}
              onValueChange={(val) => setSelectedEstado(val ?? "all")}
            >
              <SelectTrigger className="h-9 text-xs w-[210px]">
                <SelectValue placeholder="Estado de flujo" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all" className="text-xs font-medium">
                  📋 Todos los registros
                </SelectItem>
                
                {/* Grupos de Trabajo BPMN */}
                <SelectItem
                  value="SOLICITADO"
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold"
                >
                  🟡 Por Aprobar (SOLICITADO)
                </SelectItem>
                <SelectItem
                  value="GROUP_MANTENIMIENTO"
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold"
                >
                  🔵 En Mantenimiento (ASIGNADO / EJECUCIÓN)
                </SelectItem>
                <SelectItem
                  value="GROUP_REVISION"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                >
                  🟣 En Revisión (SUPERVISIÓN / VALIDADO)
                </SelectItem>
                <SelectItem
                  value="GROUP_OBSERVADAS"
                  className="text-xs text-orange-600 dark:text-orange-400 font-semibold"
                >
                  🟠 Observadas (CORRECCIÓN / OBS)
                </SelectItem>

                {/* Estados Específicos */}
                <SelectItem
                  value="FINALIZADO"
                  className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold"
                >
                  🏁 FINALIZADO (Cerrado)
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedPrioridad}
              onValueChange={(val) => setSelectedPrioridad(val ?? "all")}
            >
              <SelectTrigger className="h-9 text-xs w-[150px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Todas prioridades
                </SelectItem>
                <SelectItem value="5" className="text-xs text-rose-600">
                  🔴 Crítica
                </SelectItem>
                <SelectItem value="4" className="text-xs text-orange-600">
                  🟠 Alta
                </SelectItem>
                <SelectItem value="3" className="text-xs text-amber-600">
                  🟡 Media
                </SelectItem>
                <SelectItem value="2" className="text-xs text-blue-600">
                  🔵 Baja
                </SelectItem>
                <SelectItem value="1" className="text-xs text-emerald-600">
                  🟢 Menor
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters ? (
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={resetFilters}
                className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
                title="Limpiar filtros"
              >
                <X className="size-3.5" />
                <span>Limpiar</span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {solicitudesQuery.isLoading ? (
            <ListSkeleton
              rows={6}
              rowClassName="h-20 rounded-xl"
              className="space-y-2.5"
            />
          ) : solicitudesQuery.isError ? (
            <EmptyState
              title={getErrorMessage(solicitudesQuery.error)}
              className="text-destructive"
            />
          ) : filteredSolicitudes.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="size-9 text-amber-500" />}
              title={
                hasActiveFilters
                  ? "Sin resultados para este filtro"
                  : "¡Bandeja al día!"
              }
              description={
                hasActiveFilters
                  ? "No se encontraron solicitudes con los criterios seleccionados."
                  : "No hay solicitudes pendientes en este momento."
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
                ) : null
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-0.5",
                  solicitudesQuery.isFetching && "opacity-75",
                )}
              >
                <SolicitudAprobacionListView
                  solicitudes={filteredSolicitudes}
                  onQuickView={handleOpenModal}
                  onActionSelect={handleActionSelect}
                />
              </div>

              {solicitudesQuery.data ? (
                <Pagination
                  page={solicitudesQuery.data}
                  onPageChange={search.setPage}
                  className="border-t pt-2 shrink-0 text-xs"
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Detalle de Solicitud + WorkflowPanel Modal Dialog */}
      <SolicitudDetalleModal
        solicitud={modalSolicitud}
        open={Boolean(modalSolicitud)}
        onOpenChange={(open) => !open && setModalSolicitud(null)}
        onWorkflowAction={handleActionSelect}
      />

      {/* Dynamic Workflow Action Dialog */}
      <WorkflowActionDialog
        open={Boolean(workflowActionTarget)}
        onOpenChange={(open) => !open && setWorkflowActionTarget(null)}
        solicitud={workflowActionTarget?.solicitud ?? null}
        action={workflowActionTarget?.action ?? null}
        taskName={workflowActionTarget?.taskName}
        fields={workflowActionTarget?.fields}
        onSuccess={() => {
          solicitudesQuery.refetch()
          setModalSolicitud(null)
        }}
      />
    </PageShell>
  )
}

