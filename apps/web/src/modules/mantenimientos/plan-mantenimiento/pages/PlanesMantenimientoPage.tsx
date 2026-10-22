import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Lightbulb,
  Plus,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { planMantenimientoQueries } from "../api/plan-mantenimiento.queries"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"
import { PlanMantenimientoDetailSheet } from "../components/PlanMantenimientoDetailSheet"
import { PlanMantenimientoFormDialog } from "../components/PlanMantenimientoFormDialog"
import { PlanMantenimientoListView } from "../components/PlanMantenimientoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function PlanesMantenimientoPage() {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PlanMantenimiento | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetInitialTab, setSheetInitialTab] = useState<"actividades" | "activos">("actividades")
  const [selectedPlanForActivities, setSelectedPlanForActivities] =
    useState<PlanMantenimiento | null>(null)
  const [selectedTipoActivoId, setSelectedTipoActivoId] = useState<string>("")
  const [showGuide, setShowGuide] = useState(true)
  const search = usePaginatedSearch()

  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({ page: 0, size: 200, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )
  const selectedTipoActivo = useMemo(
    () => tiposActivo.find((t) => t.id === selectedTipoActivoId) ?? null,
    [tiposActivo, selectedTipoActivoId],
  )

  const planesMantenimientoQuery = useQuery(
    planMantenimientoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.debouncedSearch.trim() ? { q: search.debouncedSearch.trim() } : {}),
      ...(selectedTipoActivoId ? { tipoActivoId: selectedTipoActivoId } : {}),
    }),
  )

  const planesMantenimiento = planesMantenimientoQuery.data?.content ?? []

  // Mantener actualizado el plan seleccionado en el drawer si cambia en la lista
  const activePlanInDrawer = useMemo(() => {
    if (!selectedPlanForActivities) return null
    return (
      planesMantenimiento.find((p) => p.id === selectedPlanForActivities.id) ??
      selectedPlanForActivities
    )
  }, [planesMantenimiento, selectedPlanForActivities])

  useClampPage(
    search.page,
    search.setPage,
    planesMantenimientoQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(plan: PlanMantenimiento) {
    setEditing(plan)
    setDialogOpen(true)
  }

  function handleSelectPlan(plan: PlanMantenimiento, tab: "actividades" | "activos" = "actividades") {
    setSelectedPlanForActivities(plan)
    setSheetInitialTab(tab)
    setSheetOpen(true)
  }

  function handleFilterTipoActivo(val: TipoActivo | null) {
    setSelectedTipoActivoId(val?.id ?? "")
    search.setPage(0)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Planes de Mantenimiento
            </h1>
            {planesMantenimientoQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {planesMantenimientoQuery.data.totalElements} planes
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[planesMantenimientoQuery]} />
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestión y parametrización de planes preventivos y sus actividades técnicas por tipo de activo.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => navigate({ to: "/mantenimientos/programaciones-mantenimiento" })}
            className="cursor-pointer gap-1.5 font-medium border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 rounded-xl"
          >
            <CalendarClock className="size-4 text-amber-500" />
            <span>Ver Programaciones Activas</span>
          </Button>
          <RefreshButton queries={[planesMantenimientoQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="cursor-pointer gap-1.5 font-semibold rounded-xl"
          >
            <Plus className="size-4" />
            <span>Nuevo Plan</span>
          </Button>
        </div>
      </header>

      {/* Guía Visual y Transparente del Ciclo Preventivo */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-blue-500/5 via-amber-500/5 to-emerald-500/5 p-4 my-2 text-xs space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Lightbulb className="size-4 text-amber-500" />
            <span>Ciclo Preventivo: ¿Cómo se conectan los Planes, Activos y Programaciones?</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>{showGuide ? "Ocultar guía" : "Ver explicación del ciclo"}</span>
            {showGuide ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-blue-500/20 bg-background/80 p-3 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-[11px]">1</span>
                <span>Planes de Mantenimiento</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Aquí defines la estrategia técnica: tareas y actividades a realizar para una tipología de activo (p.ej. Camionetas o Generadores).
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[11px]">2</span>
                <span>Activos Asignados</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Dentro de cada plan, vinculas los vehículos o máquinas reales. En la pestaña <strong>"Activos"</strong> verás de inmediato si ya están programados.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-background/80 p-3 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px]">3</span>
                <span>Programaciones de Telemetría</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Es el sensor que vigila km, horas u fechas. Cuando se cumple el umbral, genera automáticamente la Solicitud Preventiva sin tareas manuales.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex shrink-0 flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
          <div className="flex-1 min-w-[200px]">
            <SearchField
              value={search.search}
              onChange={(value) => search.setSearch(value)}
              placeholder="Buscar por código, nombre o descripción..."
              className="w-full text-xs"
            />
          </div>

          {/* Filtro por Tipo de Activo */}
          <div className="w-full sm:w-64">
            <Combobox
              items={tiposActivo}
              itemToStringLabel={(item: TipoActivo) => item?.nombre ?? ""}
              itemToStringValue={(item: TipoActivo) => item?.id ?? ""}
              value={selectedTipoActivo}
              onValueChange={handleFilterTipoActivo}
            >
              <div className="relative w-full">
                <ComboboxInput
                  placeholder="Filtrar por tipo de activo..."
                  className="w-full text-xs"
                  showClear
                />
              </div>
              <ComboboxContent className="z-50 max-h-60 min-w-64">
                <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                  No se encontraron tipos de activo.
                </ComboboxEmpty>
                <ComboboxList>
                  {(item: TipoActivo) => (
                    <ComboboxItem
                      key={item.id}
                      value={item}
                      className="cursor-pointer py-1.5 px-2 text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {item.nombre}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {selectedTipoActivoId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterTipoActivo(null)}
              className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Quitar filtro de tipo de activo"
            >
              <X className="size-3.5 mr-1" />
              Limpiar filtro
            </Button>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex flex-1 min-h-0 flex-col pt-3">
        {planesMantenimientoQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : planesMantenimientoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(planesMantenimientoQuery.error)}
            className="text-destructive"
          />
        ) : planesMantenimiento.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim() || selectedTipoActivoId
                ? "Sin resultados para los filtros seleccionados"
                : "No hay planes de mantenimiento registrados"
            }
            description={
              search.search.trim() || selectedTipoActivoId
                ? "Prueba modificando el texto de búsqueda o borrando los filtros."
                : "Comienza registrando el primer plan de mantenimiento y asignando sus actividades técnicas."
            }
            action={
              search.search.trim() || selectedTipoActivoId ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    search.setSearch("")
                    setSelectedTipoActivoId("")
                    search.setPage(0)
                  }}
                  className="rounded-xl cursor-pointer"
                >
                  Limpiar Filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="rounded-xl cursor-pointer">
                  <Plus className="size-4 mr-1" />
                  Crear Plan
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                planesMantenimientoQuery.isFetching && "opacity-70",
              )}
            >
              <PlanMantenimientoListView
                planesMantenimiento={planesMantenimiento}
                onEdit={openEdit}
                onSelectPlan={handleSelectPlan}
              />
            </div>

            {planesMantenimientoQuery.data ? (
              <Pagination
                page={planesMantenimientoQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal para Crear / Editar Plan */}
      <PlanMantenimientoFormDialog
        key={editing?.id ?? "new-plan-mantenimiento"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        planMantenimiento={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Slide-over Drawer para Ver y Gestionar Actividades y Activos Asignados */}
      <PlanMantenimientoDetailSheet
        key={activePlanInDrawer?.id ?? "plan-detail-sheet"}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plan={activePlanInDrawer}
        initialTab={sheetInitialTab}
        onEditPlan={openEdit}
      />
    </PageShell>
  )
}
