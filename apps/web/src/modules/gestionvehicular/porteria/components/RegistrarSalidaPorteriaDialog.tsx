import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Plus, Search, Trash2 } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { FormDialog, RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { useRegistrarSalidaPorteriaMutation } from "../api/porteria.mutations"

interface ActivoRowState {
  key: string
  activoId: string
  descripcionItem: string
  cantidad: number
  observacionSalida: string
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function ActivoSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (activoId: string) => void
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const activosQuery = useQuery(
    activoQueries.list({
      page: 0,
      size: 20,
      q: debouncedSearch || undefined,
    })
  )

  const activos = activosQuery.data?.content ?? []
  const selected = activos.find((a) => a.id === value) ?? null

  return (
    <Combobox
      items={activos}
      value={selected}
      onValueChange={(item: Activo | null) => onChange(item?.id ?? "")}
      itemToStringLabel={(item: Activo) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      isItemEqualToValue={(a: Activo, b: Activo) => a.id === b.id}
    >
      <ComboboxInput
        placeholder="Buscar activo por código o nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        showClear={Boolean(value)}
      />
      <ComboboxContent>
        <ComboboxList>
          {activosQuery.isLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-3.5 animate-spin" />
              Buscando activos...
            </div>
          ) : (
            <>
              <ComboboxEmpty>
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                  <Search className="size-3.5" />
                  Sin resultados
                </div>
              </ComboboxEmpty>
              {activos.map((activo) => (
                <ComboboxItem key={activo.id} value={activo}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {activo.codigo} - {activo.nombre}
                    </span>
                    {activo.descripcion && (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {activo.descripcion}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface RegistrarSalidaPorteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrarSalidaPorteriaDialog({
  open,
  onOpenChange,
}: RegistrarSalidaPorteriaDialogProps) {
  const mutation = useRegistrarSalidaPorteriaMutation()

  const [empleadoId, setEmpleadoId] = useState("")
  const [fechaHoraSalida, setFechaHoraSalida] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionSalida, setObservacionSalida] = useState("")
  const [items, setItems] = useState<ActivoRowState[]>([
    {
      key: crypto.randomUUID(),
      activoId: "",
      descripcionItem: "",
      cantidad: 1,
      observacionSalida: "",
    },
  ])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setEmpleadoId("")
      setFechaHoraSalida(getLocalDateTimeInputValue())
      setObservacionSalida("")
      setItems([
        {
          key: crypto.randomUUID(),
          activoId: "",
          descripcionItem: "",
          cantidad: 1,
          observacionSalida: "",
        },
      ])
      setFormError(null)
    }
  }, [open])

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        activoId: "",
        descripcionItem: "",
        cantidad: 1,
        observacionSalida: "",
      },
    ])
  }

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const updateItem = (key: string, patch: Partial<ActivoRowState>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!empleadoId) {
      setFormError("Debe seleccionar el empleado que sale.")
      return
    }

    const validItems = items.filter(
      (i) => i.activoId || i.descripcionItem.trim().length > 0
    )
    if (validItems.length === 0) {
      setFormError(
        "Debe registrar al menos un activo catalogado o una descripción de ítem."
      )
      return
    }

    const isoFecha = fechaHoraSalida
      ? new Date(fechaHoraSalida).toISOString()
      : undefined

    await mutation.mutateAsync({
      empleadoId,
      fechaHoraSalida: isoFecha,
      observacionSalida: observacionSalida.trim() || undefined,
      activos: validItems.map((i) => ({
        activoId: i.activoId || undefined,
        descripcionItem: i.descripcionItem.trim() || undefined,
        cantidad: i.cantidad > 0 ? i.cantidad : 1,
        observacionSalida: i.observacionSalida.trim() || undefined,
      })),
    })

    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Salida en Portería"
      description="Anote el empleado, hora de salida y los activos o ítems que retira."
      onSubmit={handleSubmit}
      submitLabel="Registrar Salida"
      isSubmitting={mutation.isPending}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {formError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <RequiredFieldLabel>Empleado</RequiredFieldLabel>
            <EmpleadoCombobox
              value={empleadoId}
              onValueChange={(val) => setEmpleadoId(val)}
              placeholder="Seleccionar empleado..."
            />
          </Field>

          <Field>
            <RequiredFieldLabel>Hora de Salida</RequiredFieldLabel>
            <Input
              type="datetime-local"
              value={fechaHoraSalida}
              onChange={(e) => setFechaHoraSalida(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <RequiredFieldLabel>Activos / Ítems que salen</RequiredFieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="mr-1.5 size-3.5" />
              Agregar ítem
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="rounded-lg border bg-muted/20 p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ítem #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.key)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <FieldLabel className="text-xs">
                      Activo registrado (opcional)
                    </FieldLabel>
                    <ActivoSelector
                      value={item.activoId}
                      onChange={(activoId) => updateItem(item.key, { activoId })}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <FieldLabel className="text-xs">
                      Descripción libre (si no es activo)
                    </FieldLabel>
                    <Input
                      placeholder="Ej. Maletín, radio, llaves..."
                      value={item.descripcionItem}
                      onChange={(e) =>
                        updateItem(item.key, { descripcionItem: e.target.value })
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FieldLabel className="text-xs">Cant.</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItem(item.key, {
                          cantidad: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </div>
                </div>

                <Input
                  placeholder="Observación de salida del ítem (opcional)"
                  value={item.observacionSalida}
                  onChange={(e) =>
                    updateItem(item.key, { observacionSalida: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Field>
          <FieldLabel>Observación general de salida</FieldLabel>
          <Textarea
            rows={2}
            placeholder="Motivo o detalle adicional..."
            value={observacionSalida}
            onChange={(e) => setObservacionSalida(e.target.value)}
          />
        </Field>
      </div>
    </FormDialog>
  )
}

