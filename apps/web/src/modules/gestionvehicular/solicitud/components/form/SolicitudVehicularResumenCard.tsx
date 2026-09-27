import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck,
  Flame,
  MapPin,
  Users,
} from "lucide-react"

import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

function getEmpleadoNombre(emp?: Empleado | null): string {
  if (!emp) return ""
  return emp.personaInfo?.nombreCompleto || emp.personaNombreCompleto || emp.codigo
}

function calculateDuration(salida?: string, retorno?: string): string | null {
  if (!salida || !retorno) return null
  const dSalida = new Date(salida)
  const dRetorno = new Date(retorno)
  if (isNaN(dSalida.getTime()) || isNaN(dRetorno.getTime())) return null

  const diffMs = dRetorno.getTime() - dSalida.getTime()
  if (diffMs < 0) return null

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const days = Math.floor(diffMinutes / (24 * 60))
  const hours = Math.floor((diffMinutes % (24 * 60)) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  return parts.length > 0 ? parts.join(" ") : "< 1h"
}

export function SolicitudVehicularResumenCard() {
  const {
    form,
    tiposMap,
    empleadosMap,
    selectedFiles,
    existingAdjuntos,
  } = useSolicitudVehicularFormContext()

  return (
    <form.Subscribe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selector={(state: any) => ({
        numero: state.values.numero,
        tipoSolicitudVehicularId: state.values.tipoSolicitudVehicularId,
        solicitanteId: state.values.solicitanteId,
        destino: state.values.destino,
        motivo: state.values.motivo,
        fechaSalida: state.values.fechaSalida,
        fechaRetornoEstimada: state.values.fechaRetornoEstimada,
        cantidadPasajeros: state.values.cantidadPasajeros,
        justificacion: state.values.justificacion,
      })}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(values: any) => {
        const selectedTipo = tiposMap.get(values.tipoSolicitudVehicularId)
        const isJustificacionRequired = Boolean(selectedTipo?.requiereJustificacion)
        const isEmergencia = Boolean(
          selectedTipo &&
          ((selectedTipo.diasAnticipacion ?? 0) === 0 ||
           selectedTipo.codigo?.toUpperCase() === "EMERGENCIA" ||
           selectedTipo.nombre?.toUpperCase().includes("EMERGENCIA"))
        )

        // Solo mostrar la ficha resumen cuando todos los campos requeridos estén completados
        const isComplete = Boolean(
          values.solicitanteId &&
          values.tipoSolicitudVehicularId &&
          values.destino?.trim() &&
          values.motivo?.trim() &&
          values.fechaSalida &&
          values.fechaRetornoEstimada &&
          (!isJustificacionRequired || values.justificacion?.trim())
        )

        if (!isComplete) return null

        const selectedEmpleado = empleadosMap.get(values.solicitanteId)
        const totalAdjuntos = selectedFiles.length + existingAdjuntos.length
        const durationText = calculateDuration(values.fechaSalida, values.fechaRetornoEstimada)

        return (
          <div className="p-3 sm:p-3.5 pt-1 space-y-1.5 animate-in fade-in-50 duration-200">
            <div
              className={cn(
                "rounded-lg border p-2.5 sm:p-3 transition-colors shadow-2xs space-y-2",
                isEmergencia
                  ? "border-rose-500/40 bg-gradient-to-br from-rose-500/[0.07] via-card to-background shadow-rose-500/5"
                  : "border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-background"
              )}
            >
              {/* Header de Resumen */}
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-5 items-center justify-center rounded-md text-white shadow-2xs",
                      isEmergencia ? "bg-rose-600 dark:bg-rose-500" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {isEmergencia ? <Flame className="size-3 animate-pulse" /> : <ClipboardList className="size-3" />}
                  </div>
                  <h3 className="font-bold text-xs tracking-tight text-foreground">
                    Ficha Resumen
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-medium text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Datos requeridos completos</span>
                  </span>
                  {selectedTipo && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9.5px] font-semibold px-1.5 py-0 gap-1",
                        isEmergencia
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-800 font-bold"
                          : "bg-primary/10 text-primary border-primary/30"
                      )}
                    >
                      {isEmergencia && <Flame className="size-2.5 text-rose-600 dark:text-rose-400 animate-pulse" />}
                      {selectedTipo.nombre}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid de Datos Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
                {/* N° Solicitud */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    N° Solicitud:
                  </span>
                  <span className="font-mono font-bold text-foreground text-xs truncate">
                    {values.numero ? `#${values.numero}` : "Correlativo autogenerado"}
                  </span>
                </div>

                {/* Solicitante */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    Solicitante:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {selectedEmpleado ? getEmpleadoNombre(selectedEmpleado) : "—"}
                  </span>
                </div>

                {/* Destino */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    Destino:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <MapPin className="size-3 text-primary shrink-0" />
                    {values.destino?.trim() || "—"}
                  </span>
                </div>

                {/* Salida */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    Salida:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    {values.fechaSalida ? formatDateTime(values.fechaSalida) : "—"}
                  </span>
                </div>

                {/* Retorno Estimado */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    Retorno:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    {values.fechaRetornoEstimada
                      ? formatDateTime(values.fechaRetornoEstimada)
                      : "—"}
                    {durationText && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 font-bold ml-0.5 bg-primary/10 text-primary">
                        {durationText}
                      </Badge>
                    )}
                  </span>
                </div>

                {/* Pasajeros y Archivos */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-semibold text-muted-foreground shrink-0">
                    Detalles:
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground truncate text-[11px]">
                    <span className="flex items-center gap-0.5">
                      <Users className="size-3 text-muted-foreground" />
                      {values.cantidadPasajeros || 1} pas.
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-0.5">
                      <FileCheck className="size-3 text-muted-foreground" />
                      {totalAdjuntos} adjunto(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivo */}
              {values.motivo?.trim() && (
                <div className="pt-1.5 text-[11px] text-muted-foreground border-t border-border/40 truncate">
                  <span className="font-semibold text-foreground mr-1">Motivo:</span>
                  <span className="text-foreground/90">{values.motivo.trim()}</span>
                </div>
              )}
            </div>
          </div>
        )
      }}
    </form.Subscribe>
  )
}
