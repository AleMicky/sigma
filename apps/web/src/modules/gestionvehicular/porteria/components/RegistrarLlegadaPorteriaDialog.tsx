import { useEffect, useState } from "react"

import { FormDialog, RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import { useRegistrarLlegadaPorteriaMutation } from "../api/porteria.mutations"
import type { RegistroPorteria } from "../api/porteria.types"

interface ItemLlegadaState {
  itemId: string
  label: string
  cantidad: number
  retornado: boolean
  observacionLlegada: string
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface RegistrarLlegadaPorteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registro: RegistroPorteria | null
}

export function RegistrarLlegadaPorteriaDialog({
  open,
  onOpenChange,
  registro,
}: RegistrarLlegadaPorteriaDialogProps) {
  const mutation = useRegistrarLlegadaPorteriaMutation()

  const [fechaHoraLlegada, setFechaHoraLlegada] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionLlegada, setObservacionLlegada] = useState("")
  const [items, setItems] = useState<ItemLlegadaState[]>([])

  useEffect(() => {
    if (open && registro) {
      setFechaHoraLlegada(getLocalDateTimeInputValue())
      setObservacionLlegada("")
      setItems(
        registro.activos.map((a) => ({
          itemId: a.id,
          label: a.activoNombre
            ? `${a.activoCodigo ?? ""} - ${a.activoNombre}`
            : a.descripcionItem || "Ítem",
          cantidad: a.cantidad,
          retornado: true,
          observacionLlegada: "",
        }))
      )
    }
  }, [open, registro])

  if (!registro) return null

  const updateItem = (itemId: string, patch: Partial<ItemLlegadaState>) => {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, ...patch } : i))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isoLlegada = fechaHoraLlegada
      ? new Date(fechaHoraLlegada).toISOString()
      : undefined

    await mutation.mutateAsync({
      id: registro.id,
      data: {
        fechaHoraLlegada: isoLlegada,
        observacionLlegada: observacionLlegada.trim() || undefined,
        activos: items.map((i) => ({
          itemId: i.itemId,
          retornado: i.retornado,
          observacionLlegada: i.observacionLlegada.trim() || undefined,
        })),
      },
    })

    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Registrar Llegada - ${registro.numero}`}
      description={`Empleado: ${registro.empleadoNombre ?? registro.empleadoId}`}
      onSubmit={handleSubmit}
      submitLabel="Confirmar Llegada"
      isSubmitting={mutation.isPending}
      maxWidth="xl"
    >
      <div className="space-y-4">
        <Field>
          <RequiredFieldLabel>Hora de Llegada</RequiredFieldLabel>
          <Input
            type="datetime-local"
            value={fechaHoraLlegada}
            onChange={(e) => setFechaHoraLlegada(e.target.value)}
            required
          />
        </Field>

        <div className="space-y-2">
          <FieldLabel>Verificación de activos retornados</FieldLabel>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="rounded-lg border bg-muted/20 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <Checkbox
                      checked={item.retornado}
                      onCheckedChange={(checked) =>
                        updateItem(item.itemId, { retornado: Boolean(checked) })
                      }
                    />
                    <span>
                      {item.label} (x{item.cantidad})
                    </span>
                  </label>
                  <span
                    className={
                      item.retornado
                        ? "text-xs font-medium text-emerald-600"
                        : "text-xs font-medium text-amber-600"
                    }
                  >
                    {item.retornado ? "Retorna" : "No retorna"}
                  </span>
                </div>

                <Input
                  placeholder="Observación de llegada del ítem (opcional)"
                  value={item.observacionLlegada}
                  onChange={(e) =>
                    updateItem(item.itemId, {
                      observacionLlegada: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Field>
          <FieldLabel>Observación general de llegada</FieldLabel>
          <Textarea
            rows={2}
            placeholder="Novedades al retorno..."
            value={observacionLlegada}
            onChange={(e) => setObservacionLlegada(e.target.value)}
          />
        </Field>
      </div>
    </FormDialog>
  )
}

