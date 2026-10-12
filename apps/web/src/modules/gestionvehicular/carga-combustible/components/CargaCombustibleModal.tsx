import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Car,
  CheckCircle2,
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

import { asignacionVehicularQueries } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.queries"
import type { AsignacionVehicular } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.service"
import { conductorQueries } from "@/modules/gestionvehicular/conductor/api/conductor.queries"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
import { viajeVehicularKeys } from "@/modules/gestionvehicular/viaje-vehicular/api/viaje-vehicular.queries"
import {
  getViajeByAsignacion,
  getViajeBySolicitud,
  type ViajeVehicular,
} from "@/modules/gestionvehicular/viaje-vehicular/api/viaje-vehicular.service"
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

import {
  useCreateCargaCombustible,
  useDeleteCargaCombustible,
} from "../api/carga-combustible.mutations"
import { cargaCombustibleQueries } from "../api/carga-combustible.queries"
import {
  getCargasByActivo,
  getCargasByViaje,
  type CargaCombustible,
} from "../api/carga-combustible.service"

export type CargaCombustibleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudVehicular | null
  viaje?: ViajeVehicular | null
  asignacion?: AsignacionVehicular | null
  readOnly?: boolean
}

function getLocalCurrentIsoString(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

type CargaCombustibleFormProps = {
  activoId: string
  viajeId?: string | null
  defaultEmpleadoId: string
  insumos: Insumo[]
  onSuccess: () => void
  onCancel: () => void
}

function CargaCombustibleForm({
  activoId,
  viajeId,
  defaultEmpleadoId,
  insumos,
  onSuccess,
  onCancel,
}: Readonly<CargaCombustibleFormProps>) {
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
  const [empleadoId, setEmpleadoId] = useState<string>(defaultEmpleadoId)

  const activeInsumoId = insumoId || defaultInsumoId
  const activeEmpleadoId = empleadoId || defaultEmpleadoId

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
    if (!activoId || !activeInsumoId || !activeEmpleadoId) return

    const parsedLitros = parseFloat(litros)
    const parsedPrecio = parseFloat(precioTotal)
    if (Number.isNaN(parsedLitros) || parsedLitros <= 0) return
    if (Number.isNaN(parsedPrecio) || parsedPrecio < 0) return

    await createMutation.mutateAsync({
      activoId,
      viajeVehicularId: viajeId ?? null,
      insumoId: activeInsumoId,
      litros: parsedLitros,
      precioTotal: parsedPrecio,
      numeroFactura: numeroFactura.trim() ? numeroFactura.trim() : null,
      fechaCarga: new Date(fechaCarga).toISOString(),
      empleadoId: activeEmpleadoId,
    })

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3 text-xs flex items-center gap-2">
        <Fuel className="size-4 text-amber-500 shrink-0" />
        <p className="text-muted-foreground">
          Registra la carga de combustible realizada durante el viaje. El
          importe se computará a los gastos de la unidad asignada.
        </p>
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

export function CargaCombustibleModal({
  open,
  onOpenChange,
  solicitud,
  viaje: initialViaje,
  asignacion: initialAsignacion,
  readOnly = false,
}: Readonly<CargaCombustibleModalProps>) {
  const [viewMode, setViewMode] = useState<"list" | "create">("list")
  const [deleteTarget, setDeleteTarget] = useState<CargaCombustible | null>(null)

  // Consultar asignación técnica si no se proveyó
  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(open && solicitud?.id && !initialAsignacion),
    staleTime: 1000 * 60 * 2,
  })
  const asignacion = initialAsignacion || asignacionQuery.data?.[0]
  const vehiculo = asignacion?.activo
  const conductor = asignacion?.conductor || solicitud?.conductorAsignado

  // Consultar viaje vehicular asociado
  const viajeQuery = useQuery({
    queryKey: [
      ...viajeVehicularKeys.all,
      "by-sol-or-asig",
      solicitud?.id ?? "",
      asignacion?.id ?? "",
    ],
    queryFn: async () => {
      if (asignacion?.id) return getViajeByAsignacion(asignacion.id)
      if (solicitud?.id) return getViajeBySolicitud(solicitud.id)
      return null
    },
    enabled: Boolean(open && !initialViaje && (solicitud?.id || asignacion?.id)),
    staleTime: 1000 * 60 * 2,
  })
  const viaje = initialViaje || viajeQuery.data

  // Consultar detalle de conductor para resolver empleadoId si no vino embebido
  const conductorDetailQuery = useQuery({
    ...conductorQueries.detail(conductor?.id ?? ""),
    enabled: Boolean(open && conductor?.id && !conductor.empleadoId),
    staleTime: 1000 * 60 * 5,
  })
  const defaultEmpleadoId =
    conductor?.empleadoId ||
    conductorDetailQuery.data?.empleadoId ||
    ""

  // Consultar lista de cargas de combustible para este viaje o vehículo
  const viajeId = viaje?.id
  const activoId = asignacion?.activoId || vehiculo?.id

  const cargasQuery = useQuery({
    queryKey: viajeId
      ? cargaCombustibleQueries.byViaje(viajeId).queryKey
      : cargaCombustibleQueries.byActivo(activoId ?? "").queryKey,
    queryFn: () => {
      if (viajeId) return getCargasByViaje(viajeId)
      if (activoId) return getCargasByActivo(activoId)
      return []
    },
    enabled: Boolean(open && (viajeId || activoId)),
    staleTime: 1000 * 30,
  })

  const cargas = useMemo(() => cargasQuery.data ?? [], [cargasQuery.data])

  // Consultar catálogo de insumos (combustibles)
  const insumosQuery = useQuery({
    ...insumoQueries.list({ size: 100 }),
    enabled: Boolean(open),
    staleTime: 1000 * 60 * 10,
  })
  const insumos = useMemo(
    () => (insumosQuery.data?.content ?? []) as Insumo[],
    [insumosQuery.data?.content]
  )

  // Cálculos estadísticos
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

  // Mutación de eliminación
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
                      Cargas de Combustible
                    </DialogTitle>
                    {solicitud?.numero && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {solicitud.numero}
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-2 flex-wrap">
                    {vehiculo && (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <Car className="size-3 text-amber-500" />
                        {vehiculo.nombre}
                        {vehiculo.placa && (
                          <span className="font-mono text-[10.5px] font-bold text-amber-500">
                            ({vehiculo.placa})
                          </span>
                        )}
                      </span>
                    )}
                    {conductor && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <User className="size-3 text-emerald-500" />
                        {conductor.nombreCompleto}
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
            {viewMode === "create" && activoId ? (
              /* FORMULARIO DE REGISTRO */
              <CargaCombustibleForm
                activoId={activoId}
                viajeId={viajeId}
                defaultEmpleadoId={defaultEmpleadoId}
                insumos={insumos}
                onSuccess={() => setViewMode("list")}
                onCancel={() => setViewMode("list")}
              />
            ) : (
              /* LISTADO DE CARGAS REGISTRADAS */
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
                      No hay cargas de combustible registradas
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      No se han registrado consumos de combustible para este viaje o vehículo.
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

      {/* Confirmación para Eliminar Carga */}
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
