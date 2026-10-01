import { useMemo, useState } from "react"
import {
  Calendar,
  ClipboardCheck,
  Search,
  User,
  Wrench,
  X,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Pagination } from "@/shared/components/pagination"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"
import type { SolicitudMantenimiento } from "@/modules/mantenimientos/solicitud/types/solicitud.type"
import {
  getEstadoBadgeVariant,
  getPrioridadBadgeStyles,
} from "@/modules/mantenimientos/solicitud/lib/solicitud.utils"

type FilterTab = "todos" | "concluidos" | "en_proceso" | "observados"

type ControlActivoMasterPanelProps = {
  solicitudes: SolicitudMantenimiento[]
  page?: PageResponse<SolicitudMantenimiento>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onPageChange: (page: number) => void
}

export function formatEstadoLabel(estado?: string | null): string {
  if (!estado) return "Registrado"
  const clean = estado.replace(/_/g, " ").trim().toLowerCase()
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

export function ControlActivoMasterPanel({
  solicitudes,
  page,
  selectedId,
  search,
  isLoading,
  isFetching: _isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onPageChange,
}: ControlActivoMasterPanelProps) {
  const [internalSearch, setInternalSearch] = useState(search)
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("todos")

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearchChange(internalSearch)
  }

  function handleClearSearch() {
    setInternalSearch("")
    onSearchChange("")
  }

  // Filtrado local por pestaña rápida de estado
  const filteredSolicitudes = useMemo(() => {
    if (activeFilterTab === "todos") return solicitudes

    return solicitudes.filter((sol) => {
      const norm = (sol.estado ?? "").toLowerCase().trim()
      if (activeFilterTab === "concluidos") {
        return (
          norm === "trabajo_realizado" ||
          norm === "trabajo realizado" ||
          norm === "finalizado" ||
          norm === "finalizada" ||
          norm === "validado" ||
          norm === "cerrado"
        )
      }
      if (activeFilterTab === "en_proceso") {
        return (
          norm === "en_proceso" ||
          norm === "en proceso" ||
          norm === "en_ejecucion" ||
          norm === "en ejecucion" ||
          norm === "en_revision" ||
          norm === "asignado" ||
          norm === "por_iniciar"
        )
      }
      if (activeFilterTab === "observados") {
        return (
          norm.includes("observad") ||
          norm === "observado" ||
          norm === "observadas_mantenimiento"
        )
      }
      return true
    })
  }, [solicitudes, activeFilterTab])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col border-r bg-card/40">
      {/* Search & Filter Header */}
      <div className="border-b p-3 space-y-2.5 bg-background/50">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por folio, título o activo..."
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="h-8.5 pl-8 pr-8 text-xs rounded-xl bg-background border-border/80 shadow-2xs focus-visible:ring-sky-500/20"
          />
          {internalSearch && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleClearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </form>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          <button
            type="button"
            onClick={() => setActiveFilterTab("todos")}
            className={cn(
              "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
              activeFilterTab === "todos"
                ? "bg-sky-600 text-white shadow-2xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Todos ({solicitudes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("concluidos")}
            className={cn(
              "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
              activeFilterTab === "concluidos"
                ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Concluidos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("en_proceso")}
            className={cn(
              "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
              activeFilterTab === "en_proceso"
                ? "bg-amber-600 text-white shadow-2xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            En Proceso
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("observados")}
            className={cn(
              "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
              activeFilterTab === "observados"
                ? "bg-rose-700 dark:bg-rose-600 text-white shadow-2xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Observados
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
          <span>Solicitudes con Activos</span>
          <span className="font-semibold text-foreground">
            {page?.totalElements ?? solicitudes.length} total
          </span>
        </div>
      </div>

      {/* Solicitudes List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-2 overscroll-contain">
        {isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-22 rounded-xl"
            className="space-y-2"
          />
        ) : errorMessage ? (
          <div className="p-6 text-center text-xs text-destructive bg-destructive/5 rounded-xl border border-destructive/20 m-2">
            <p className="font-semibold">Error al cargar datos</p>
            <p className="text-[11px] mt-1 text-muted-foreground">{errorMessage}</p>
          </div>
        ) : filteredSolicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-xl m-1">
            <ClipboardCheck className="size-8 mb-2 opacity-40 text-sky-600" />
            <p className="text-xs font-semibold text-foreground">Sin solicitudes</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-0.5">
              {search || internalSearch
                ? "No hay resultados para la búsqueda ingresada"
                : "No se encontraron solicitudes en este filtro"}
            </p>
          </div>
        ) : (
          filteredSolicitudes.map((sol) => {
            const isSelected = sol.id === selectedId
            const prioridadNivel = sol.prioridad?.nivel ?? 1
            const badgeStyle = getPrioridadBadgeStyles(prioridadNivel)
            const estadoFormatted = formatEstadoLabel(sol.estado)

            return (
              <button
                key={sol.id}
                type="button"
                onClick={() => onSelect(sol.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-3 transition-all text-xs cursor-pointer select-none relative group",
                  "hover:shadow-xs focus:outline-hidden",
                  isSelected
                    ? "border-sky-500 bg-sky-50/80 dark:bg-sky-950/30 shadow-xs ring-1 ring-sky-500/40"
                    : "border-border/70 bg-card hover:bg-accent/40 hover:border-border",
                )}
              >
                {/* Active Indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-sky-600 rounded-r-full" />
                )}

                {/* Header row */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5 pl-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-foreground text-xs tracking-tight">
                      {sol.numero}
                    </span>
                    {sol.prioridad && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider",
                          badgeStyle,
                        )}
                      >
                        {sol.prioridad.nombre}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={getEstadoBadgeVariant(sol.estado)}
                    className="text-[9.5px] px-2 py-0 shrink-0 font-semibold shadow-2xs"
                  >
                    {estadoFormatted}
                  </Badge>
                </div>

                {/* Titulo */}
                <p className="font-semibold text-foreground text-xs line-clamp-1 mb-1.5 pl-0.5">
                  {sol.titulo}
                </p>

                {/* Activo & Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mb-2 pl-0.5">
                  <div className="size-4 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Wrench className="size-2.5" />
                  </div>
                  <span className="truncate font-medium text-foreground/80">
                    {sol.activo?.codigo} - {sol.activo?.nombre}
                  </span>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground/80 pt-1.5 border-t border-border/50 pl-0.5">
                  <span className="flex items-center gap-1 truncate max-w-[55%]">
                    <User className="size-2.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">
                      {sol.solicitante?.nombreCompleto ||
                        sol.solicitante?.nombre ||
                        "Sin solicitante"}
                    </span>
                  </span>
                  {sol.fechaSolicitud && (
                    <span className="flex items-center gap-1 shrink-0 font-mono">
                      <Calendar className="size-2.5 text-muted-foreground/70" />
                      <span>{sol.fechaSolicitud.slice(0, 10)}</span>
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {page && page.totalPages > 1 && (
        <div className="border-t p-2 bg-background/50">
          <Pagination
            page={page}
            onPageChange={onPageChange}
            className="text-xs justify-center"
          />
        </div>
      )}
    </div>
  )
}
