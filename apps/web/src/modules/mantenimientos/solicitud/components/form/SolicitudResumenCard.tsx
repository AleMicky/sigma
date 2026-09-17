import { AlertTriangle, FileText } from "lucide-react"

import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"
import { useSolicitudFormContext } from "../../context/solicitud-form.context"
import { extractPlaca, getPrioridadColorConfig } from "../../lib/solicitud.utils"

function getEmpleadoNombre(emp?: Empleado | null): string {
  if (!emp) return ""
  return emp.personaInfo?.nombreCompleto || emp.personaNombreCompleto || emp.codigo
}

export function SolicitudResumenCard() {
  const {
    form,
    tiposMantenimientoMap,
    prioridadesMap,
    activosMap,
    empleadosMap,
    selectedFiles,
    existingAdjuntos,
  } = useSolicitudFormContext()

  return (
    <form.Subscribe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selector={(state: any) => ({
        titulo: state.values.titulo,
        tipoMantenimientoId: state.values.tipoMantenimientoId,
        prioridadId: state.values.prioridadId,
        solicitanteId: state.values.solicitanteId,
        activoId: state.values.activoId,
        fechaSolicitud: state.values.fechaSolicitud,
        descripcion: state.values.descripcion,
      })}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(values: any) => {
        const isFormComplete = Boolean(
          values.titulo?.trim() &&
          values.tipoMantenimientoId &&
          values.prioridadId &&
          values.solicitanteId &&
          values.activoId &&
          values.descripcion?.trim(),
        )

        if (!isFormComplete) return null

        const selectedTipo = tiposMantenimientoMap.get(values.tipoMantenimientoId)
        const selectedPrioridad = prioridadesMap.get(values.prioridadId)
        const selectedEmpleado = empleadosMap.get(values.solicitanteId)
        const selectedActivo = activosMap.get(values.activoId)
        const cfg = selectedPrioridad
          ? getPrioridadColorConfig(selectedPrioridad.nivel)
          : getPrioridadColorConfig(1)

        const totalAdjuntos = selectedFiles.length + existingAdjuntos.length

        return (
          <div className="p-4 sm:p-5 md:p-6 pt-0 space-y-3 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
            <div
              className={cn(
                "rounded-xl border p-3 sm:p-3.5 transition-all shadow-2xs space-y-2",
                selectedPrioridad
                  ? cfg.alertClass
                  : "bg-muted/30 border-border/80 text-foreground",
              )}
            >
              {/* Header Compacto */}
              <div className="flex items-center justify-between gap-2 border-b border-inherit/15 pb-2">
                <div className="flex items-center gap-2">
                  {selectedPrioridad && selectedPrioridad.nivel >= 4 ? (
                    <AlertTriangle className="size-3.5 text-inherit shrink-0" />
                  ) : (
                    <FileText className="size-3.5 text-inherit shrink-0" />
                  )}
                  <h3 className="font-bold text-xs tracking-tight text-inherit">
                    Resumen de la Solicitud
                  </h3>
                </div>

                {selectedPrioridad && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.2 rounded-full shadow-2xs",
                      cfg.badgeClass,
                    )}
                  >
                    Prioridad {selectedPrioridad.nombre} (Nivel {selectedPrioridad.nivel})
                  </span>
                )}
              </div>

              {/* Resumen Compacto de Campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Título:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {values.titulo?.trim() || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Tipo:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {selectedTipo?.nombre || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Activo:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {selectedActivo
                      ? `${selectedActivo.nombre} (${selectedActivo.codigo})${extractPlaca(selectedActivo) ? ` - Placa: ${extractPlaca(selectedActivo)}` : ""}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Solicitante:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {selectedEmpleado
                      ? getEmpleadoNombre(selectedEmpleado)
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Fecha y Hora:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {values.fechaSolicitud
                      ? formatDateTime(values.fechaSolicitud)
                      : "Ahora"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    Adjuntos:
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {totalAdjuntos > 0
                      ? `${totalAdjuntos} archivo(s)`
                      : "0"}
                  </span>
                </div>
              </div>

              {/* Impacto */}
              {selectedPrioridad && (
                <div className="pt-1.5 text-[10.5px] opacity-85 leading-tight border-t border-inherit/15 truncate">
                  <span className="font-bold mr-1">Impacto:</span>
                  {selectedPrioridad.descripcion ||
                    cfg.defaultDescription}
                </div>
              )}
            </div>
          </div>
        )
      }}
    </form.Subscribe>
  )
}
