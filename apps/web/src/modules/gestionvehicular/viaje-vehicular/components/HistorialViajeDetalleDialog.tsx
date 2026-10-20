import {
  Car,
  Clock,
  FileText,
  Gauge,
  MapPin,
  Navigation,
  User,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { formatDate } from "@/shared/lib/format-date"
import type { ViajeVehicular } from "../api/viaje-vehicular.service"

export interface HistorialViajeDetalleDialogProps {
  viaje: ViajeVehicular | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "FINALIZADO":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          ● Finalizado
        </Badge>
      )
    case "EN_CURSO":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          En Tránsito
        </Badge>
      )
    case "PROGRAMADO":
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
          ● Programado
        </Badge>
      )
    case "CANCELADO":
      return (
        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">
          ● Cancelado
        </Badge>
      )
    default:
      return <Badge variant="outline">{estado}</Badge>
  }
}

export function HistorialViajeDetalleDialog({
  viaje,
  open,
  onOpenChange,
}: Readonly<HistorialViajeDetalleDialogProps>) {
  if (!viaje) return null

  const asig = viaje.asignacionVehicular
  const sol = asig?.solicitudVehicular
  const act = asig?.activo
  const cond = asig?.conductor

  const kmSalida = viaje.kilometrajeSalida
  const kmRetorno = viaje.kilometrajeRetorno
  const kmRecorrido =
    kmRetorno != null && kmSalida != null && kmRetorno >= kmSalida
      ? kmRetorno - kmSalida
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Detalle del Viaje
                {sol?.numero && (
                  <span className="text-muted-foreground font-medium text-sm">
                    ({sol.numero})
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Información técnica y operativa registrada del viaje vehicular
              </DialogDescription>
            </div>
            <div>{getEstadoBadge(viaje.estado)}</div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Ficha Vehículo y Conductor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Vehículo */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Car className="h-4 w-4 text-sky-500" />
                Vehículo Asignado
              </div>
              <div className="text-sm font-bold text-foreground">
                {act?.placa ? `Placa: ${act.placa}` : act?.nombre || "N/D"}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Código Activo: <span className="font-mono text-foreground">{act?.codigo || "N/D"}</span></p>
                {act?.nombre && <p>Descripción: {act.nombre}</p>}
                {act?.estadoOperativoNombre && (
                  <p>Estado Operativo: <span className="font-medium">{act.estadoOperativoNombre}</span></p>
                )}
              </div>
            </div>

            {/* Conductor */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                <User className="h-4 w-4 text-emerald-500" />
                Conductor Asignado
              </div>
              <div className="text-sm font-bold text-foreground">
                {cond?.nombreCompleto || "N/D"}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Licencia: <span className="font-mono text-foreground">{cond?.numeroLicencia || "N/D"}</span></p>
                {cond?.categoriaLicencia && (
                  <p>Categoría: <Badge variant="outline" className="text-[10px]">{cond.categoriaLicencia}</Badge></p>
                )}
              </div>
            </div>
          </div>

          {/* Odometría y Kilometraje */}
          <div className="p-4 rounded-xl border border-border/60 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Gauge className="h-4 w-4" />
                Control de Odómetro y Distancia
              </span>
              {kmRecorrido != null && (
                <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold border-sky-400/30">
                  +{kmRecorrido.toLocaleString()} km recorridos
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-background border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Odómetro Salida</span>
                <p className="text-base font-bold text-foreground font-mono">
                  {kmSalida != null ? `${kmSalida.toLocaleString()} km` : "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Odómetro Retorno</span>
                <p className="text-base font-bold text-foreground font-mono">
                  {kmRetorno != null ? `${kmRetorno.toLocaleString()} km` : "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Total Recorrido</span>
                <p className="text-base font-bold text-primary font-mono">
                  {kmRecorrido != null ? `${kmRecorrido.toLocaleString()} km` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas y Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border/40 bg-card space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                Salida Real
              </span>
              <p className="text-sm font-semibold text-foreground">
                {viaje.fechaSalidaReal ? formatDate(viaje.fechaSalidaReal, "PPP p") : "Pendiente de registro"}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/40 bg-card space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                Retorno Real
              </span>
              <p className="text-sm font-semibold text-foreground">
                {viaje.fechaRetornoReal ? formatDate(viaje.fechaRetornoReal, "PPP p") : "Pendiente de registro"}
              </p>
            </div>
          </div>

          {/* Solicitud e Itinerario */}
          {sol && (
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-2 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                Destino y Motivo de Solicitud
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Destino:</span>
                  <p className="font-medium text-foreground">{sol.destino || "No especificado"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Motivo:</span>
                  <p className="font-medium text-foreground">{sol.motivo || "No especificado"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {viaje.observacion && (
            <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-1 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                Observaciones
              </span>
              <p className="text-muted-foreground whitespace-pre-wrap">{viaje.observacion}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
