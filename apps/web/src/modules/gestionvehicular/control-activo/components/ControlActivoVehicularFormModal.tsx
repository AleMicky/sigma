import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import { asignacionVehicularQueries } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.queries"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import {
  useCreateControlActivoVehicularWithDetalles,
  useUpdateControlActivoVehicularWithDetalles,
} from "../api/control-activo.mutations"
import { controlActivoVehicularQueries } from "../api/control-activo.queries"
import type {
  ControlActivoVehicular,
  TipoControlActivo,
} from "../api/control-activo.service"
import { AccesorioSelectDialog } from "@/modules/mantenimientos/control-activo/components/AccesorioSelectDialog"

export type AccesorioItemState = {
  accesorioId: string
  codigo: string
  nombre: string
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion: string
}

export type ControlActivoVehicularFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudVehicular | null
  controlToEdit?: ControlActivoVehicular | null
  initialTipo?: TipoControlActivo
  onSuccess?: () => void
}

export function ControlActivoVehicularFormModal({
  open,
  onOpenChange,
  solicitud,
  controlToEdit,
  initialTipo = "ENTREGA",
  onSuccess,
}: ControlActivoVehicularFormModalProps) {
  const isEditing = Boolean(controlToEdit?.id)

  // Consultar asignación del vehículo para obtener el activoId y conductor
  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(solicitud?.id && open),
  })

  const asignacion = asignacionQuery.data?.[0]
  const activoId = asignacion?.activoId || ""

  // Consultar información del activo
  const activoQuery = useQuery({
    ...activoQueries.detail(activoId),
    enabled: Boolean(activoId && open),
  })
  const activo = activoQuery.data

  // Consultar accesorios configurados del activo
  const activoAccesoriosQuery = useQuery({
    ...activoAccesorioQueries.byActivo(activoId),
    enabled: Boolean(activoId && open && !isEditing),
  })

  // Consultar historial de controles de esta solicitud
  const controlesPreviosQuery = useQuery({
    ...controlActivoVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(solicitud?.id && open && !isEditing),
  })

  const actaEntregaPrevia = useMemo(() => {
    return (controlesPreviosQuery.data ?? []).find(
      (c) => c.tipo === "ENTREGA"
    )
  }, [controlesPreviosQuery.data])

  const actaEntregaDetallesQuery = useQuery({
    ...controlActivoVehicularQueries.detallesList({
      controlActivoId: actaEntregaPrevia?.id ?? "",
    }),
    enabled: Boolean(actaEntregaPrevia?.id && open && !isEditing),
  })

  // Consulta catálogo para nombres de accesorios
  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
    enabled: open,
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  // Estado del formulario
  const [tipo, setTipo] = useState<TipoControlActivo>(initialTipo)
  const [fecha, setFecha] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [recibidoPorId, setRecibidoPorId] = useState<string>("")
  const [conformeGeneral, setConformeGeneral] = useState<boolean>(true)
  const [observacionGeneral, setObservacionGeneral] = useState<string>("")
  const [items, setItems] = useState<AccesorioItemState[]>([])
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false)
  const [selectAccesorioOpen, setSelectAccesorioOpen] = useState(false)

  // Reset/cargar al abrir
  useEffect(() => {
    if (!open) {
      setHasLoadedDefaults(false)
      setItems([])
      return
    }

    if (controlToEdit) {
      setTipo(controlToEdit.tipo)
      if (controlToEdit.fecha) {
        setFecha(controlToEdit.fecha.slice(0, 16))
      }
      setRecibidoPorId(controlToEdit.recibidoPorId || "")
      setConformeGeneral(controlToEdit.conforme ?? true)
      setObservacionGeneral(controlToEdit.observacion || "")

      if (controlToEdit.detalles && controlToEdit.detalles.length > 0) {
        const mapped = controlToEdit.detalles.map((d) => {
          const accCatalog = accesorioMap.get(d.accesorioId)
          return {
            accesorioId: d.accesorioId,
            codigo: d.accesorio?.codigo || accCatalog?.codigo || "ACC",
            nombre: d.accesorio?.nombre || accCatalog?.nombre || "Accesorio",
            cantidadEsperada: d.cantidadEsperada ?? 1,
            cantidadEncontrada: d.cantidadEncontrada ?? 1,
            conforme: d.conforme ?? true,
            observacion: d.observacion ?? "",
          }
        })
        setItems(mapped)
        setHasLoadedDefaults(true)
      }
    } else {
      setTipo(initialTipo)
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      setFecha(now.toISOString().slice(0, 16))
      setConformeGeneral(true)
      setObservacionGeneral("")

      // Asignar responsable receptor por defecto (conductor de la asignación)
      if (asignacion?.conductor?.empleadoId) {
        setRecibidoPorId(asignacion.conductor.empleadoId)
      } else if (solicitud?.solicitanteId) {
        setRecibidoPorId(solicitud.solicitanteId)
      }
    }
  }, [open, controlToEdit, initialTipo, asignacion, solicitud, accesorioMap])

  // Cargar accesorios por defecto cuando es nuevo
  useEffect(() => {
    if (!open || isEditing || hasLoadedDefaults) return

    if (tipo === "DEVOLUCION" && actaEntregaPrevia) {
      const detallesEntrega = actaEntregaDetallesQuery.data?.content ?? []
      if (detallesEntrega.length > 0) {
        const recovered: AccesorioItemState[] = detallesEntrega.map((det) => ({
          accesorioId: det.accesorioId,
          codigo: det.accesorio?.codigo || "ACC",
          nombre: det.accesorio?.nombre || "Accesorio",
          cantidadEsperada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          cantidadEncontrada: det.cantidadEncontrada ?? det.cantidadEsperada ?? 1,
          conforme: det.conforme ?? true,
          observacion: det.observacion ? `Entrega: ${det.observacion}` : "",
        }))
        setItems(recovered)
        setHasLoadedDefaults(true)
        return
      }
    }

    if (activoAccesoriosQuery.data?.content && items.length === 0) {
      const defaultItems: AccesorioItemState[] = (
        activoAccesoriosQuery.data.content ?? []
      ).map((rel) => ({
        accesorioId: rel.accesorio?.id ?? "",
        codigo: rel.accesorio?.codigo ?? "ACC",
        nombre: rel.accesorio?.nombre ?? "Accesorio",
        cantidadEsperada: rel.cantidad ?? 1,
        cantidadEncontrada: rel.cantidad ?? 1,
        conforme: true,
        observacion: rel.observacion ?? "",
      }))
      if (defaultItems.length > 0) {
        setItems(defaultItems)
        setHasLoadedDefaults(true)
      }
    }
  }, [
    open,
    isEditing,
    hasLoadedDefaults,
    tipo,
    actaEntregaPrevia,
    actaEntregaDetallesQuery.data,
    activoAccesoriosQuery.data,
    items.length,
  ])

  // Handlers para la tabla de accesorios
  function handleUpdateItem(
    index: number,
    partial: Partial<AccesorioItemState>
  ) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, ...partial }
        if (
          partial.cantidadEncontrada !== undefined &&
          partial.conforme === undefined
        ) {
          updated.conforme =
            partial.cantidadEncontrada === item.cantidadEsperada &&
            partial.cantidadEncontrada > 0
        }
        return updated
      })

      const allOk =
        next.length === 0 ||
        next.every(
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
        )
      setConformeGeneral(allOk)
      return next
    })
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      const allOk =
        next.length === 0 ||
        next.every(
          (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
        )
      setConformeGeneral(allOk)
      return next
    })
  }

  function handleAddAccesorio(accesorio: Accesorio) {
    if (items.some((i) => i.accesorioId === accesorio.id)) {
      toast.info("El accesorio ya está en el checklist")
      return
    }

    setItems((prev) => {
      const next = [
        ...prev,
        {
          accesorioId: accesorio.id,
          codigo: accesorio.codigo,
          nombre: accesorio.nombre,
          cantidadEsperada: 1,
          cantidadEncontrada: 1,
          conforme: true,
          observacion: "",
        },
      ]
      const allOk = next.every(
        (i) => i.conforme && i.cantidadEncontrada === i.cantidadEsperada
      )
      setConformeGeneral(allOk)
      return next
    })
  }

  const createMutation = useCreateControlActivoVehicularWithDetalles()
  const updateMutation = useUpdateControlActivoVehicularWithDetalles()
  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!solicitud?.id) {
      toast.error("No se encontró la solicitud vehicular")
      return
    }

    if (!activoId) {
      toast.error(
        "Esta solicitud aún no tiene un vehículo asignado. Realice la asignación primero."
      )
      return
    }

    if (!fecha) {
      toast.error("La fecha y hora del control es obligatoria")
      return
    }

    for (const item of items) {
      if (item.cantidadEsperada < 0 || item.cantidadEncontrada < 0) {
        toast.error("Las cantidades de accesorios deben ser mayores o iguales a 0")
        return
      }
    }

    const payload = {
      solicitudVehicularId: solicitud.id,
      asignacionVehicularId: asignacion?.id || null,
      activoId: activoId,
      tipo: tipo,
      recibidoPorId: recibidoPorId || null,
      fecha: new Date(fecha).toISOString().slice(0, 19),
      conforme: conformeGeneral,
      observacion: observacionGeneral.trim() || null,
    }

    const detalles = items.map((i) => ({
      accesorioId: i.accesorioId,
      cantidadEsperada: i.cantidadEsperada,
      cantidadEncontrada: i.cantidadEncontrada,
      conforme: i.conforme,
      observacion: i.observacion.trim() || null,
    }))

    try {
      if (isEditing && controlToEdit?.id) {
        await updateMutation.mutateAsync({
          id: controlToEdit.id,
          control: payload,
          detalles,
        })
      } else {
        await createMutation.mutateAsync({
          control: payload,
          detalles,
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Manejado por react-query
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
          <DialogHeader className="px-5 pt-4 pb-3 border-b bg-muted/20 shrink-0 space-y-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                  <ClipboardCheck className="size-4" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base font-bold truncate">
                    {isEditing
                      ? `Editar Acta de ${tipo === "ENTREGA" ? "Entrega / Salida" : "Devolución / Retorno"}`
                      : `Control de Activo Vehicular - ${tipo === "ENTREGA" ? "Entrega (Salida)" : "Devolución (Retorno)"}`}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    Inspección y verificación de accesorios del vehículo para el viaje.
                  </p>
                </div>
              </div>

              {solicitud?.numero && (
                <span className="font-mono text-xs font-bold bg-muted px-2.5 py-1 rounded-md border border-border shrink-0 shadow-2xs">
                  Viaje: {solicitud.numero}
                </span>
              )}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Resumen Vehículo y Tipo */}
              <Card className="p-3 border bg-card/60 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Box className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {activo?.codigo && (
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {activo.codigo}
                          </span>
                        )}
                        <span className="font-heading text-sm font-bold text-foreground truncate">
                          {activo?.nombre || "Vehículo Asignado"}
                        </span>
                        {asignacion?.conductor?.nombreCompleto && (
                          <span className="text-xs text-muted-foreground">
                            | Conductor: <strong className="text-foreground font-medium">{asignacion.conductor.nombreCompleto}</strong>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        Destino: <strong className="text-foreground font-medium">{solicitud?.destino || "-"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Tipo */}
                  <div className="inline-flex rounded-xl bg-muted p-1 border shadow-inner shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setTipo("ENTREGA")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        tipo === "ENTREGA"
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Send className="size-3.5" />
                      <span>Salida / Entrega</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipo("DEVOLUCION")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        tipo === "DEVOLUCION"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Retorno / Devolución</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Responsable y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div className="space-y-1">
                  <Label htmlFor="fechaControlVehicular" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>Fecha / Hora de Inspección</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fechaControlVehicular"
                    type="datetime-local"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="h-8.5 text-xs font-medium bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <UserCheck className="size-3 text-muted-foreground" />
                    <span>Conductor / Receptor Responsable</span>
                  </Label>
                  <EmpleadoCombobox
                    value={recibidoPorId}
                    onValueChange={(val) => setRecibidoPorId(val)}
                    placeholder="Seleccione conductor..."
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              {/* Checklist de Accesorios */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Package className="size-3.5 text-primary" />
                    <span>Checklist de Accesorios e Implementos ({items.length})</span>
                  </div>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => setSelectAccesorioOpen(true)}
                    className="h-7 text-xs font-semibold gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Agregar Accesorio</span>
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                    <p>No hay accesorios registrados para inspeccionar.</p>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setSelectAccesorioOpen(true)}
                      className="gap-1 text-xs"
                    >
                      <Plus className="size-3" />
                      Agregar accesorio del catálogo
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/50">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-border/40 text-[10.5px] uppercase font-semibold text-muted-foreground bg-muted/40 select-none">
                          <th className="py-2.5 px-3 min-w-[180px]">Accesorio</th>
                          <th className="py-2.5 px-2 text-center w-24">Esperado</th>
                          <th className="py-2.5 px-2 text-center w-28">Encontrado</th>
                          <th className="py-2.5 px-2 text-center w-28">Estado</th>
                          <th className="py-2.5 px-3 min-w-[160px]">Observación</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {items.map((item, idx) => {
                          const hasMismatch = item.cantidadEsperada !== item.cantidadEncontrada
                          return (
                            <tr
                              key={item.accesorioId || idx}
                              className={cn(
                                "hover:bg-muted/30 transition-colors",
                                !item.conforme && "bg-amber-500/[0.04]"
                              )}
                            >
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                    {item.codigo}
                                  </span>
                                  <span className="font-semibold text-foreground truncate max-w-[200px]" title={item.nombre}>
                                    {item.nombre}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2 px-2 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.cantidadEsperada}
                                  onChange={(e) =>
                                    handleUpdateItem(idx, {
                                      cantidadEsperada: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-7 w-16 text-center font-mono text-xs mx-auto"
                                />
                              </td>

                              <td className="py-2 px-2 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.cantidadEncontrada}
                                  onChange={(e) =>
                                    handleUpdateItem(idx, {
                                      cantidadEncontrada: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className={cn(
                                    "h-7 w-16 text-center font-mono text-xs mx-auto font-bold",
                                    hasMismatch && "text-amber-600 border-amber-500/50 bg-amber-500/10"
                                  )}
                                />
                              </td>

                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItem(idx, { conforme: !item.conforme })
                                  }
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                                    item.conforme
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                  )}
                                >
                                  {item.conforme ? (
                                    <CheckCircle2 className="size-2.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="size-2.5 text-amber-600 shrink-0" />
                                  )}
                                  <span>{item.conforme ? "Conforme" : "Observado"}</span>
                                </button>
                              </td>

                              <td className="py-2 px-3">
                                <Input
                                  type="text"
                                  placeholder="Nota..."
                                  value={item.observacion}
                                  onChange={(e) =>
                                    handleUpdateItem(idx, { observacion: e.target.value })
                                  }
                                  className="h-7 text-xs"
                                />
                              </td>

                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                                  title="Quitar accesorio"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Dictamen y Observación General */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-xs font-bold text-foreground">
                    Dictamen General de Inspección
                  </Label>
                  <button
                    type="button"
                    onClick={() => setConformeGeneral((prev) => !prev)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-2xs",
                      conformeGeneral
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    )}
                  >
                    {conformeGeneral ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-amber-600" />
                    )}
                    <span>{conformeGeneral ? "ACTA CONFORME" : "ACTA OBSERVADA"}</span>
                  </button>
                </div>

                <Textarea
                  placeholder="Observaciones generales sobre el estado del vehículo, kilometraje, combustible o accesorios..."
                  value={observacionGeneral}
                  onChange={(e) => setObservacionGeneral(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            <DialogFooter className="p-3.5 border-t bg-muted/20 flex sm:flex-row items-center justify-between gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="h-8 gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>{isEditing ? "Actualizar Acta" : "Guardar Control Activo"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo auxiliar para seleccionar accesorio adicional */}
      <AccesorioSelectDialog
        open={selectAccesorioOpen}
        onOpenChange={setSelectAccesorioOpen}
        existingAccesorioIds={items.map((i) => i.accesorioId)}
        onSelect={handleAddAccesorio}
      />
    </>
  )
}
