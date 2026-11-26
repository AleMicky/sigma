import { useId, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Package,
  ShieldCheck,
  Timer,
  XCircle,
} from "lucide-react"

import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { SegmentedRadioGroup } from "@/shared/components/segmented-radio-group"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useRegistrarLlegadaPorteriaMutation } from "../api/porteria.mutations"
import type { RegistroPorteria } from "../api/porteria.types"

interface ItemLlegadaState {
  itemId: string
  codigo: string | null
  nombre: string
  esActivo: boolean
  cantidad: number
  observacionSalida: string | null
  retornado: boolean
  observacionLlegada: string
  mostrarObservacion: boolean
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function formatDuration(totalMin: number): string {
  if (totalMin < 1) return "menos de 1 min"
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`
  return `${m} min`
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

// ───────────────────────── sub-componentes ─────────────────────────

function RetornoToggle({
  value,
  onChange,
  esEntradaInicial = false,
  name,
}: {
  value: boolean
  onChange: (retornado: boolean) => void
  esEntradaInicial?: boolean
  name: string
}) {
  return (
    <SegmentedRadioGroup<"si" | "no">
      name={name}
      ariaLabel={esEntradaInicial ? "Estado de salida" : "Estado de retorno"}
      value={value ? "si" : "no"}
      onValueChange={(next) => onChange(next === "si")}
      className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5"
      buttonClassName="inline-flex gap-1 rounded-md px-2.5 py-1 text-xs font-medium"
      options={[
        {
          value: "si",
          label: esEntradaInicial ? "Salió" : "Retornó",
          icon: <CheckCircle2 className="size-3.5" />,
          activeClassName: "bg-emerald-600 text-white shadow-sm",
        },
        {
          value: "no",
          label: esEntradaInicial ? "Se quedó" : "No retornó",
          icon: <XCircle className="size-3.5" />,
          activeClassName: "bg-destructive text-white shadow-sm",
        },
      ]}
    />
  )
}

// ───────────────────────── diálogo ─────────────────────────

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
  const fieldId = useId()
  const fechaHoraField = `${fieldId}-fecha-hora`
  const observacionField = `${fieldId}-observacion`

  const [fechaHoraLlegada, setFechaHoraLlegada] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionLlegada, setObservacionLlegada] = useState("")
  const [items, setItems] = useState<ItemLlegadaState[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    fechaHora?: string
    items: Record<string, string>
  }>({ items: {} })

  const openKey = open && registro ? registro.id : null
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null)
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey)
    if (open && registro) {
      setFechaHoraLlegada(getLocalDateTimeInputValue())
      setObservacionLlegada("")
      setFormError(null)
      setFieldErrors({ items: {} })
      setItems(
        (registro.activos ?? []).map((a) => ({
          itemId: a.id,
          codigo: a.activoCodigo,
          nombre: a.activoNombre || a.descripcionItem || "Ítem",
          esActivo: Boolean(a.activoNombre),
          cantidad: a.cantidad,
          observacionSalida: a.observacionSalida,
          retornado: true,
          observacionLlegada: "",
          mostrarObservacion: false,
        }))
      )
    }
  }

  const duracionMin = useMemo(() => {
    if (!registro || !fechaHoraLlegada) return null
    const diff =
      new Date(fechaHoraLlegada).getTime() -
      new Date(registro.fechaHoraSalida).getTime()
    return Math.floor(diff / 60000)
  }, [registro, fechaHoraLlegada])

  if (!registro) return null

  const esEntradaInicial = registro.tipoMovimiento === "ENTRADA"

  const updateItem = (itemId: string, patch: Partial<ItemLlegadaState>) => {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, ...patch } : i))
    )
  }

  const marcarTodos = (retornado: boolean) => {
    setItems((prev) => prev.map((i) => ({ ...i, retornado })))
  }

  const retornados = items.filter((i) => i.retornado).length
  const pendientes = items.length - retornados
  const progreso = items.length > 0 ? (retornados / items.length) * 100 : 100
  const fechaInvalida = duracionMin !== null && duracionMin < 0

  const handleSubmit = async () => {
    setFormError(null)

    let nextFechaError: string | undefined
    if (!fechaHoraLlegada) {
      nextFechaError = "Seleccione la fecha y hora."
    } else if (fechaInvalida) {
      nextFechaError = esEntradaInicial
        ? "La salida no puede ser anterior a la entrada."
        : "La entrada no puede ser anterior a la salida."
    }

    const nextItemErrors: Record<string, string> = {}
    for (const item of items) {
      if (!item.retornado && !item.observacionLlegada.trim()) {
        nextItemErrors[item.itemId] = esEntradaInicial
          ? "Indique por qué se quedó."
          : "Indique por qué no retornó."
      }
    }

    setFieldErrors({ fechaHora: nextFechaError, items: nextItemErrors })
    if (Object.keys(nextItemErrors).length > 0) {
      setItems((prev) =>
        prev.map((item) =>
          nextItemErrors[item.itemId]
            ? { ...item, mostrarObservacion: true }
            : item
        )
      )
    }
    if (nextFechaError || Object.keys(nextItemErrors).length > 0) return

    await mutation.mutateAsync({
      id: registro.id,
      data: {
        fechaHoraLlegada: fechaHoraLlegada
          ? new Date(fechaHoraLlegada).toISOString()
          : undefined,
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

  const conductor = registro.esExterno
    ? registro.personaExterna ?? registro.empleadoNombre ?? "Externo"
    : registro.empleadoNombre ?? registro.empleadoId

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={esEntradaInicial ? "Registrar salida" : "Registrar entrada"}
      description={
        esEntradaInicial
          ? `Complete la salida del conductor y verifique el vehículo del registro ${registro.numero}.`
          : `Complete la entrada del conductor y verifique el retorno del vehículo del registro ${registro.numero}.`
      }
      formError={formError}
      onSubmit={handleSubmit}
      size="md"
      footer={
        <FormDialogSubmit
          canSubmit={Boolean(fechaHoraLlegada) && !fechaInvalida}
          isSubmitting={mutation.isPending}
          allowInvalidSubmit
          label={
            esEntradaInicial
              ? pendientes > 0
                ? `Confirmar salida · ${pendientes} sin salir`
                : "Confirmar salida"
              : pendientes > 0
                ? `Confirmar entrada · ${pendientes} sin retornar`
                : "Confirmar entrada"
          }
          submittingLabel="Confirmando…"
        />
      }
    >
      <div className="space-y-5">
        {/* Resumen del registro */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                esEntradaInicial
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              )}
            >
              {getInitials(conductor)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {registro.esExterno ? "Persona externa" : "Conductor"}
              </p>
              <p className="truncate font-semibold">{conductor}</p>
            </div>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border">
              {registro.numero}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 border-t pt-3 text-xs sm:grid-cols-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {esEntradaInicial ? (
                <LogIn className="size-3.5 text-emerald-600" />
              ) : (
                <LogOut className="size-3.5 text-amber-600" />
              )}
              {esEntradaInicial ? "Entrada:" : "Salida:"}
              <span className="font-medium text-foreground">
                {formatDateTime(registro.fechaHoraSalida)}
              </span>
            </div>
            {registro.guardiaSalidaNombre && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                {registro.guardiaSalidaNombre}
              </div>
            )}
            {registro.observacionSalida && (
              <p className="text-muted-foreground sm:col-span-2">
                <span className="font-medium">Motivo:</span>{" "}
                {registro.observacionSalida}
              </p>
            )}
          </div>
        </div>

        {/* Hora de cierre (entrada o salida) */}
        <Field>
          <RequiredFieldLabel htmlFor={fechaHoraField}>
            <Clock className="size-3.5" />
            {esEntradaInicial ? "Hora de salida" : "Hora de entrada"}
          </RequiredFieldLabel>
          <div className="flex gap-2">
            <Input
              id={fechaHoraField}
              type="datetime-local"
              value={fechaHoraLlegada}
              onChange={(e) => {
                setFechaHoraLlegada(e.target.value)
                setFieldErrors((prev) => ({ ...prev, fechaHora: undefined }))
              }}
              aria-invalid={Boolean(fieldErrors.fechaHora)}
              aria-describedby={
                fieldErrors.fechaHora ? `${fechaHoraField}-error` : undefined
              }
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={() => {
                setFechaHoraLlegada(getLocalDateTimeInputValue())
                setFieldErrors((prev) => ({ ...prev, fechaHora: undefined }))
              }}
            >
              Ahora
            </Button>
          </div>
          <FieldError id={`${fechaHoraField}-error`}>
            {fieldErrors.fechaHora}
          </FieldError>
          {duracionMin !== null && !fechaInvalida && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              {esEntradaInicial ? "Tiempo adentro:" : "Tiempo afuera:"}{" "}
              <span className="font-medium text-foreground">
                {formatDuration(duracionMin)}
              </span>
            </p>
          )}
        </Field>

        {/* Verificación de vehículos / activos */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel className="flex items-center gap-1.5">
              <Package className="size-3.5" />
              Verificación de vehículo
            </FieldLabel>
            {items.length > 1 && (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => marcarTodos(true)}
                >
                  <CheckCheck className="mr-1 size-3.5" />
                  {esEntradaInicial ? "Todos salieron" : "Todos retornaron"}
                </Button>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Este registro no tiene vehículos asociados.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {retornados}
                    </span>{" "}
                    de {items.length}{" "}
                    {esEntradaInicial ? "salen" : "retornan"}
                  </span>
                  {pendientes > 0 && (
                    <span className="font-medium text-destructive">
                      {pendientes}{" "}
                      {esEntradaInicial ? "sin salir" : "sin retornar"}
                    </span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pendientes > 0 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-2">
                {items.map((item) => {
                  const mostrarObs =
                    item.mostrarObservacion || !item.retornado
                  const itemObsField = `${fieldId}-item-${item.itemId}`
                  const itemError = fieldErrors.items[item.itemId]
                  return (
                    <li
                      key={item.itemId}
                      className={cn(
                        "space-y-2.5 rounded-xl border p-3 transition-colors",
                        item.retornado
                          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                          : "border-destructive/40 bg-destructive/[0.04]"
                      )}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg",
                              item.retornado
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-destructive/15 text-destructive"
                            )}
                          >
                            <Package className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.nombre}
                              {item.cantidad > 1 && (
                                <span className="ml-1 font-semibold text-muted-foreground">
                                  ×{item.cantidad}
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.esActivo
                                ? item.codigo ?? "Vehículo catalogado"
                                : "Vehículo externo"}
                              {item.observacionSalida &&
                                ` · ${item.observacionSalida}`}
                            </p>
                          </div>
                        </div>
                        <RetornoToggle
                          name={`${itemObsField}-retorno`}
                          value={item.retornado}
                          esEntradaInicial={esEntradaInicial}
                          onChange={(retornado) => {
                            updateItem(item.itemId, { retornado })
                            setFieldErrors((prev) => {
                              const nextItems = { ...prev.items }
                              delete nextItems[item.itemId]
                              return { ...prev, items: nextItems }
                            })
                          }}
                        />
                      </div>

                      {mostrarObs ? (
                        <>
                          <FieldLabel htmlFor={itemObsField} className="sr-only">
                            {item.nombre}:{" "}
                            {esEntradaInicial
                              ? "motivo por el que se quedó"
                              : "motivo por el que no retornó"}
                          </FieldLabel>
                          <Input
                            id={itemObsField}
                            placeholder={
                              item.retornado
                                ? "Observación (estado, daños, etc.)"
                                : esEntradaInicial
                                  ? "Motivo por el que se quedó *"
                                  : "Motivo por el que no retornó *"
                            }
                            value={item.observacionLlegada}
                            aria-invalid={Boolean(itemError)}
                            aria-describedby={
                              itemError ? `${itemObsField}-error` : undefined
                            }
                            onChange={(e) => {
                              updateItem(item.itemId, {
                                observacionLlegada: e.target.value,
                              })
                              if (itemError) {
                                setFieldErrors((prev) => {
                                  const nextItems = { ...prev.items }
                                  delete nextItems[item.itemId]
                                  return { ...prev, items: nextItems }
                                })
                              }
                            }}
                          />
                          <FieldError id={`${itemObsField}-error`}>
                            {itemError}
                          </FieldError>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(item.itemId, {
                              mostrarObservacion: true,
                            })
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

              {pendientes > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {esEntradaInicial
                      ? `${pendientes} vehículo(s) quedará(n) registrado(s) como no salido(s).`
                      : `${pendientes} vehículo(s) quedará(n) registrado(s) como no retornado(s).`}{" "}
                    Indique el motivo en cada uno.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Observación general */}
        <Field>
          <FieldLabel htmlFor={observacionField} className="flex items-center gap-1.5">
            {esEntradaInicial ? (
              <LogOut className="size-3.5" />
            ) : (
              <LogIn className="size-3.5" />
            )}
            {esEntradaInicial
              ? "Observación general de salida"
              : "Observación general de entrada"}
          </FieldLabel>
          <Textarea
            id={observacionField}
            rows={2}
            placeholder={
              esEntradaInicial
                ? "Novedades al salir..."
                : "Novedades al ingresar..."
            }
            value={observacionLlegada}
            onChange={(e) => setObservacionLlegada(e.target.value)}
          />
        </Field>
      </div>
    </FormDialog>
  )
}
