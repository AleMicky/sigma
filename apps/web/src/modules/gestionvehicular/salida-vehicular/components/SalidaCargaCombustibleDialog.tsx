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
import { cn } from "@/shared/lib/utils"
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {coords && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <Compass className="size-3 shrink-0" />
            Ubicación GPS capturada para la bitácora
          </span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
            {coords.lat}, {coords.lng}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tipo de Insumo / Combustible */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Droplet className="size-3 text-amber-500" />
            Combustible *
          </Label>
          <select
            value={activeInsumoId}
            onChange={(e) => setInsumoId(e.target.value)}
            required
            className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

        {/* Fecha y Hora de Carga */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            Fecha y Hora *
          </Label>
          <Input
            type="datetime-local"
            value={fechaCarga}
            onChange={(e) => setFechaCarga(e.target.value)}
            required
            className="h-8 text-xs"
          />
        </div>

        {/* Litros cargados */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1">
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
            className="h-8 text-xs font-mono"
          />
        </div>

        {/* Precio Total */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="size-3 text-emerald-500" />
              Total (Bs.) *
            </Label>
            {calculatedUnitPrice && (
              <span className="text-[10.5px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                ≈ {calculatedUnitPrice} Bs./L
              </span>
            )}
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 170.00"
            value={precioTotal}
            onChange={(e) => setPrecioTotal(e.target.value)}
            required
            className="h-8 text-xs font-mono"
          />
        </div>

        {/* Empleado Conductor Responsable */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1">
            <User className="size-3 text-muted-foreground" />
            Conductor / Responsable *
          </Label>
          <EmpleadoCombobox
            value={activeEmpleadoId}
            onValueChange={(val) => setEmpleadoId(val)}
            placeholder="Seleccionar conductor..."
            className="h-8 text-xs"
          />
        </div>

        {/* Número de Factura / Recibo */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Receipt className="size-3 text-muted-foreground" />
            Nº Factura / Recibo
          </Label>
          <Input
            type="text"
            placeholder="Ej. FAC-98234"
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            className="h-8 text-xs"
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
          className="h-7 text-xs cursor-pointer px-2.5"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending}
          className="h-7 text-xs font-medium gap-1.5 bg-amber-600 hover:bg-amber-500 text-white cursor-pointer px-3"
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
        <DialogContent className="sm:max-w-[540px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border border-border/80 shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-4 py-3 sm:px-4 sm:py-3.5 border-b border-border/60 bg-card/60 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500">
                  <Fuel className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <DialogTitle className="text-sm font-semibold tracking-tight">
                      Combustible en Salida
                    </DialogTitle>
                    {salida?.numero && (
                      <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                        {salida.numero}
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-[11px] text-muted-foreground truncate mt-0.5 flex items-center gap-2 flex-wrap">
                    {salida && (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <Car className="size-3 text-amber-500" />
                        {vehiculoLabel}
                        <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                          ({placaLabel})
                        </span>
                      </span>
                    )}
                    {salida?.empleadoNombre && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <span>•</span>
                        <User className="size-3 text-emerald-500" />
                        {salida.empleadoNombre}
                      </span>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {!readOnly && (
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "create" ? "outline" : "default"}
                  onClick={() => setViewMode(viewMode === "create" ? "list" : "create")}
                  className={cn(
                    "h-7 text-xs px-2.5 gap-1.5 cursor-pointer shrink-0 font-medium",
                    viewMode === "list" && "bg-amber-600 hover:bg-amber-500 text-white"
                  )}
                >
                  {viewMode === "list" ? (
                    <>
                      <Plus className="size-3.5" />
                      <span>Nueva Carga</span>
                    </>
                  ) : (
                    <>
                      <X className="size-3.5" />
                      <span>Ver Cargas</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Resumen Métricas Compacto */}
            {cargas.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2.5 border-t border-border/40 text-[11px]">
                <div className="bg-muted/40 rounded px-2 py-1 border border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Cargas</span>
                  <span className="font-semibold text-foreground font-mono">{cargas.length}</span>
                </div>
                <div className="bg-muted/40 rounded px-2 py-1 border border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Litros</span>
                  <span className="font-semibold font-mono text-amber-600 dark:text-amber-400">
                    {totalLitros.toFixed(2)} L
                  </span>
                </div>
                <div className="bg-muted/40 rounded px-2 py-1 border border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Gasto</span>
                  <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                    {totalGasto.toFixed(2)} Bs.
                  </span>
                </div>
                <div className="bg-muted/40 rounded px-2 py-1 border border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <span className="text-[10px] text-muted-foreground">Promedio</span>
                  <span className="font-semibold font-mono text-sky-600 dark:text-sky-400">
                    {promedioPorLitro > 0 ? `${promedioPorLitro.toFixed(2)}` : "-"}
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
            {viewMode === "create" && salida ? (
              <SalidaCargaCombustibleForm
                salida={salida}
                insumos={insumos}
                onSuccess={() => setViewMode("list")}
                onCancel={() => setViewMode("list")}
              />
            ) : (
              <div className="space-y-2">
                {cargasQuery.isLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                    <Loader2 className="size-4 animate-spin text-amber-500" />
                    <span>Cargando registros...</span>
                  </div>
                ) : cargas.length === 0 ? (
                  <div className="py-7 px-4 border border-dashed border-border/70 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="size-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                      <Fuel className="size-4.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-foreground">
                      No hay cargas registradas
                    </h4>
                    <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                      Registra el combustible cargado durante esta salida vehicular.
                    </p>
                    {!readOnly && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setViewMode("create")}
                        className="mt-3 h-7 px-3 gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Registrar Carga</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {cargas.map((carga) => {
                      const l = Number(carga.litros) || 0
                      const p = Number(carga.precioTotal) || 0
                      const unit =
                        carga.precioPorLitro ?? (l > 0 ? p / l : null)

                      return (
                        <div
                          key={carga.id}
                          className="group rounded-lg border border-border/70 bg-card/60 p-2.5 shadow-2xs hover:border-amber-500/40 transition-all flex items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <Fuel className="size-3.5 text-amber-500 shrink-0" />
                                {carga.insumo?.nombre || "Combustible"}
                              </span>
                              {carga.numeroFactura && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                  Fac: {carga.numeroFactura}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3 text-muted-foreground shrink-0" />
                                {formatDate(carga.fechaCarga)}
                              </span>
                              {carga.empleado && (
                                <span className="flex items-center gap-1 truncate max-w-[180px]">
                                  <User className="size-3 text-muted-foreground shrink-0" />
                                  {carga.empleado.nombreCompleto}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                              <div className="font-bold text-foreground text-xs">
                                <span className="font-mono text-amber-600 dark:text-amber-400">
                                  {l.toFixed(2)} L
                                </span>
                                <span className="text-muted-foreground mx-1">•</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400">
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
                                title="Eliminar registro"
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

          {viewMode === "list" && (
            <DialogFooter className="px-3.5 py-2 sm:px-4 sm:py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleModalOpenChange(false)}
                className="text-xs h-7 px-3 cursor-pointer"
              >
                Cerrar
              </Button>
            </DialogFooter>
          )}
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

