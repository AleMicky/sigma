import {
  History,
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
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

import type { SolicitudMantenimiento } from "../api/solicitud.service"

type SolicitudTrazabilidadModalProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SolicitudTrazabilidadModal({
  solicitud,
  open,
  onOpenChange,
}: SolicitudTrazabilidadModalProps) {
  if (!solicitud) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-5">
        <DialogHeader className="pb-3 border-b space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold text-foreground">
                Trazabilidad del Flujo de Trabajo
              </DialogTitle>
              <p className="font-mono text-[11px] text-muted-foreground">
                Expediente: <strong className="text-primary">{solicitud.numero || "Sin Folio"}</strong>
              </p>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Historial cronológico de etapas, aprobaciones, asignaciones y validaciones.
          </DialogDescription>
        </DialogHeader>

        {/* Timeline Content */}
        <div className="py-2 space-y-3">
          <div className="space-y-3 divide-y divide-border/40 text-xs">
            {/* 1. Solicitado */}
            <div className="flex items-start gap-3 pt-2 first:pt-0">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5 font-bold text-xs">
                1
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Solicitud Registrada</p>
                  {solicitud.fechaSolicitud && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(solicitud.fechaSolicitud)}
                    </span>
                  )}
                </div>
                {solicitud.solicitante && (
                  <p className="text-[11px] text-muted-foreground">
                    Solicitante: <strong className="text-foreground">{solicitud.solicitante.nombre}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* 2. Aprobado */}
            <div className="flex items-start gap-3 pt-2.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                  solicitud.aprobadoPor || solicitud.fechaAprobacion
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                2
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    Evaluación y Aprobación
                  </p>
                  {solicitud.fechaAprobacion && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(solicitud.fechaAprobacion)}
                    </span>
                  )}
                </div>
                {solicitud.aprobadoPor ? (
                  <p className="text-[11px] text-muted-foreground">
                    Aprobado por: <strong className="text-foreground">{solicitud.aprobadoPor.nombre}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Pendiente de aprobación
                  </p>
                )}
                {solicitud.observacionAprobacion && (
                  <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-2 rounded-lg mt-1 border border-border/50">
                    "{solicitud.observacionAprobacion}"
                  </p>
                )}
              </div>
            </div>

            {/* 3. Asignado / En Ejecución */}
            <div className="flex items-start gap-3 pt-2.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                  solicitud.responsable || solicitud.fechaInicioMantenimiento
                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                3
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    Asignación y Mantenimiento
                  </p>
                  {solicitud.fechaInicioMantenimiento && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(solicitud.fechaInicioMantenimiento)}
                    </span>
                  )}
                </div>
                {solicitud.responsable ? (
                  <p className="text-[11px] text-muted-foreground">
                    Técnico Asignado: <strong className="text-foreground">{solicitud.responsable.nombre}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Sin técnico asignado
                  </p>
                )}
              </div>
            </div>

            {/* 4. Cierre y Validación */}
            <div className="flex items-start gap-3 pt-2.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                  solicitud.fechaFinalizacion || solicitud.recibidoPor
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                4
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    Validación y Cierre de Expediente
                  </p>
                  {solicitud.fechaFinalizacion && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(solicitud.fechaFinalizacion)}
                    </span>
                  )}
                </div>
                {solicitud.recibidoPor ? (
                  <p className="text-[11px] text-muted-foreground">
                    Conformidad recibida por: <strong className="text-foreground">{solicitud.recibidoPor.nombre}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Pendiente de cierre técnico
                  </p>
                )}
                {solicitud.observacionCierre && (
                  <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-2 rounded-lg mt-1 border border-border/50">
                    "{solicitud.observacionCierre}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            Cerrar Historial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
