import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Check, Loader2 } from "lucide-react"

import { estadoOperativoQueries } from "@/modules/activos/estado-operativo/api/estado-operativo.queries"
import type { EstadoOperativo } from "@/modules/activos/estado-operativo/api/estado-operativo.service"
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
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useCambiarEstadoOperativoActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

interface CambiarEstadoOperativoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activo: Activo | null
  onSuccess?: () => void
}

export function CambiarEstadoOperativoDialog({
  open,
  onOpenChange,
  activo,
  onSuccess,
}: CambiarEstadoOperativoDialogProps) {
  const [selectedEstadoId, setSelectedEstadoId] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")

  const cambiarEstadoMutation = useCambiarEstadoOperativoActivo()

  const estadosQuery = useQuery(
    estadoOperativoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const estadosOperativos = estadosQuery.data?.content ?? []

  useEffect(() => {
    if (activo) {
      setSelectedEstadoId(
        activo.estadoOperativo?.id ?? activo.estadoOperativoId ?? "",
      )
      setObservacion("")
    }
  }, [activo])

  const handleGuardar = async () => {
    if (!activo || !selectedEstadoId) return

    await cambiarEstadoMutation.mutateAsync({
      id: activo.id,
      payload: {
        estadoOperativoId: selectedEstadoId,
        observacion: observacion.trim() || undefined,
      },
    })

    onOpenChange(false)
    onSuccess?.()
  }

  const currentEstado = estadosOperativos.find((e) => e.id === selectedEstadoId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Cambiar Estado Operativo
              </DialogTitle>
              <DialogDescription className="text-xs">
                Actualiza la disponibilidad técnica u operativa del activo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {activo && (
          <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60 flex items-center justify-between text-xs">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {activo.nombre}
              </p>
              <code className="text-[10px] font-mono text-muted-foreground">
                {activo.codigo}
              </code>
            </div>
            {activo.estadoOperativo && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                style={{
                  backgroundColor: `${activo.estadoOperativo.color || "#10B981"}15`,
                  borderColor: `${activo.estadoOperativo.color || "#10B981"}40`,
                  color: activo.estadoOperativo.color || "inherit",
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: activo.estadoOperativo.color || "#10B981",
                  }}
                />
                {activo.estadoOperativo.nombre}
              </span>
            )}
          </div>
        )}

        <div className="space-y-4 py-1">
          <Field>
            <FieldLabel className="text-xs font-semibold text-foreground mb-1.5">
              Nuevo Estado Operativo
            </FieldLabel>
            {estadosQuery.isLoading ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {estadosOperativos.map((estado: EstadoOperativo) => {
                  const isSelected = selectedEstadoId === estado.id
                  const color = estado.color || "#10B981"
                  return (
                    <button
                      key={estado.id}
                      type="button"
                      onClick={() => setSelectedEstadoId(estado.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-accent/70 border-primary ring-1 ring-primary/40 shadow-2xs"
                          : "border-border/60 hover:bg-muted/40",
                      )}
                    >
                      <span
                        className="size-2.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {estado.nombre}
                          </span>
                          {isSelected && (
                            <Check className="size-3 text-primary shrink-0" />
                          )}
                        </div>
                        {estado.descripcion && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug mt-0.5">
                            {estado.descripcion}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel
              htmlFor="observacion-estado"
              className="text-xs font-semibold text-foreground"
            >
              Observación o motivo (opcional)
            </FieldLabel>
            <Textarea
              id="observacion-estado"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Ingreso a taller por cambio de frenos, salida a comisión..."
              className="text-xs min-h-[70px]"
            />
          </Field>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={cambiarEstadoMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleGuardar}
            disabled={
              !selectedEstadoId ||
              cambiarEstadoMutation.isPending ||
              (selectedEstadoId ===
                (activo?.estadoOperativo?.id ?? activo?.estadoOperativoId) &&
                !observacion.trim())
            }
          >
            {cambiarEstadoMutation.isPending && (
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
            )}
            {currentEstado
              ? `Cambiar a ${currentEstado.nombre}`
              : "Guardar Estado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
