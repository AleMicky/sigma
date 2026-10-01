import { useState } from "react"
import {
  CheckCircle2,
  Plus,
  RotateCw,
  Search,
  Sliders,
  Wrench,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteActividad } from "../api/actividad.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadMasterPanelProps = {
  actividades: ActividadMantenimiento[]
  page?: PageResponse<ActividadMantenimiento>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (actividad: ActividadMantenimiento) => void
  onPageChange: (page: number) => void
  onRefresh?: () => void
}

function getIconTheme(index: number) {
  const themes = [
    { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Wrench },
    { bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Sliders },
    { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Wrench },
    { bg: "bg-violet-500/10 text-violet-500 border-violet-500/20", icon: Sliders },
    { bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: Wrench },
  ]
  return themes[index % themes.length]
}

export function ActividadMasterPanel({
  actividades,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
  onRefresh,
}: ActividadMasterPanelProps) {
  const deleteMutation = useDeleteActividad()
  const [actividadToDelete, setActividadToDelete] =
    useState<ActividadMantenimiento | null>(null)

  return (
    <div className="flex h-full flex-col bg-card/40">
      {/* Header estilo Notion / Linear compacto */}
      <div className="flex flex-col gap-2 p-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Actividades
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {page?.totalElements ?? actividades.length} actividades en catálogo
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onRefresh}
                className={cn(
                  "size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                  isFetching && "animate-spin text-primary",
                )}
                title="Actualizar lista"
              >
                <RotateCw className="size-3.5" />
              </Button>
            )}
            <Button
              onClick={onCreate}
              size="icon-xs"
              className="size-7 rounded-lg bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
              title="Nueva actividad"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Search bar minimalista compacta */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full rounded-lg border border-border/50 bg-muted/30 pl-8 pr-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-background focus:outline-hidden transition-colors"
          />
        </div>
      </div>

      {/* Lista de Items */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {isLoading ? (
          <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">
            Cargando actividades...
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center h-28 text-center p-3 text-xs text-destructive">
            <p className="font-semibold">Error al cargar</p>
            <p className="text-muted-foreground mt-0.5">{errorMessage}</p>
          </div>
        ) : actividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-3">
            <Wrench className="size-7 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs font-medium text-muted-foreground">
              {search.trim().length > 0
                ? "No se encontraron coincidencias"
                : "No hay actividades registradas"}
            </p>
            <Button
              onClick={onCreate}
              variant="link"
              size="sm"
              className="text-xs text-primary mt-0.5 h-auto p-0"
            >
              Crear primera actividad
            </Button>
          </div>
        ) : (
          actividades.map((actividad, index) => {
            const isSelected = actividad.id === selectedId
            const theme = getIconTheme(index)
            const Icon = theme.icon

            return (
              <div
                key={actividad.id}
                onClick={() => onSelect(actividad.id)}
                className={cn(
                  "group relative flex items-start gap-2.5 rounded-lg p-2.5 cursor-pointer transition-all",
                  isSelected
                    ? "bg-muted/80 shadow-2xs border border-border/80"
                    : "hover:bg-muted/30 border border-transparent",
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex size-7.5 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold shadow-2xs transition-transform group-hover:scale-105 mt-0.5",
                    theme.bg,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-xs text-foreground leading-snug break-words line-clamp-2"
                    title={actividad.nombre}
                  >
                    {actividad.nombre}
                  </h3>

                  {actividad.descripcion && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-snug">
                      {actividad.descripcion}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1.5 gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <code className="text-[9.5px] font-mono font-semibold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                        {actividad.codigo}
                      </code>
                      <span className="size-1 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        Estandarizado
                      </span>
                    </div>

                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        editLabel="Editar actividad"
                        deleteLabel="Eliminar actividad"
                        deleteDisabled={deleteMutation.isPending}
                        onEdit={() => onEdit(actividad)}
                        onDelete={() => setActividadToDelete(actividad)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Paginación en pie */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5 text-[10.5px] text-muted-foreground">
          <span>
            Pág. {page.page + 1} de {page.totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page.first}
              onClick={() => onPageChange(page.page - 1)}
              className="h-5.5 px-1.5 text-[11px]"
            >
              Ant
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page.last}
              onClick={() => onPageChange(page.page + 1)}
              className="h-5.5 px-1.5 text-[11px]"
            >
              Sig
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo confirmación de eliminación */}
      {actividadToDelete && (
        <ConfirmDeleteDialog
          open={Boolean(actividadToDelete)}
          onOpenChange={(open) => {
            if (!open) setActividadToDelete(null)
          }}
          title="Eliminar actividad de mantenimiento"
          description={`¿Seguro que deseas eliminar "${actividadToDelete.nombre}"? Sus aplicaciones y asignaciones de checklist también se eliminarán.`}
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(actividadToDelete.id)
            setActividadToDelete(null)
          }}
        />
      )}
    </div>
  )
}
