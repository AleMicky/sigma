import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Layers, Loader2, Plus } from "lucide-react"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { componenteQueries } from "@/modules/activos/componente/api/componente.queries"
import { isApiError } from "@/shared/api"
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

import { useCreateActividadAplicacion } from "../api/actividad-aplicacion.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadAplicacionFormDialogProps = {
  actividad: ActividadMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ActividadAplicacionFormDialog({
  actividad,
  open,
  onOpenChange,
  onSuccess,
}: ActividadAplicacionFormDialogProps) {
  const [tipoActivoId, setTipoActivoId] = useState<string>("")
  const [componenteId, setComponenteId] = useState<string>("")
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateActividadAplicacion()

  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const componentesQuery = useQuery({
    ...componenteQueries.byTipoActivo(tipoActivoId, {
      page: 0,
      size: 100,
    }),
    enabled: Boolean(tipoActivoId),
  })

  const tiposActivo = tiposActivoQuery.data?.content ?? []
  const componentes = componentesQuery.data?.content ?? []

  const selectedTipoActivo = useMemo(
    () => tiposActivo.find((t) => t.id === tipoActivoId),
    [tiposActivo, tipoActivoId],
  )

  const selectedComponente = useMemo(
    () => componentes.find((c) => c.id === componenteId),
    [componentes, componenteId],
  )

  function resetForm() {
    setTipoActivoId("")
    setComponenteId("")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!actividad || !tipoActivoId) return
    setFormError(null)

    try {
      await createMutation.mutateAsync({
        actividadMantenimientoId: actividad.id,
        tipoActivoId,
        componenteId: componenteId || null,
      })
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      setFormError(
        isApiError(error)
          ? error.message
          : "No se pudo asociar el tipo de activo a la actividad.",
      )
    }
  }

  if (!actividad) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="size-4" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase">
                {actividad.codigo}
              </span>
            </div>
            <DialogTitle className="font-heading text-lg font-bold">
              Asociar Tipo de Activo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Vincular &quot;{actividad.nombre}&quot; a un tipo de activo específico y opcionalmente a un componente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {formError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {formError}
              </div>
            )}

            {/* Tipo de Activo */}
            <Field>
              <FieldLabel htmlFor="tipoActivoId">
                Tipo de Activo <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={tipoActivoId}
                onValueChange={(val) => {
                  setTipoActivoId(val ?? "")
                  setComponenteId("")
                }}
              >
                <SelectTrigger id="tipoActivoId" className="w-full">
                  <SelectValue>
                    {selectedTipoActivo
                      ? selectedTipoActivo.nombre
                      : "Selecciona un tipo de activo…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {tiposActivo.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Componente (Opcional) */}
            <Field>
              <FieldLabel htmlFor="componenteId">
                Componente Específico <span className="text-muted-foreground font-normal">(Opcional)</span>
              </FieldLabel>
              <Select
                value={componenteId}
                onValueChange={(val) => setComponenteId(val ?? "")}
                disabled={!tipoActivoId || componentes.length === 0}
              >
                <SelectTrigger id="componenteId" className="w-full">
                  <SelectValue>
                    {componenteId
                      ? (selectedComponente?.nombre ?? "Componente seleccionado")
                      : !tipoActivoId
                        ? "Primero selecciona un tipo de activo"
                        : componentes.length === 0
                          ? "Sin componentes registrados para este tipo"
                          : "Aplica a todos los componentes"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="">
                    Aplica a toda la unidad (sin componente específico)
                  </SelectItem>
                  {componentes.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!tipoActivoId || createMutation.isPending}
              className="gap-1.5"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Asociar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
