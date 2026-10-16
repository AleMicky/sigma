import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Check, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

import { estadoOperativoQueries } from "@/modules/activos/estado-operativo/api/estado-operativo.queries"
import {
  useCreateTipoActivoEstado,
  useDeleteTipoActivoEstado,
  useUpdateTipoActivoEstado,
} from "../api/tipo-activo-estado.mutations"
import { tipoActivoEstadoQueries } from "../api/tipo-activo-estado.queries"
import type { TipoActivoEstado } from "../api/tipo-activo-estado.service"

type TipoActivoEstadosTabProps = {
  tipoActivoId: string
}

export function TipoActivoEstadosTab({ tipoActivoId }: TipoActivoEstadosTabProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedEstadoId, setSelectedEstadoId] = useState<string>("")
  const [isDefault, setIsDefault] = useState(false)
  const [toDelete, setToDelete] = useState<TipoActivoEstado | null>(null)

  const estadosAsignadosQuery = useQuery(
    tipoActivoEstadoQueries.byTipoActivoId(tipoActivoId),
  )

  const todosEstadosQuery = useQuery(
    estadoOperativoQueries.list({ size: 100 }),
  )

  const createMutation = useCreateTipoActivoEstado()
  const updateMutation = useUpdateTipoActivoEstado()
  const deleteMutation = useDeleteTipoActivoEstado()

  const asignaciones = estadosAsignadosQuery.data?.content ?? []
  const todosEstados = todosEstadosQuery.data?.content ?? []

  // Mapa rápido de id -> EstadoOperativo
  const estadosMap = new Map(todosEstados.map((e) => [e.id, e]))

  // Estados disponibles que aún no han sido asignados
  const assignedIds = new Set(asignaciones.map((a) => a.estadoOperativoId))
  const estadosDisponibles = todosEstados.filter((e) => !assignedIds.has(e.id))

  async function handleAssign() {
    if (!selectedEstadoId) {
      toast.error("Selecciona un estado operativo")
      return
    }

    try {
      await createMutation.mutateAsync({
        tipoActivoId,
        estadoOperativoId: selectedEstadoId,
        predeterminado: isDefault,
      })
      setAssignDialogOpen(false)
      setSelectedEstadoId("")
      setIsDefault(false)
    } catch {
      // Error handled by mutation/interceptor
    }
  }

  async function handleSetPredeterminado(asignacion: TipoActivoEstado) {
    try {
      await updateMutation.mutateAsync({
        id: asignacion.id,
        payload: {
          tipoActivoId: asignacion.tipoActivoId,
          estadoOperativoId: asignacion.estadoOperativoId,
          predeterminado: true,
        },
      })
    } catch {
      // Error handled
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Barra de herramientas */}
      <div className="flex shrink-0 items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Estados asociados:
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {asignaciones.length}
          </span>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={() => {
            setSelectedEstadoId(estadosDisponibles[0]?.id ?? "")
            setIsDefault(asignaciones.length === 0)
            setAssignDialogOpen(true)
          }}
          disabled={estadosDisponibles.length === 0}
          className="shadow-2xs text-xs h-8"
        >
          <Plus className="size-3.5" />
          Asignar Estado
        </Button>
      </div>

      {/* Lista de estados asignados */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {estadosAsignadosQuery.isLoading || todosEstadosQuery.isLoading ? (
          <ListSkeleton rows={4} rowClassName="h-14 rounded-xl" />
        ) : estadosAsignadosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(estadosAsignadosQuery.error)}
            className="text-destructive"
          />
        ) : asignaciones.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-8 text-muted-foreground/60" />}
            title="Sin estados operativos asignados"
            description="Asigna los estados operativos aplicables para este tipo de activo y define cuál será el predeterminado."
            action={
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  setSelectedEstadoId(estadosDisponibles[0]?.id ?? "")
                  setIsDefault(true)
                  setAssignDialogOpen(true)
                }}
                disabled={estadosDisponibles.length === 0}
                className="rounded-xl"
              >
                <Plus className="size-4" />
                Asignar Primer Estado
              </Button>
            }
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 space-y-2 pb-4">
            {asignaciones.map((item) => {
              const estado = estadosMap.get(item.estadoOperativoId)
              const color = estado?.color || "#10B981"

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border bg-card transition-all",
                    item.predeterminado
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-border/70 hover:border-border hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      <Activity className="size-4" />
                    </span>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {estado?.nombre ?? "Estado desconocido"}
                        </span>
                        {estado?.codigo && (
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
                            {estado.codigo}
                          </code>
                        )}
                        {item.predeterminado && (
                          <Badge
                            variant="default"
                            className="gap-1 text-[10px] py-0 px-2 font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          >
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            Predeterminado
                          </Badge>
                        )}
                      </div>

                      {estado?.descripcion && (
                        <p className="text-xs text-muted-foreground truncate pt-0.5">
                          {estado.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!item.predeterminado && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleSetPredeterminado(item)}
                        disabled={updateMutation.isPending}
                        title="Marcar como estado predeterminado"
                        className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                      >
                        <Star className="size-3.5" />
                        <span className="hidden sm:inline">Hacer Predeterminado</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => setToDelete(item)}
                      title="Desvincular estado de este tipo de activo"
                      className="size-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog para asignar estado */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Estado Operativo</DialogTitle>
            <DialogDescription>
              Selecciona el estado operativo que estará habilitado para este tipo de activo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel htmlFor="estado-select">Estado Operativo</FieldLabel>
              <Select
                value={selectedEstadoId}
                onValueChange={(val) => val && setSelectedEstadoId(val)}
              >
                <SelectTrigger id="estado-select">
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: e.color || "#10B981" }}
                        />
                        <span>{e.nombre}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          ({e.codigo})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Establecer como estado predeterminado</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!selectedEstadoId || createMutation.isPending}
            >
              <Check className="size-4" />
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar desvinculación */}
      <ConfirmDeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="¿Desasignar estado operativo?"
        description={
          toDelete
            ? `Se removerá la asociación de este estado operativo con el tipo de activo.`
            : ""
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!toDelete) return
          await deleteMutation.mutateAsync(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
