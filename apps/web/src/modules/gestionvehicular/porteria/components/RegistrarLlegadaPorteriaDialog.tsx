import { useEffect, useMemo, useState } from "react"
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
import { Button } from "@/shared/components/ui/button"
import { Field, FieldLabel } from "@/shared/components/ui/field"
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
}: {
  value: boolean
  onChange: (retornado: boolean) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Estado de retorno"
      className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value}
        onClick={() => onChange(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          value
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CheckCircle2 className="size-3.5" />
        Retornó
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        onClick={() => onChange(false)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          !value
            ? "bg-destructive text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <XCircle className="size-3.5" />
        No retornó
      </button>
    </div>
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

  const [fechaHoraLlegada, setFechaHoraLlegada] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionLlegada, setObservacionLlegada] = useState("")
  const [items, setItems] = useState<ItemLlegadaState[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open && registro) {
      setFechaHoraLlegada(getLocalDateTimeInputValue())
      setObservacionLlegada("")
      setFormError(null)
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
  }, [open, registro])

  const duracionMin = useMemo(() => {
    if (!registro || !fechaHoraLlegada) return null
    const diff =
      new Date(fechaHoraLlegada).getTime() -
      new Date(registro.fechaHoraSalida).getTime()
    return Math.floor(diff / 60000)
  }, [registro, fechaHoraLlegada])

  if (!registro) return null

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

    if (fechaInvalida) {
      setFormError("La hora de llegada no puede ser anterior a la de salida.")
      return
    }
    const sinMotivo = items.find(
      (i) => !i.retornado && !i.observacionLlegada.trim()
    )
    if (sinMotivo) {
      setFormError(
        `Indique el motivo por el que "${sinMotivo.nombre}" no retornó.`
      )
      updateItem(sinMotivo.itemId, { mostrarObservacion: true })
      return
    }

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

  const funcionario = registro.empleadoNombre ?? registro.empleadoId

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar llegada"
      description={`Verifique el retorno del funcionario y de los activos del registro ${registro.numero}.`}
      formError={formError}
      onSubmit={handleSubmit}
      size="md"
      footer={
        <FormDialogSubmit
          canSubmit={Boolean(fechaHoraLlegada) && !fechaInvalida}
          isSubmitting={mutation.isPending}
          label={
            pendientes > 0
              ? `Confirmar llegada · ${pendientes} sin retornar`
              : "Confirmar llegada"
          }
          submittingLabel="Confirmando…"
        />
      }
    >
      <div className="space-y-5">
        {/* Resumen del registro */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-700 dark:text-amber-400">
              {getInitials(registro.empleadoNombre)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Funcionario</p>
              <p className="truncate font-semibold">{funcionario}</p>
            </div>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border">
              {registro.numero}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 border-t pt-3 text-xs sm:grid-cols-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LogOut className="size-3.5 text-amber-600" />
              Salida:
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

        {/* Hora de llegada */}
        <Field>
          <RequiredFieldLabel>
            <Clock className="size-3.5" />
            Hora de llegada
          </RequiredFieldLabel>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={fechaHoraLlegada}
              onChange={(e) => setFechaHoraLlegada(e.target.value)}
              aria-invalid={fechaInvalida || undefined}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={() => setFechaHoraLlegada(getLocalDateTimeInputValue())}
            >
              Ahora
            </Button>
          </div>
          {duracionMin !== null && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-xs",
                fechaInvalida ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {fechaInvalida ? (
                <>
                  <AlertTriangle className="size-3.5" />
                  La llegada es anterior a la salida.
                </>
              ) : (
                <>
                  <Timer className="size-3.5" />
                  Tiempo fuera:{" "}
                  <span className="font-medium text-foreground">
                    {formatDuration(duracionMin)}
                  </span>
                </>
              )}
            </p>
          )}
        </Field>

        {/* Verificación de activos */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel className="flex items-center gap-1.5">
              <Package className="size-3.5" />
              Verificación de activos
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
                  Todos retornaron
                </Button>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Este registro no tiene activos asociados.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {retornados}
                    </span>{" "}
                    de {items.length} retornan
                  </span>
                  {pendientes > 0 && (
                    <span className="font-medium text-destructive">
                      {pendientes} sin retornar
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
                                ? item.codigo ?? "Activo catalogado"
                                : "Ítem libre"}
                              {item.observacionSalida &&
                                ` · ${item.observacionSalida}`}
                            </p>
                          </div>
                        </div>
                        <RetornoToggle
                          value={item.retornado}
                          onChange={(retornado) =>
                            updateItem(item.itemId, { retornado })
                          }
                        />
                      </div>

                      {mostrarObs ? (
                        <Input
                          placeholder={
                            item.retornado
                              ? "Observación (estado, daños, etc.)"
                              : "Motivo por el que no retornó *"
                          }
                          value={item.observacionLlegada}
                          aria-invalid={
                            (!item.retornado &&
                              Boolean(formError) &&
                              !item.observacionLlegada.trim()) ||
                            undefined
                          }
                          onChange={(e) =>
                            updateItem(item.itemId, {
                              observacionLlegada: e.target.value,
                            })
                          }
                        />
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
                    {pendientes === 1
                      ? "1 activo quedará registrado como no retornado."
                      : `${pendientes} activos quedarán registrados como no retornados.`}{" "}
                    Indique el motivo en cada uno.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Observación general */}
        <Field>
          <FieldLabel className="flex items-center gap-1.5">
            <LogIn className="size-3.5" />
            Observación general de llegada
          </FieldLabel>
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
