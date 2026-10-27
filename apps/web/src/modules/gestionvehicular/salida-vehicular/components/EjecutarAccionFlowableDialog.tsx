import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowRight,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
  GitBranch,
  Loader2,
  MapPin,
  Play,
  RefreshCw,
  User,
} from "lucide-react"

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

  const nextAction = getSalidaNextActionConfig(salida?.estado, salida?.destino)
  const ActionIcon = nextAction.icon

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
        kilometraje: kilometraje ? parseFloat(kilometraje) : undefined,
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
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden gap-0 rounded-2xl shadow-xl">
        {/* Header Hero */}
        <div className="relative border-b bg-gradient-to-br from-card via-card to-muted/40 p-5 sm:p-6 pb-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border shadow-2xs shrink-0 transition-transform",
                  nextAction.buttonClassName
                )}
              >
                <ActionIcon className={cn("size-4.5", nextAction.iconClassName)} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                  {nextAction.label}
                </DialogTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-foreground/80">
                    Salida #{salida?.numero}
                  </span>
                  <span>&bull;</span>
                  <span className="truncate">{nextAction.title}</span>
                </p>
              </div>
            </div>
            <DialogDescription className="sr-only">
              Formulario operativo para registrar la transición de estado del vehículo en el flujo operativo.
            </DialogDescription>
          </DialogHeader>
        </div>

        {salida && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Card de Información del Vehículo y Ruta */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Car className="size-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {salida.placa ? (
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-foreground/10 text-foreground">
                          {salida.placa}
                        </span>
                      ) : null}
                      <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                        {salida.activoDescripcion || "Vehículo"}
                      </span>
                    </div>
                    {(salida.marca || salida.modelo) && (
                      <p className="text-[11px] text-muted-foreground">
                        {[salida.marca, salida.modelo].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </div>
                </div>
                <SalidaVehicularStatusBadge status={salida.estado} />
              </div>

              {/* Ruta Origen -> Destino */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {salida.origen}
                </span>
                <ArrowRight className="size-3 text-muted-foreground/60 shrink-0" />
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {salida.destino}
                </span>
              </div>

              {salida.empleadoNombre && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <User className="size-3 shrink-0" />
                  <span className="truncate">Conductor: <strong className="text-foreground/80 font-medium">{salida.empleadoNombre}</strong></span>
                </div>
              )}
            </div>

            {/* Paso del Workflow BPMN */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-6 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                  <GitBranch className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block leading-none">
                    Paso del Flujo Operativo
                  </span>
                  <p className="text-xs font-bold text-foreground truncate mt-0.5">
                    {currentTask?.name || nextAction.label}
                  </p>
                </div>
              </div>

              {tareaQuery.isLoading ? (
                <Loader2 className="size-3.5 animate-spin text-blue-500 shrink-0" />
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-700 dark:text-blue-300 shrink-0">
                  <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                  En espera de acción
                </span>
              )}
            </div>

            {/* Formulario de Entrada Operativa */}
            <div className="space-y-3 pt-1">
              {/* Odómetro */}
              <div className="space-y-1.5">
                <Label htmlFor="kilometraje" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <Gauge className="size-3.5 text-primary" />
                  Kilometraje del Odómetro
                </Label>
                <div className="relative">
                  <Input
                    id="kilometraje"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 125430"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    className="h-9 text-xs pr-12 font-medium"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground/70 pointer-events-none">
                    km
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Lectura del odómetro del vehículo al momento de la acción.
                </p>
              </div>

              {/* Registro Automático en Bitácora con Geolocalización GPS Interna */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                    <FileText className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        Registro Automático en Bitácora
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Automático
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                      {nextAction.type === "INICIAR" &&
                        "Al iniciar, la bitácora se registrará automáticamente con la partida hacia el destino, geolocalización GPS interna y odómetro inicial."}
                      {nextAction.type === "LLEGADA" &&
                        "Al registrar llegada, la bitácora registrará automáticamente el arribo a destino con geolocalización GPS interna y fecha/hora."}
                      {nextAction.type === "RETORNO" &&
                        "Al iniciar retorno, la bitácora registrará automáticamente la partida hacia la base con geolocalización GPS."}
                      {nextAction.type === "FINALIZAR" &&
                        "Al finalizar la salida, la bitácora registrará automáticamente el cierre del viaje con odómetro final y geolocalización."}
                      {nextAction.type === "AVANZAR" &&
                        "La bitácora registrará automáticamente el hito operativo del flujo vehicular con geolocalización interna."}
                    </p>
                  </div>
                </div>

                {/* Estado de Geolocalización GPS Interna */}
                <div className="pt-2 border-t border-emerald-500/15">
                  {activeGpsStatus === "locating" && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                      <Loader2 className="size-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Detectando ubicación GPS automática en segundo plano...</span>
                    </div>
                  )}

                  {activeGpsStatus === "success" && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex size-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-medium text-emerald-800 dark:text-emerald-300 truncate">
                          Ubicación GPS registrada internamente ({latitud}, {longitud})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={captureGPS}
                        className="h-6 px-2 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-300 shrink-0 gap-1 cursor-pointer"
                        title="Volver a capturar coordenadas"
                      >
                        <RefreshCw className="size-2.5" />
                        Actualizar GPS
                      </Button>
                    </div>
                  )}

                  {activeGpsStatus === "error" && (
                    <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">GPS no disponible (se registrará con hora y odómetro)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={captureGPS}
                        className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-500/15 dark:text-amber-300 shrink-0 gap-1 cursor-pointer"
                      >
                        <RefreshCw className="size-2.5" />
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {activeGpsStatus === "unsupported" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>Navegador sin soporte de geolocalización.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="observacion" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <FileText className="size-3.5 text-muted-foreground" />
                  Observaciones o Novedades
                  <span className="text-muted-foreground font-normal text-[11px]">(opcional)</span>
                </Label>
                <Textarea
                  id="observacion"
                  rows={2}
                  placeholder="Detalles sobre el estado del vehículo, ruta o novedades..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            </div>

            {/* Aviso si no hay acciones de Flowable */}
            {!accionesQuery.isLoading && availableActions.length === 0 && (
              <div className="p-3 bg-muted/30 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 mx-auto mb-1 text-muted-foreground/60" />
                No hay acciones de avance disponibles para la tarea actual en Flowable.
              </div>
            )}
          </div>
        )}

        {/* Footer con Botones de Acción */}
        <DialogFooter className="border-t bg-muted/20 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={accionMutation.isPending}
            className="text-xs cursor-pointer"
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {accionesQuery.isLoading ? (
              <Button size="sm" disabled className="text-xs gap-1.5">
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
                    "h-8.5 text-xs font-semibold gap-1.5 shadow-sm cursor-pointer",
                    nextAction.type === "INICIAR" && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
                    nextAction.type === "LLEGADA" && "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
                    nextAction.type === "RETORNO" && "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
                    nextAction.type === "FINALIZAR" && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
                    nextAction.type === "AVANZAR" && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                  )}
                >
                  {accionMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5 fill-current" />
                  )}
                  <span>{action.name}</span>
                </Button>
              ))
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
