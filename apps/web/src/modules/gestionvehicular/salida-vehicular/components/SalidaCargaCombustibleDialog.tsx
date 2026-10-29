import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Car,
  CheckCircle2,
  Compass,
  DollarSign,
  Droplet,
  Fuel,
  Loader2,
  Plus,
  Receipt,
  Trash2,
  User,
  X,
} from "lucide-react"

import {
  useCreateCargaCombustible,
  useDeleteCargaCombustible,
} from "@/modules/gestionvehicular/carga-combustible/api/carga-combustible.mutations"
import { cargaCombustibleQueries } from "@/modules/gestionvehicular/carga-combustible/api/carga-combustible.queries"
import type { CargaCombustible } from "@/modules/gestionvehicular/carga-combustible/api/carga-combustible.service"
import { insumoQueries } from "@/modules/inventarios/insumo/api/insumo.queries"
import type { Insumo } from "@/modules/inventarios/insumo/api/insumo.service"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { formatDate } from "@/shared/utils/date.utils"

import type { SalidaVehicular } from "../api/salida-vehicular.types"

export interface SalidaCargaCombustibleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salida: SalidaVehicular | null
  readOnly?: boolean
}

function getLocalCurrentIsoString(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

interface SalidaCargaCombustibleFormProps {
  salida: SalidaVehicular
  insumos: Insumo[]
  onSuccess: () => void
  onCancel: () => void
}

function SalidaCargaCombustibleForm({
  salida,
  insumos,
  onSuccess,
  onCancel,
}: Readonly<SalidaCargaCombustibleFormProps>) {
  const defaultInsumoId = useMemo(() => {
    const fuel =
      insumos.find((i) => /gasolina|diesel|combustible/i.test(i.nombre)) ||
      insumos[0]
    return fuel?.id || ""
  }, [insumos])

  const [insumoId, setInsumoId] = useState<string>(defaultInsumoId)
  const [litros, setLitros] = useState<string>("")
  const [precioTotal, setPrecioTotal] = useState<string>("")
  const [numeroFactura, setNumeroFactura] = useState<string>("")
  const [fechaCarga, setFechaCarga] = useState<string>(getLocalCurrentIsoString)
  const [empleadoId, setEmpleadoId] = useState<string>(salida.empleadoId ?? "")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        })
      },
      () => {
        // Silencioso si no hay permiso GPS
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    )
  }, [])

  const activeInsumoId = insumoId || defaultInsumoId
  const activeEmpleadoId = empleadoId || salida.empleadoId || ""

  const calculatedUnitPrice = useMemo(() => {
    const l = parseFloat(litros)
    const p = parseFloat(precioTotal)
    if (!Number.isNaN(l) && l > 0 && !Number.isNaN(p) && p >= 0) {
      return (p / l).toFixed(2)
    }
    return null
  }, [litros, precioTotal])

  const createMutation = useCreateCargaCombustible()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salida.activoId || !activeInsumoId || !activeEmpleadoId) return

    const parsedLitros = parseFloat(litros)
    const parsedPrecio = parseFloat(precioTotal)
    if (Number.isNaN(parsedLitros) || parsedLitros <= 0) return
    if (Number.isNaN(parsedPrecio) || parsedPrecio < 0) return

    await createMutation.mutateAsync({
      activoId: salida.activoId,
      salidaVehicularId: salida.id,
      insumoId: activeInsumoId,
      litros: parsedLitros,
      precioTotal: parsedPrecio,
      numeroFactura: numeroFactura.trim() ? numeroFactura.trim() : null,
      fechaCarga: new Date(fechaCarga).toISOString(),
      empleadoId: activeEmpleadoId,
      latitud: coords?.lat ?? null,
      longitud: coords?.lng ?? null,
    })

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Fuel className="size-4 text-amber-500 shrink-0" />
          <p className="text-muted-foreground">
            Registra la carga de combustible realizada durante la salida{" "}
            <strong className="text-foreground font-mono">{salida.numero}</strong>. Se
            añadirá automáticamente una entrada en la bitácora del recorrido.
          </p>
        </div>
        {coords && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
            <Compass className="size-3" />
            GPS activo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Tipo de Insumo / Combustible */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Droplet className="size-3 text-amber-500" />
            Tipo de Combustible / Insumo *
          </Label>
          <select
            value={activeInsumoId}
            onChange={(e) => setInsumoId(e.target.value)}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {insumos.length === 0 && (
              <option value="">Cargando combustibles...</option>
            )}
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre} {i.codigo ? `(${i.codigo})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Litros cargados */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Fuel className="size-3 text-primary" />
            Litros Cargados *
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Ej. 45.50"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Precio Total */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <DollarSign className="size-3 text-emerald-500" />
            Precio Total (Bs.) *
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 170.00"
            value={precioTotal}
            onChange={(e) => setPrecioTotal(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Preview Unitario */}
        {calculatedUnitPrice && (
          <div className="sm:col-span-2 bg-emerald-500/10 border border-emerald-500/25 rounded-md px-3 py-1.5 flex items-center justify-between text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
              Precio calculado por litro:
            </span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200">
              {calculatedUnitPrice} Bs. / Litro
            </span>
          </div>
        )}

        {/* Número de Factura / Recibo */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Receipt className="size-3 text-muted-foreground" />
            Nº Factura o Recibo
          </Label>
          <Input
            type="text"
            placeholder="Ej. FAC-98234"
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Fecha y Hora de Carga */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            Fecha y Hora de Carga *
          </Label>
          <Input
            type="datetime-local"
            value={fechaCarga}
            onChange={(e) => setFechaCarga(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Empleado Conductor Responsable */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <User className="size-3 text-muted-foreground" />
            Empleado Responsable / Conductor *
          </Label>
          <EmpleadoCombobox
            value={activeEmpleadoId}
            onValueChange={(val) => setEmpleadoId(val)}
            placeholder="Seleccionar empleado o conductor..."
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={createMutation.isPending}
          className="h-8 text-xs cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending}
          className="h-8 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5" />
              <span>Registrar Carga</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function SalidaCargaCombustibleDialog({
  open,
  onOpenChange,
  salida,
  readOnly = false,
}: Readonly<SalidaCargaCombustibleDialogProps>) {
  const [viewMode, setViewMode] = useState<"list" | "create">("list")
  const [deleteTarget, setDeleteTarget] = useState<CargaCombustible | null>(null)

  const salidaId = salida?.id ?? ""

  const cargasQuery = useQuery({
    ...cargaCombustibleQueries.bySalida(salidaId),
    enabled: Boolean(open && salidaId),
    staleTime: 1000 * 30,
  })

  const cargas = useMemo(() => cargasQuery.data ?? [], [cargasQuery.data])

  const insumosQuery = useQuery({
    ...insumoQueries.list({ size: 100 }),
    enabled: Boolean(open),
    staleTime: 1000 * 60 * 10,
  })
  const insumos = useMemo(
    () => (insumosQuery.data?.content ?? []) as Insumo[],
    [insumosQuery.data?.content]
  )

  const totalLitros = useMemo(
    () => cargas.reduce((acc, c) => acc + (Number(c.litros) || 0), 0),
    [cargas]
  )
  const totalGasto = useMemo(
    () => cargas.reduce((acc, c) => acc + (Number(c.precioTotal) || 0), 0),
    [cargas]
  )
  const promedioPorLitro = useMemo(
    () => (totalLitros > 0 ? totalGasto / totalLitros : 0),
    [totalGasto, totalLitros]
  )

  const deleteMutation = useDeleteCargaCombustible()

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setViewMode("list")
    }
    onOpenChange(isOpen)
  }

  const vehiculoLabel = salida?.marca
    ? `${salida.marca} ${salida.modelo ?? ""}`.trim()
    : salida?.activoDescripcion ?? "Vehículo Asignado"
  const placaLabel = salida?.placa ?? salida?.activoCodigo ?? "S/P"

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border border-border/80 shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-card/60 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500 shadow-inner">
                  <Fuel className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">
                      Combustible en Salida Vehicular
                    </DialogTitle>
                    {salida?.numero && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {salida.numero}
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-2 flex-wrap">
                    {salida && (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <Car className="size-3 text-amber-500" />
                        {vehiculoLabel}
                        <span className="font-mono text-[10.5px] font-bold text-amber-500">
                          ({placaLabel})
                        </span>
                      </span>
                    )}
                    {salida?.empleadoNombre && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <User className="size-3 text-emerald-500" />
                        {salida.empleadoNombre}
                      </span>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  {viewMode === "list" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setViewMode("create")}
                      className="gap-1.5 h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Nueva Carga</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode("list")}
                      className="gap-1.5 h-8 text-xs font-medium cursor-pointer"
                    >
                      <X className="size-3.5" />
                      <span>Ver Cargas</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Resumen Métricas */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/40 text-[11px]">
              <div className="bg-muted/40 rounded-lg p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Cargas
                </span>
                <span className="text-sm font-bold text-foreground">
                  {cargas.length}
                </span>
              </div>
              <div className="bg-muted/40 rounded-lg p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Litros Totales
                </span>
                <span className="text-sm font-bold text-amber-500">
                  {totalLitros.toFixed(2)} L
                </span>
              </div>
              <div className="bg-muted/40 rounded-lg p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Gasto Total
                </span>
                <span className="text-sm font-bold text-emerald-500">
                  {totalGasto.toFixed(2)} Bs.
                </span>
              </div>
              <div className="bg-muted/40 rounded-lg p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                  Promedio
                </span>
                <span className="text-sm font-bold text-sky-500 font-mono">
                  {promedioPorLitro > 0 ? `${promedioPorLitro.toFixed(2)} Bs./L` : "-"}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {viewMode === "create" && salida ? (
              <SalidaCargaCombustibleForm
                salida={salida}
                insumos={insumos}
                onSuccess={() => setViewMode("list")}
                onCancel={() => setViewMode("list")}
              />
            ) : (
              <div className="space-y-3">
                {cargasQuery.isLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                    <Loader2 className="size-5 animate-spin text-amber-500" />
                    <span>Cargando registros de combustible...</span>
                  </div>
                ) : cargas.length === 0 ? (
                  <div className="py-10 border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                    <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                      <Fuel className="size-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      No hay cargas de combustible en esta salida
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Registra las cargas de combustible realizadas durante este recorrido para llevar el control de litros y gasto.
                    </p>
                    {!readOnly && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setViewMode("create")}
                        className="mt-4 gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Registrar Primera Carga</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cargas.map((carga) => {
                      const l = Number(carga.litros) || 0
                      const p = Number(carga.precioTotal) || 0
                      const unit =
                        carga.precioPorLitro ?? (l > 0 ? p / l : null)

                      return (
                        <div
                          key={carga.id}
                          className="group relative rounded-xl border border-border/80 bg-card p-3 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground flex items-center gap-1">
                                <Fuel className="size-3.5 text-amber-500 shrink-0" />
                                {carga.insumo?.nombre || "Combustible"}
                              </span>
                              {carga.numeroFactura && (
                                <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-muted text-foreground/80 border border-border/60">
                                  Fac: {carga.numeroFactura}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3 text-muted-foreground shrink-0" />
                                {formatDate(carga.fechaCarga)}
                              </span>
                              {carga.empleado && (
                                <span className="flex items-center gap-1 truncate">
                                  <User className="size-3 text-muted-foreground shrink-0" />
                                  {carga.empleado.nombreCompleto}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                            <div className="text-right">
                              <div className="font-bold text-foreground">
                                <span className="font-mono text-amber-500 font-black">
                                  {l.toFixed(2)} L
                                </span>
                                <span className="text-muted-foreground mx-1">•</span>
                                <span className="font-mono text-emerald-500 font-black">
                                  {p.toFixed(2)} Bs.
                                </span>
                              </div>
                              {unit !== null && (
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {unit.toFixed(2)} Bs./L
                                </div>
                              )}
                            </div>

                            {!readOnly && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteTarget(carga)}
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Eliminar registro de combustible"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleModalOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null)
        }}
        title="¿Eliminar registro de combustible?"
        description={`Se eliminará el registro de carga de ${deleteTarget?.litros ?? 0} litros por un importe de ${deleteTarget?.precioTotal ?? 0} Bs. Esta acción no se puede deshacer.`}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}

