import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  Search,
  Truck,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteFlota, useToggleActivoFlota } from "../api/flota.mutations"
import type { FlotaVehicular } from "../api/flota.service"

type FlotaMasterPanelProps = {
  flotas: FlotaVehicular[]
  page?: PageResponse<FlotaVehicular>
  selectedId: string | null
  search: string
  activoFilter: boolean | null
  isLoading: boolean
  isFetching?: boolean
  errorMessage?: string | null
  onSearchChange: (value: string) => void
  onActivoFilterChange: (activo: boolean | null) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (flota: FlotaVehicular) => void
  onPageChange: (page: number) => void
}

function getIconTheme(index: number) {
  const themes = [
    { bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20", icon: Layers },
    { bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Truck },
    { bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20", icon: Layers },
    { bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", icon: Truck },
  ]
  return themes[index % themes.length]
}

export function FlotaMasterPanel({
  flotas,
  page,
  selectedId,
  search,
  activoFilter,
  isLoading,
  onSearchChange,
  onActivoFilterChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: FlotaMasterPanelProps) {
  const deleteMutation = useDeleteFlota()
  const toggleMutation = useToggleActivoFlota()
  const [flotaToDelete, setFlotaToDelete] = useState<FlotaVehicular | null>(null)

  const currentPage = page?.page ?? 0
  const totalPages = page?.totalPages ?? 1

  return (
    <div className="flex h-full flex-col bg-card/40 select-none">
      {/* Header estilo Notion/Linear */}
      <div className="flex flex-col gap-3 p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Flotas Vehiculares
            </h2>
            <p className="text-xs text-muted-foreground">
              {page?.totalElements ?? flotas.length} flotas registradas
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={onCreate}
              size="icon-xs"
              className="size-8 rounded-lg bg-cyan-600 text-white shadow-xs hover:bg-cyan-700 cursor-pointer"
              title="Nueva Flota Vehicular"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        {/* Search bar minimalista */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código, nombre…"
            className="w-full rounded-lg border border-border/60 bg-background/80 py-1.5 pl-9 pr-3 text-xs placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {/* Filtros de estado rápido */}
        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => onActivoFilterChange(null)}
            className={cn(
              "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
              activoFilter === null
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onActivoFilterChange(true)}
            className={cn(
              "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
              activoFilter === true
                ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Activas
          </button>
          <button
            type="button"
            onClick={() => onActivoFilterChange(false)}
            className={cn(
              "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
              activoFilter === false
                ? "bg-background text-rose-600 dark:text-rose-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Inactivas
          </button>
        </div>
      </div>

      {/* Lista de Flotas (Master Items) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-18 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : flotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Layers className="size-8 opacity-30 mb-2" />
            <p className="text-xs font-medium">No se encontraron flotas</p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Crea una nueva flota para comenzar
            </p>
          </div>
        ) : (
          flotas.map((flota, index) => {
            const isSelected = flota.id === selectedId
            const theme = getIconTheme(index)
            const IconComponent = theme.icon

            return (
              <div
                key={flota.id}
                onClick={() => onSelect(flota.id)}
                className={cn(
                  "group relative flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/10 dark:bg-cyan-950/20 shadow-xs"
                    : "border-transparent bg-background/50 hover:bg-muted/50 hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                      theme.bg
                    )}
                  >
                    <IconComponent className="size-4.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                        {flota.codigo}
                      </code>
                      <span className="font-semibold text-xs text-foreground truncate">
                        {flota.nombre}
                      </span>
                    </div>

                    {flota.descripcion ? (
                      <p className="text-[11px] text-muted-foreground truncate leading-tight">
                        {flota.descripcion}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic leading-tight">
                        Sin descripción
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={flota.activo ? "outline" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMutation.mutate(flota.id)
                    }}
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.2 border cursor-pointer hover:opacity-80 transition-opacity",
                      flota.activo
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border/60"
                    )}
                    title="Clic para alternar estado"
                  >
                    {flota.activo ? "Activa" : "Inactiva"}
                  </Badge>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RowActions
                      onEdit={() => onEdit(flota)}
                      onDelete={() => setFlotaToDelete(flota)}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border/40 bg-background/50 text-[11px] text-muted-foreground">
          <span>
            Pág. {currentPage + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="size-7"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="size-7"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {flotaToDelete && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setFlotaToDelete(null)}
          title="Eliminar Flota Vehicular"
          description={`¿Estás seguro de que deseas eliminar la flota "${flotaToDelete.nombre}" (${flotaToDelete.codigo})? Se desvincularán todos los vehículos y responsables asociados.`}
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(flotaToDelete.id)
            setFlotaToDelete(null)
          }}
        />
      )}
    </div>
  )
}
