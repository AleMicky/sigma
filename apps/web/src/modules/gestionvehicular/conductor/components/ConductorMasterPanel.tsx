import { useState } from "react"
import {
  Car,
  Filter,
  Plus,
  Search,
  UserCheck,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteConductor } from "../api/conductor.mutations"
import type { Conductor, ConductorLicencia } from "../api/conductor.service"

type ConductorMasterPanelProps = {
  conductores: Conductor[]
  page?: PageResponse<Conductor>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (conductor: Conductor) => void
  onPageChange: (page: number) => void
}

function getIconTheme(index: number) {
  const themes = [
    { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Car },
    { bg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: UserCheck },
    { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Car },
    { bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: UserCheck },
    { bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: Car },
  ]
  return themes[index % themes.length]
}

export function ConductorMasterPanel({
  conductores,
  page,
  selectedId,
  search,
  isLoading,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: ConductorMasterPanelProps) {
  const deleteMutation = useDeleteConductor()
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null)

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return (
    <div className="flex h-full flex-col bg-card/40 select-none">
      {/* Header estilo Notion/Linear */}
      <div className="flex flex-col gap-3 p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Conductores
            </h2>
            <p className="text-xs text-muted-foreground">
              {page?.totalElements ?? conductores.length} conductores en tu espacio
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Filtrar"
            >
              <Filter className="size-4" />
            </Button>
            <Button
              onClick={onCreate}
              size="icon-xs"
              className="size-8 rounded-lg bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
              title="Nuevo conductor"
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
            placeholder="Buscar conductores..."
            className="w-full rounded-xl border border-border/50 bg-muted/30 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-background focus:outline-hidden transition-colors"
          />
        </div>
      </div>

      {/* Lista de Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            Cargando conductores...
          </div>
        ) : conductores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Car className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              No hay conductores
            </p>
            <Button
              onClick={onCreate}
              variant="link"
              size="sm"
              className="text-xs text-primary mt-1"
            >
              Registrar primer conductor
            </Button>
          </div>
        ) : (
          conductores.map((conductor, index) => {
            const isSelected = conductor.id === selectedId
            const theme = getIconTheme(index)
            const Icon = theme.icon
            const nombre = conductor.empleado?.nombreCompleto || "Sin nombre"
            const cargo = conductor.empleado?.cargo || "Conductor"
            const area = conductor.empleado?.area || conductor.empleado?.codigo
            const licencias: ConductorLicencia[] = conductor.licencias || []

            // Alerta de vigencia
            let estadoTexto = "Activo"
            let dotColor = "bg-emerald-500"

            if (!conductor.activo || conductor.estado === "INACTIVO") {
              estadoTexto = "Inactivo"
              dotColor = "bg-zinc-400"
            } else if (conductor.estado === "SUSPENDIDO") {
              estadoTexto = "Suspendido"
              dotColor = "bg-amber-500"
            } else if (conductor.estado === "BAJA") {
              estadoTexto = "Baja"
              dotColor = "bg-destructive"
            } else {
              // Chequear licencias
              for (const l of licencias) {
                if (l.fechaVencimiento) {
                  const diff = Math.ceil(
                    (new Date(l.fechaVencimiento).getTime() - hoy.getTime()) /
                      86_400_000
                  )
                  if (diff < 0) {
                    estadoTexto = "Licencia vencida"
                    dotColor = "bg-destructive"
                    break
                  } else if (diff <= 30) {
                    estadoTexto = "Por vencer"
                    dotColor = "bg-amber-500"
                  }
                }
              }
            }

            const categoriasStr = licencias
              .map((l) => l.categoriaLicencia)
              .filter(Boolean)
              .join(", ")

            return (
              <div
                key={conductor.id}
                onClick={() => onSelect(conductor.id)}
                className={cn(
                  "group relative flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all",
                  isSelected
                    ? "bg-muted/70 shadow-2xs border border-border/70"
                    : "hover:bg-muted/30 border border-transparent"
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold shadow-2xs transition-transform group-hover:scale-105",
                    theme.bg
                  )}
                >
                  <Icon className="size-4.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {nombre}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {categoriasStr ? `Cat. ${categoriasStr}` : "Sin lic."}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {cargo} {area ? `· ${area}` : ""}
                  </p>

                  <div className="flex items-center justify-between mt-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", dotColor)} />
                      <span className="text-[10.5px] text-muted-foreground font-medium">
                        {estadoTexto}
                      </span>
                    </div>

                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        editLabel="Editar conductor"
                        deleteLabel="Eliminar conductor"
                        deleteDisabled={deleteMutation.isPending}
                        onEdit={() => onEdit(conductor)}
                        onDelete={() => setConductorToDelete(conductor)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Paginación simple en pie */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span>
            Pág. {page.page + 1} de {page.totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page.first}
              onClick={() => onPageChange(page.page - 1)}
              className="h-6 px-2 text-xs"
            >
              Ant
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page.last}
              onClick={() => onPageChange(page.page + 1)}
              className="h-6 px-2 text-xs"
            >
              Sig
            </Button>
          </div>
        </div>
      )}

      {conductorToDelete && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setConductorToDelete(null)}
          title="Eliminar conductor"
          description={`¿Seguro que deseas eliminar al conductor "${conductorToDelete.empleado?.nombreCompleto || "Empleado asignado"}"?`}
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(conductorToDelete.id)
            setConductorToDelete(null)
          }}
        />
      )}
    </div>
  )
}
