import { useEffect, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Barcode,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquarePlus,
  Minus,
  Package,
  PenLine,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
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
import { cn, generateId } from "@/shared/lib/utils"

import { useRegistrarSalidaPorteriaMutation } from "../api/porteria.mutations"

type ItemModo = "activo" | "libre"

interface ActivoRowState {
  key: string
  modo: ItemModo
  activo: Activo | null
  descripcionItem: string
  cantidad: number
  observacionSalida: string
  mostrarObservacion: boolean
}

/** Sugerencias rápidas para ítems no catalogados frecuentes. */
const SUGERENCIAS_RAPIDAS = [
  "Laptop",
  "Maletín",
  "Llaves",
  "Radio",
  "Herramientas",
  "Documentos",
]

function nuevoItem(patch: Partial<ActivoRowState> = {}): ActivoRowState {
  return {
    key: generateId(),
    modo: "activo",
    activo: null,
    descripcionItem: "",
    cantidad: 1,
    observacionSalida: "",
    mostrarObservacion: false,
    ...patch,
  }
}

function esItemValido(item: ActivoRowState): boolean {
  return item.modo === "activo"
    ? Boolean(item.activo)
    : item.descripcionItem.trim().length > 0
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// ───────────────────────── sub-componentes ─────────────────────────

function SectionTitle({
  step,
  title,
  description,
  action,
}: {
  step: number
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

function ActivoSelector({
  value,
  onChange,
}: {
  value: Activo | null
  onChange: (activo: Activo | null) => void
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

  return (
    <Combobox
      items={activos}
      value={value}
      onValueChange={(item: Activo | null) => onChange(item ?? null)}
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
                      <span className="font-mono text-xs text-muted-foreground">
                        {activo.codigo}
                      </span>{" "}
                      {activo.nombre}
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

function ModoToggle({
  value,
  onChange,
}: {
  value: ItemModo
  onChange: (modo: ItemModo) => void
}) {
  const opciones: { value: ItemModo; label: string; icon: typeof Barcode }[] = [
    { value: "activo", label: "Activo catalogado", icon: Barcode },
    { value: "libre", label: "Ítem libre", icon: PenLine },
  ]
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-lg border bg-muted/40 p-0.5"
    >
      {opciones.map((op) => {
        const Icon = op.icon
        const active = value === op.value
        return (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(op.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {op.label}
          </button>
        )
      })}
    </div>
  )
}

function CantidadStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex h-9 items-center rounded-md border">
      <button
        type="button"
        aria-label="Disminuir cantidad"
        className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="size-3.5" />
      </button>
      <input
        type="number"
        min={1}
        aria-label="Cantidad"
        className="h-full w-10 border-x bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      />
      <button
        type="button"
        aria-label="Aumentar cantidad"
        className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

// ───────────────────────── diálogo ─────────────────────────

interface RegistrarSalidaPorteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrarSalidaPorteriaDialog({
  open,
  onOpenChange,
}: RegistrarSalidaPorteriaDialogProps) {
  const mutation = useRegistrarSalidaPorteriaMutation()

  const [funcionarioId, setFuncionarioId] = useState("")
  const [fechaHoraSalida, setFechaHoraSalida] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionSalida, setObservacionSalida] = useState("")
  const [items, setItems] = useState<ActivoRowState[]>(() => [nuevoItem()])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFuncionarioId("")
      setFechaHoraSalida(getLocalDateTimeInputValue())
      setObservacionSalida("")
      setItems([nuevoItem()])
      setFormError(null)
    }
  }, [open])

  const updateItem = (key: string, patch: Partial<ActivoRowState>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  const handleAddItem = (patch?: Partial<ActivoRowState>) => {
    setItems((prev) => {
      // Si hay una única fila vacía, reutilizarla en lugar de agregar otra.
      if (patch && prev.length === 1 && !esItemValido(prev[0])) {
        return [{ ...prev[0], ...patch }]
      }
      return [...prev, nuevoItem(patch)]
    })
  }

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const itemsValidos = items.filter(esItemValido)
  const totalUnidades = itemsValidos.reduce((acc, i) => acc + i.cantidad, 0)

  const handleSubmit = async () => {
    setFormError(null)

    if (!funcionarioId) {
      setFormError("Debe seleccionar el funcionario que sale.")
      return
    }
    if (itemsValidos.length === 0) {
      setFormError(
        "Debe registrar al menos un activo catalogado o un ítem libre."
      )
      return
    }

    await mutation.mutateAsync({
      empleadoId: funcionarioId,
      fechaHoraSalida: fechaHoraSalida
        ? new Date(fechaHoraSalida).toISOString()
        : undefined,
      observacionSalida: observacionSalida.trim() || undefined,
      activos: itemsValidos.map((i) => ({
        activoId: i.modo === "activo" ? i.activo?.id : undefined,
        descripcionItem:
          i.modo === "libre" ? i.descripcionItem.trim() : undefined,
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
      title="Registrar salida en portería"
      description="Indique el funcionario, la hora y los activos o ítems que retira."
      formError={formError}
      onSubmit={handleSubmit}
      size="lg"
      footer={
        <FormDialogSubmit
          canSubmit={Boolean(funcionarioId) && itemsValidos.length > 0}
          isSubmitting={mutation.isPending}
          label={
            itemsValidos.length > 0
              ? `Registrar salida · ${totalUnidades} ítem(s)`
              : "Registrar salida"
          }
          submittingLabel="Registrando…"
        />
      }
    >
      <div className="space-y-6">
        {/* Paso 1: funcionario y hora */}
        <section className="space-y-3">
          <SectionTitle
            step={1}
            title="¿Quién sale?"
            description="Funcionario y hora de salida."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <Field className="sm:col-span-3">
              <RequiredFieldLabel>
                <UserRound className="size-3.5" />
                Funcionario
              </RequiredFieldLabel>
              <EmpleadoCombobox
                value={funcionarioId}
                onValueChange={(val) => setFuncionarioId(val)}
                placeholder="Buscar funcionario..."
              />
            </Field>

            <Field className="sm:col-span-2">
              <RequiredFieldLabel>
                <Clock className="size-3.5" />
                Hora de salida
              </RequiredFieldLabel>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={fechaHoraSalida}
                  onChange={(e) => setFechaHoraSalida(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={() =>
                    setFechaHoraSalida(getLocalDateTimeInputValue())
                  }
                >
                  Ahora
                </Button>
              </div>
            </Field>
          </div>
        </section>

        {/* Paso 2: activos / ítems */}
        <section className="space-y-3">
          <SectionTitle
            step={2}
            title="¿Qué lleva?"
            description="Activos registrados o ítems de descripción libre."
            action={
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  itemsValidos.length > 0
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {itemsValidos.length} de {items.length} listo(s)
              </span>
            }
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Agregar rápido:
            </span>
            {SUGERENCIAS_RAPIDAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  handleAddItem({ modo: "libre", descripcionItem: s })
                }
                className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="size-3" />
                {s}
              </button>
            ))}
          </div>

          <ul className="space-y-2.5">
            {items.map((item, idx) => {
              const valido = esItemValido(item)
              return (
                <li
                  key={item.key}
                  className={cn(
                    "space-y-3 rounded-xl border p-3 transition-colors",
                    valido
                      ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                      : "bg-muted/20"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                          valido
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {valido ? <CheckCircle2 className="size-3.5" /> : idx + 1}
                      </span>
                      <ModoToggle
                        value={item.modo}
                        onChange={(modo) =>
                          updateItem(item.key, {
                            modo,
                            activo: null,
                            descripcionItem: "",
                          })
                        }
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Quitar ítem ${idx + 1}`}
                        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveItem(item.key)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-end gap-2.5">
                    <div className="min-w-0 flex-1">
                      {item.modo === "activo" ? (
                        <ActivoSelector
                          value={item.activo}
                          onChange={(activo) =>
                            updateItem(item.key, { activo })
                          }
                        />
                      ) : (
                        <Input
                          placeholder="Ej. Maletín, radio, llaves..."
                          value={item.descripcionItem}
                          onChange={(e) =>
                            updateItem(item.key, {
                              descripcionItem: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                    <CantidadStepper
                      value={item.cantidad}
                      onChange={(cantidad) =>
                        updateItem(item.key, { cantidad })
                      }
                    />
                  </div>

                  {item.mostrarObservacion ? (
                    <Input
                      autoFocus
                      placeholder="Observación del ítem (estado, serie, motivo...)"
                      value={item.observacionSalida}
                      onChange={(e) =>
                        updateItem(item.key, {
                          observacionSalida: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(item.key, { mostrarObservacion: true })
                      }
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      <MessageSquarePlus className="size-3.5" />
                      Agregar observación
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => handleAddItem()}
          >
            <Package className="mr-1.5 size-4" />
            Agregar otro ítem
          </Button>
        </section>

        {/* Paso 3: observación general */}
        <section className="space-y-3">
          <SectionTitle
            step={3}
            title="Observaciones"
            description="Opcional. Motivo de la salida o detalle adicional."
          />
          <Field>
            <FieldLabel className="sr-only">
              Observación general de salida
            </FieldLabel>
            <Textarea
              rows={2}
              placeholder="Ej. Comisión de servicio a oficina regional..."
              value={observacionSalida}
              onChange={(e) => setObservacionSalida(e.target.value)}
            />
          </Field>
        </section>
      </div>
    </FormDialog>
  )
}
