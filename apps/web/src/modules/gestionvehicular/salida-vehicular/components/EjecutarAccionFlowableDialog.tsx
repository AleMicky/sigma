import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  CalendarClock,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
  GitBranch,
  Loader2,
  Play,
  RefreshCw,
  User,
} from "lucide-react"

import { useProgramacionesByActivo } from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.queries"

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
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"

import { useEjecutarAccionSalidaMutation } from "../api/salida-vehicular.mutations"
import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { SalidaVehicular, WorkflowAction } from "../api/salida-vehicular.types"
import { SalidaVehicularStatusBadge } from "./SalidaVehicularStatusBadge"
import { getSalidaNextActionConfig } from "./salida-action.utils"

interface EjecutarAccionFlowableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salida: SalidaVehicular | null
}

type GpsStatus = "idle" | "locating" | "success" | "error" | "unsupported"

export function EjecutarAccionFlowableDialog({
  open,
  onOpenChange,
  salida,
}: EjecutarAccionFlowableDialogProps) {
  const [kilometraje, setKilometraje] = useState<string>("")
  const [kmError, setKmError] = useState<string | null>(null)
  const [latitud, setLatitud] = useState<string>("")
  const [longitud, setLongitud] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle")

  // Fetch pending task and dynamic actions from Flowable
  const tareaQuery = useQuery({
    ...salidaVehicularQueries.tareaActual(salida?.id ?? ""),
    enabled: Boolean(salida?.id) && open,
  })

  const accionesQuery = useQuery({
    ...salidaVehicularQueries.acciones(salida?.id ?? ""),
    enabled: Boolean(salida?.id) && open,
  })

  const accionMutation = useEjecutarAccionSalidaMutation()

  const currentTask = tareaQuery.data
  const availableActions = accionesQuery.data?.actions ?? []

  const hasSalidaEvent = useMemo(
    () =>
      (salida?.eventos ?? []).some((e) =>
        (e.tipoEvento ?? "").toUpperCase().includes("SALIDA")
      ),
    [salida?.eventos]
  )

  const kilometrajeSalida = useMemo(() => {
    const salidaEvent = (salida?.eventos ?? []).find(
      (e) =>
        (e.tipoEvento ?? "").toUpperCase().includes("SALIDA") &&
        e.kilometraje != null
    )
    return salidaEvent?.kilometraje ?? null
  }, [salida?.eventos])

  const preventivoQuery = useProgramacionesByActivo(salida?.activoId ?? undefined)
  const activeProgram = useMemo(
    () => (preventivoQuery.data ?? []).find((p) => p.activo),
    [preventivoQuery.data]
  )
  const kmCriterion = useMemo(
    () =>
      (activeProgram?.criterios ?? []).find(
        (c) => c.activo && c.tipoCriterio === "KILOMETRAJE"
      ),
    [activeProgram?.criterios]
  )

  const numKm = useMemo(() => {
    if (!kilometraje) return null
    const n = Number(kilometraje)
    return Number.isNaN(n) ? null : n
  }, [kilometraje])

  const isReachingPreventivo = useMemo(() => {
    if (numKm === null || kmCriterion?.proximoValorUso == null) return false
    return numKm >= kmCriterion.proximoValorUso
  }, [numKm, kmCriterion?.proximoValorUso])

  const nextAction = getSalidaNextActionConfig(
    currentTask?.name ?? (hasSalidaEvent ? "LLEGADA" : salida?.estado),
    salida?.descripcionActividad
  )
  const ActionIcon = nextAction.icon

  const kilometrajeField = useMemo(
    () => accionesQuery.data?.fields?.find((f) => f.id === "kilometraje"),
    [accionesQuery.data?.fields]
  )

  const kilometrajeLabel =
    kilometrajeField?.name ||
    (nextAction.type === "SALIDA" ? "Kilometraje de Salida" : "Kilometraje de Llegada")

  // Capture GPS internally in background
  const captureGPS = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported")
      return
    }

    setGpsStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
        setGpsStatus("success")
      },
      () => {
        setGpsStatus("error")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const activeGpsStatus: GpsStatus = useMemo(() => {
    if (!open || !salida) return "idle"
    if (gpsStatus !== "idle") return gpsStatus
    if (typeof window !== "undefined" && !navigator.geolocation) return "unsupported"
    return "locating"
  }, [open, salida, gpsStatus])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setKilometraje("")
      setKmError(null)
      setLatitud("")
      setLongitud("")
      setObservacion("")
      setGpsStatus("idle")
    }
    onOpenChange(nextOpen)
  }

  // Auto-capture GPS silently when the dialog is opened
  useEffect(() => {
    if (!open || !salida) return
    if (typeof window === "undefined" || !navigator.geolocation) return

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
        setGpsStatus("success")
      },
      () => {
        if (cancelled) return
        setGpsStatus("error")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )

    return () => {
      cancelled = true
    }
  }, [open, salida])

  const handleExecute = async (action: WorkflowAction) => {
    if (!salida) return

    const trimmedKm = kilometraje.trim()
    const numKm = trimmedKm ? parseFloat(trimmedKm) : NaN

    if (!trimmedKm || Number.isNaN(numKm) || numKm < 0) {
      setKmError("El kilometraje es obligatorio.")
      toast.error("Debe ingresar el kilometraje del vehículo para continuar")
      return
    }

    if (
      nextAction.type === "LLEGADA" &&
      kilometrajeSalida !== null &&
      numKm < kilometrajeSalida
    ) {
      setKmError(
        `El kilometraje de llegada no puede ser menor al de salida (${kilometrajeSalida} km).`
      )
      toast.error(`El kilometraje no puede ser menor a ${kilometrajeSalida} km`)
      return
    }

    setKmError(null)

    let currentLat = latitud
    let currentLng = longitud

    // Si aún no se capturaron coordenadas GPS y el navegador lo soporta, intentar una captura rápida
    if ((!currentLat || !currentLng) && typeof window !== "undefined" && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 3500,
            maximumAge: 10000,
          })
        })
        currentLat = pos.coords.latitude.toFixed(6)
        currentLng = pos.coords.longitude.toFixed(6)
        setLatitud(currentLat)
        setLongitud(currentLng)
        setGpsStatus("success")
      } catch {
        // Continuar si no se pudo obtener GPS
      }
    }

    const accionId = action.variable || action.value || action.name

    await accionMutation.mutateAsync({
      id: salida.id,
      accionId,
      data: {
        kilometraje: Math.round(numKm),
        latitud: currentLat ? parseFloat(currentLat) : undefined,
        longitud: currentLng ? parseFloat(currentLng) : undefined,
        observacion: observacion.trim() || undefined,
        variables: {
          [action.variable]: action.value,
        },
      },
    })

    // Reset and close
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0 rounded-2xl shadow-xl">
        <div className="border-b bg-gradient-to-br from-card via-card to-muted/30 px-4 py-3 sm:px-5 sm:py-3.5">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border shadow-2xs shrink-0",
                    nextAction.buttonClassName
                  )}
                >
                  <ActionIcon className={cn("size-4", nextAction.iconClassName)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-sm sm:text-base font-bold text-foreground leading-tight">
                      {nextAction.label}
                    </DialogTitle>
                    {salida?.numero && (
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                        #{salida.numero}
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                    <Car className="size-3 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground/90 font-mono">
                      {salida?.placa || "S/P"}
                    </span>
                    {salida?.activoDescripcion && (
                      <span className="truncate">({salida.activoDescripcion})</span>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {salida?.estado && (
                <div className="shrink-0">
                  <SalidaVehicularStatusBadge status={salida.estado} />
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {salida && (
          <div className="p-4 sm:p-5 space-y-3 max-h-[75vh] overflow-y-auto">
            {/* Card de Información del Vehículo y Actividad */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1.5 text-xs">
              {salida.descripcionActividad && (
                <div className="flex items-start gap-2 text-foreground/90">
                  <FileText className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium line-clamp-2" title={salida.descripcionActividad}>
                    {salida.descripcionActividad}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 gap-2 flex-wrap">
                {salida.empleadoNombre && (
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="size-3 text-muted-foreground shrink-0" />
                    <span>Conductor: <strong className="text-foreground/80 font-medium">{salida.empleadoNombre}</strong></span>
                  </span>
                )}
                {currentTask?.name && (
                  <span className="flex items-center gap-1 text-[10.5px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    <GitBranch className="size-2.5" />
                    {currentTask.name}
                  </span>
                )}
              </div>
            </div>

            {/* Formulario de Entrada Operativa */}
            <div className="space-y-2.5">
              {/* Odómetro */}
              <div className="space-y-1">
                <Label htmlFor="kilometraje" className="text-xs font-medium flex items-center justify-between text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="size-3.5 text-primary" />
                    {kilometrajeLabel} <span className="text-destructive font-bold">*</span>
                  </span>
                  {kilometrajeSalida !== null && nextAction.type === "LLEGADA" ? (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Km Salida: {kilometrajeSalida} km
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Obligatorio
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="kilometraje"
                    type="number"
                    step="1"
                    min={kilometrajeSalida !== null && nextAction.type === "LLEGADA" ? kilometrajeSalida : 0}
                    placeholder={
                      kilometrajeSalida !== null && nextAction.type === "LLEGADA"
                        ? `Mínimo ${kilometrajeSalida}`
                        : "Ej. 125430"
                    }
                    value={kilometraje}
                    onChange={(e) => {
                      setKilometraje(e.target.value)
                      if (kmError) setKmError(null)
                    }}
                    required
                    className={cn(
                      "h-8 text-xs pr-10 font-mono",
                      kmError && "border-destructive focus-visible:ring-destructive"
                    )}
                    autoFocus
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground pointer-events-none">
                    km
                  </span>
                </div>
                {kmError ? (
                  <p className="text-[10.5px] text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="size-3 shrink-0" />
                    {kmError}
                  </p>
                ) : (
                  kilometrajeSalida !== null && nextAction.type === "LLEGADA" && (
                    <p className="text-[10.5px] text-muted-foreground">
                      Debe ser igual o mayor a los {kilometrajeSalida} km registrados en la salida.
                    </p>
                  )
                )}

                {/* Aviso preventivo integrado con el odómetro ingresado */}
                {kmCriterion && (
                  <div
                    className={cn(
                      "p-2.5 rounded-lg border text-xs space-y-1 transition-colors",
                      isReachingPreventivo
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
                        : "bg-muted/30 border-border/50 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock
                          className={cn(
                            "size-3.5",
                            isReachingPreventivo
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-primary"
                          )}
                        />
                        {isReachingPreventivo
                          ? "Alcanzará Límite Preventivo"
                          : "Control Preventivo Activo"}
                      </span>
                      <span className="font-mono font-bold text-[11px]">
                        Límite: {kmCriterion.proximoValorUso?.toLocaleString() ?? "N/A"} km
                      </span>
                    </div>
                    {isReachingPreventivo ? (
                      <p className="text-[10.5px] leading-tight text-amber-800 dark:text-amber-300">
                        Al confirmar este kilometraje ({numKm?.toLocaleString()} km), se actualizará la telemetría del activo y el sistema disparará la evaluación preventiva automáticamente.
                      </p>
                    ) : kmCriterion.proximoValorUso && (kmCriterion.valorActualUso || numKm) ? (
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span>
                          Margen restante:{" "}
                          {(
                            kmCriterion.proximoValorUso -
                            (numKm || kmCriterion.valorActualUso || 0)
                          ).toLocaleString()}{" "}
                          km
                        </span>
                        <span>
                          Actual: {(numKm || kmCriterion.valorActualUso || 0).toLocaleString()} km
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Registro y Geolocalización GPS compacta */}
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {activeGpsStatus === "locating" && (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-muted-foreground text-[11.5px] truncate">
                        Detectando GPS automático...
                      </span>
                    </>
                  )}
                  {activeGpsStatus === "success" && (
                    <>
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-mono text-[11px] truncate">
                        GPS registrado: {latitud}, {longitud}
                      </span>
                    </>
                  )}
                  {activeGpsStatus === "error" && (
                    <>
                      <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                      <span className="text-amber-700 dark:text-amber-400 text-[11.5px] truncate">
                        GPS no disponible (se registrará odómetro y hora)
                      </span>
                    </>
                  )}
                  {activeGpsStatus === "unsupported" && (
                    <>
                      <AlertCircle className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground text-[11.5px] truncate">
                        Navegador sin geolocalización
                      </span>
                    </>
                  )}
                </div>

                {(activeGpsStatus === "success" || activeGpsStatus === "error") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={captureGPS}
                    className="h-6 px-1.5 text-[10.5px] text-muted-foreground hover:text-foreground shrink-0 gap-1 cursor-pointer"
                    title="Actualizar coordenadas GPS"
                  >
                    <RefreshCw className="size-2.5" />
                    Actualizar
                  </Button>
                )}
              </div>

              {/* Observaciones (solo si la tarea del BPMN lo define explícitamente) */}
              {accionesQuery.data?.fields?.some((f) => f.id === "observacion") && (
                <div className="space-y-1">
                  <Label htmlFor="observacion" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                    <FileText className="size-3.5 text-muted-foreground" />
                    Observaciones
                    <span className="text-muted-foreground font-normal text-[10.5px]">(opcional)</span>
                  </Label>
                  <Textarea
                    id="observacion"
                    rows={2}
                    placeholder="Detalles o novedades al registrar..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>
              )}
            </div>

            {/* Aviso si no hay acciones de Flowable */}
            {!accionesQuery.isLoading && availableActions.length === 0 && (
              <div className="p-2.5 bg-muted/30 border border-dashed rounded-lg text-center text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 mx-auto mb-1 text-muted-foreground/60" />
                No hay acciones de avance disponibles para la tarea actual en Flowable.
              </div>
            )}
          </div>
        )}

        {/* Footer con Botones de Acción */}
        <DialogFooter className="border-t bg-muted/20 px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={accionMutation.isPending}
            className="text-xs h-7.5 px-3 cursor-pointer"
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {accionesQuery.isLoading ? (
              <Button size="sm" disabled className="text-xs h-7.5 gap-1.5">
                <Loader2 className="size-3 animate-spin" />
                Cargando acciones...
              </Button>
            ) : availableActions.length > 0 ? (
              availableActions.map((action) => (
                <Button
                  key={action.name}
                  type="button"
                  onClick={() => handleExecute(action)}
                  disabled={accionMutation.isPending}
                  className={cn(
                    "h-7.5 text-xs font-medium gap-1.5 shadow-xs cursor-pointer px-3.5",
                    nextAction.type === "SALIDA" && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
                    nextAction.type === "LLEGADA" && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  )}
                >
                  {accionMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3 fill-current" />
                  )}
                  <span>
                    {action.name.toUpperCase() === "COMPLETAR" ? nextAction.label : action.name}
                  </span>
                </Button>
              ))
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
