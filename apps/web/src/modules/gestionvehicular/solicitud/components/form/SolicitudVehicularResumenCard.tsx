import { CarFront, Clock, FileText, MapPin, Users } from "lucide-react"

import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

function getEmpleadoNombre(emp?: Empleado | null): string {
  if (!emp) return ""
  return emp.personaInfo?.nombreCompleto || emp.personaNombreCompleto || emp.codigo
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
      })}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(values: any) => {
        const isFormStarted = Boolean(
          values.destino?.trim() ||
          values.motivo?.trim() ||
          values.tipoSolicitudVehicularId ||
          values.solicitanteId
        )

        if (!isFormStarted) return null

        const selectedTipo = tiposMap.get(values.tipoSolicitudVehicularId)
        const selectedEmpleado = empleadosMap.get(values.solicitanteId)
        const totalAdjuntos = selectedFiles.length + existingAdjuntos.length

        return (
          <div className="p-3 sm:p-3.5 pt-0 space-y-2 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
            <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 sm:p-3 transition-all shadow-2xs space-y-2 text-foreground">
              {/* Header Compacto */}
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                <div className="flex items-center gap-2">
                  <CarFront className="size-3.5 text-primary shrink-0" />
                  <h3 className="font-bold text-xs tracking-tight text-foreground">
                    Resumen de la Solicitud Vehicular
                  </h3>
                </div>

                {selectedTipo && (
                  <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                    {selectedTipo.nombre}
                  </Badge>
                )}
              </div>

              {/* Resumen Compacto de Campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    N° Solicitud:
                  </span>
                  <span className="font-mono font-medium text-foreground truncate">
                    {values.numero || "Autogenerado"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Solicitante:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {selectedEmpleado ? getEmpleadoNombre(selectedEmpleado) : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Destino:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    {values.destino?.trim() || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Salida:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    {values.fechaSalida ? formatDateTime(values.fechaSalida) : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Retorno Est.:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    {values.fechaRetornoEstimada
                      ? formatDateTime(values.fechaRetornoEstimada)
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Pasajeros / Adjuntos:
                  </span>
                  <span className="font-medium text-foreground truncate flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-muted-foreground" />
                      {values.cantidadPasajeros || 1}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileText className="size-3 text-muted-foreground" />
                      {totalAdjuntos} archivo(s)
                    </span>
                  </span>
                </div>
              </div>

              {/* Motivo */}
              {values.motivo?.trim() && (
                <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40 truncate">
                  <strong className="text-foreground font-semibold mr-1">Motivo:</strong>
                  {values.motivo.trim()}
                </div>
              )}
            </div>
          </div>
        )
      }}
    </form.Subscribe>
  )
}
