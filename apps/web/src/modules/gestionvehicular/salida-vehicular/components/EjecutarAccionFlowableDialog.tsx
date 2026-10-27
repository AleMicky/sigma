import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Compass,
  Gauge,
  Loader2,
  MapPin,
  Play,
} from "lucide-react"
import { toast } from "sonner"

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

export function EjecutarAccionFlowableDialog({
  open,
  onOpenChange,
  salida,
}: EjecutarAccionFlowableDialogProps) {
  const [kilometraje, setKilometraje] = useState<string>("")
  const [latitud, setLatitud] = useState<string>("")
  const [longitud, setLongitud] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")
  const [isLocating, setIsLocating] = useState(false)

  // Fetch pending task and dynamic actions
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

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada por el navegador")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
        setIsLocating(false)
        toast.success("Coordenadas GPS capturadas con éxito")
      },
      (err) => {
        setIsLocating(false)
        toast.error(`Error al obtener ubicación: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleExecute = async (action: WorkflowAction) => {
    if (!salida) return

    const accionId = action.variable || action.value || action.name

    await accionMutation.mutateAsync({
      id: salida.id,
      accionId,
      data: {
        kilometraje: kilometraje ? parseFloat(kilometraje) : undefined,
        latitud: latitud ? parseFloat(latitud) : undefined,
        longitud: longitud ? parseFloat(longitud) : undefined,
        observacion: observacion.trim() || undefined,
        variables: {
          [action.variable]: action.value,
        },
      },
    })

    // Reset and close
    setKilometraje("")
    setLatitud("")
    setLongitud("")
    setObservacion("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-lg border shadow-2xs shrink-0",
                nextAction.buttonClassName
              )}
            >
              <ActionIcon className={cn("size-3.5", nextAction.iconClassName)} />
            </div>
            <span>{nextAction.label} &bull; Salida #{salida?.numero}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre los datos operativos de odómetro, geolocalización GPS y observaciones para ejecutar la acción.
          </DialogDescription>
        </DialogHeader>

        {salida && (
          <div className="space-y-4 py-2 text-xs">
            {/* Resumen de Salida */}
            <div className="p-3 bg-muted/40 rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground text-sm">
                  Salida #{salida.numero}
                </span>
                <p className="text-muted-foreground text-[11px]">
                  {salida.placa ? `Placa: ${salida.placa}` : salida.activoDescripcion} &bull; {salida.origen} &rarr; {salida.destino}
                </p>
              </div>
              <SalidaVehicularStatusBadge status={salida.estado} />
            </div>

            {/* Tarea Actual BPMN */}
            <div className="p-3.5 bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tarea Actual Pendiente
                </span>
                {tareaQuery.isLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              </div>
              {currentTask ? (
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {currentTask.name || currentTask.taskDefinitionKey}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    ID Proceso: {currentTask.processInstanceId} &bull; Clave: {currentTask.taskDefinitionKey}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {tareaQuery.isLoading
                    ? "Cargando tarea actual de Flowable..."
                    : "No hay tareas pendientes activas para este proceso (posiblemente finalizado o cancelado)."}
                </p>
              )}
            </div>

            {/* Formulario de Parámetros de Evento / Transición */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="kilometraje" className="text-xs font-medium flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                    Kilometraje Odometer
                  </Label>
                  <Input
                    id="kilometraje"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 125430"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Ubicación GPS
                    </Label>
                    <button
                      type="button"
                      onClick={handleCaptureGPS}
                      disabled={isLocating}
                      className="text-[10px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {isLocating ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Compass className="h-2.5 w-2.5" />
                      )}
                      Capturar GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input
                      placeholder="Latitud"
                      value={latitud}
                      onChange={(e) => setLatitud(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                    <Input
                      placeholder="Longitud"
                      value={longitud}
                      onChange={(e) => setLongitud(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="observacion" className="text-xs font-medium">
                  Observación del Hito / Movimiento
                </Label>
                <Textarea
                  id="observacion"
                  rows={2}
                  placeholder="Detalles sobre el estado del vehículo, ruta o llegada..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            </div>

            {/* Acciones Disponibles */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-foreground">
                Acciones de Avance Disponibles ({availableActions.length})
              </span>
              {availableActions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableActions.map((action) => (
                    <Button
                      key={action.name}
                      type="button"
                      onClick={() => handleExecute(action)}
                      disabled={accionMutation.isPending}
                      className="h-8 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      {accionMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 fill-current" />
                      )}
                      {action.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-muted/20 border border-dashed rounded-lg text-center text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground/60" />
                  No hay acciones de avance disponibles para la tarea actual.
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={accionMutation.isPending}
            className="text-xs"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
