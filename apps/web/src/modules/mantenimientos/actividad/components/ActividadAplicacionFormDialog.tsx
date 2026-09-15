import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Layers, Loader2, Plus } from "lucide-react"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { componenteQueries } from "@/modules/activos/componente/api/componente.queries"
import type { Componente } from "@/modules/activos/componente/api/componente.service"
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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"

import { useCreateActividadAplicacion } from "../api/actividad-aplicacion.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadAplicacionFormDialogProps = {
  actividad: ActividadMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const NONE_COMPONENTE = "NONE"

export function ActividadAplicacionFormDialog({
  actividad,
  open,
  onOpenChange,
  onSuccess,
}: ActividadAplicacionFormDialogProps) {
  const [tipoActivoId, setTipoActivoId] = useState<string>("")
  const [componenteId, setComponenteId] = useState<string>(NONE_COMPONENTE)
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
    () => tiposActivo.find((t) => t.id === tipoActivoId) ?? null,
    [tiposActivo, tipoActivoId],
  )

  const selectedComponente = useMemo(
    () =>
      componenteId && componenteId !== NONE_COMPONENTE
        ? componentes.find((c) => c.id === componenteId) ?? null
        : null,
    [componentes, componenteId],
  )

  function resetForm() {
    setTipoActivoId("")
    setComponenteId(NONE_COMPONENTE)
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
        componenteId:
          componenteId && componenteId !== NONE_COMPONENTE
            ? componenteId
            : null,
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

            {/* Tipo de Activo Autocomplete */}
            <Field>
              <FieldLabel htmlFor="tipoActivoId">
                Tipo de Activo <span className="text-destructive">*</span>
              </FieldLabel>
              <Combobox
                items={tiposActivo}
                itemToStringLabel={(item: TipoActivo) => item?.nombre ?? ""}
                itemToStringValue={(item: TipoActivo) => item?.id ?? ""}
                value={selectedTipoActivo}
                onValueChange={(val: TipoActivo | null) => {
                  setTipoActivoId(val?.id ?? "")
                  setComponenteId(NONE_COMPONENTE)
                }}
                disabled={tiposActivoQuery.isLoading || createMutation.isPending}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    id="tipoActivoId"
                    placeholder={
                      tiposActivoQuery.isLoading
                        ? "Cargando tipos de activo..."
                        : "Buscar tipo de activo..."
                    }
                    className="w-full text-xs"
                    showClear
                  />
                  {tiposActivoQuery.isLoading && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <ComboboxContent className="z-50 max-h-60 min-w-[280px]">
                  <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                    {tiposActivoQuery.isLoading
                      ? "Cargando tipos de activo..."
                      : "No se encontraron tipos de activo."}
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
            </Field>

            {/* Componente Específico (Opcional) Autocomplete */}
            <Field>
              <FieldLabel htmlFor="componenteId">
                Componente Específico <span className="text-muted-foreground font-normal">(Opcional)</span>
              </FieldLabel>
              <Combobox
                items={componentes}
                itemToStringLabel={(item: Componente) =>
                  item ? `${item.codigo ? `${item.codigo} - ` : ""}${item.nombre}` : ""
                }
                itemToStringValue={(item: Componente) => item?.id ?? ""}
                value={selectedComponente}
                onValueChange={(val: Componente | null) => {
                  setComponenteId(val?.id ?? NONE_COMPONENTE)
                }}
                disabled={
                  !tipoActivoId ||
                  componentesQuery.isLoading ||
                  componentes.length === 0 ||
                  createMutation.isPending
                }
              >
                <div className="relative w-full">
                  <ComboboxInput
                    id="componenteId"
                    placeholder={
                      !tipoActivoId
                        ? "Primero selecciona un tipo de activo"
                        : componentesQuery.isLoading
                          ? "Cargando componentes..."
                          : componentes.length === 0
                            ? "Sin componentes registrados (aplica a toda la unidad)"
                            : "Buscar componente…"
                    }
                    className="w-full text-xs"
                    showClear
                  />
                  {componentesQuery.isLoading && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <ComboboxContent className="z-50 max-h-60 min-w-[280px]">
                  <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                    {componentesQuery.isLoading
                      ? "Cargando componentes..."
                      : "No se encontraron componentes."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: Componente) => (
                      <ComboboxItem
                        key={item.id}
                        value={item}
                        className="cursor-pointer py-1.5 px-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.codigo && (
                            <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {item.codigo}
                            </code>
                          )}
                          <span className="font-medium text-foreground truncate">
                            {item.nombre}
                          </span>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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

