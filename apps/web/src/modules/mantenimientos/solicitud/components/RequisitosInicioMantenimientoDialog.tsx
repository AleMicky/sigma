import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Lock,
  Plus,
  Wrench,
  XCircle,
} from "lucide-react"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { ordenTrabajoQueries } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.queries"
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
import type { SolicitudMantenimiento } from "../types/solicitud.type"

export type RequisitosInicioMantenimientoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  actionName?: string
  onRegistrarEntrega: (solicitud: SolicitudMantenimiento) => void
  onGestionarOT: (solicitud: SolicitudMantenimiento) => void
  onProceedWithAction?: () => void
}

export function RequisitosInicioMantenimientoDialog({
  open,
  onOpenChange,
  solicitud,
  actionName = "Iniciar Mantenimiento",
  onRegistrarEntrega,
  onGestionarOT,
  onProceedWithAction,
}: RequisitosInicioMantenimientoDialogProps) {
  const solicitudId = solicitud?.id ?? ""

  // Consultar controles de activo de la solicitud
  const controlesQuery = useQuery({
    ...controlActivoQueries.bySolicitud(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  // Consultar orden de trabajo asociada a la solicitud
  const otQuery = useQuery({
    ...ordenTrabajoQueries.bySolicitud(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  const controles = controlesQuery.data ?? []
  const hasEntrega = useMemo(
    () => controles.some((c) => c.tipo === "ENTREGA"),
    [controles],
  )

  const ordenTrabajo = otQuery.data ?? null
  const hasOT = Boolean(ordenTrabajo?.id)

  const isComplete = hasEntrega && hasOT

  if (!solicitud) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
        {/* Cabecera */}
        <DialogHeader className="px-5 py-4 border-b bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/20 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs shrink-0">
              {isComplete ? (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock className="size-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold text-foreground">
                Requisitos Obligatorios para Cambiar de Estado
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                Solicitud <strong className="text-foreground">{solicitud.numero}</strong>:{" "}
                {solicitud.titulo}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido Principal */}
        <div className="p-5 space-y-4 text-xs">
          {/* Banner de Advertencia */}
          {!isComplete ? (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-semibold text-xs text-amber-800 dark:text-amber-300">
                  Acción bloqueada temporalmente
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Para poder avanzar al estado <strong>En Mantenimiento</strong> y ejecutar la acción{" "}
                  <em>"{actionName}"</em>, debes registrar el <strong>Acta de Entrega de Activo</strong> y la{" "}
                  <strong>Orden de Trabajo (OT)</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                  Requisitos completados satisfactoriamente
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Se verificó el Acta de Entrega y la Orden de Trabajo. Puedes proceder a cambiar de estado.
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de Requisitos */}
          <div className="space-y-2.5">
            {/* Requisito 1: Acta de Entrega */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                hasEntrega
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-card border-border/80 shadow-2xs",
              )}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg shrink-0",
                    hasEntrega
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  )}
                >
                  <ClipboardCheck className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-xs">
                      1. Acta de Entrega de Activo
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        hasEntrega
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {hasEntrega ? (
                        <>
                          <CheckCircle2 className="size-2.5" />
                          <span>Registrada</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-2.5" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Control físico de accesorios y estado del activo entregado al encargado técnico.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="xs"
                variant={hasEntrega ? "outline" : "default"}
                onClick={() => {
                  onOpenChange(false)
                  onRegistrarEntrega(solicitud)
                }}
                className={cn(
                  "h-7 text-xs gap-1.5 font-semibold shrink-0 cursor-pointer shadow-2xs",
                  !hasEntrega && "bg-sky-600 hover:bg-sky-700 text-white",
                )}
              >
                {hasEntrega ? (
                  <>
                    <FileText className="size-3" />
                    <span>Ver Acta</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3" />
                    <span>Registrar Entrega</span>
                  </>
                )}
              </Button>
            </div>

            {/* Requisito 2: Orden de Trabajo */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                hasOT
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-card border-border/80 shadow-2xs",
              )}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg shrink-0",
                    hasOT
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  )}
                >
                  <Wrench className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-xs">
                      2. Orden de Trabajo (OT)
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        hasOT
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {hasOT ? (
                        <>
                          <CheckCircle2 className="size-2.5" />
                          <span>{ordenTrabajo?.numero ? `Creada (${ordenTrabajo.numero})` : "Creada"}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-2.5" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Planificación de actividades, checklist técnico y evidencias de la intervención.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="xs"
                variant={hasOT ? "outline" : "default"}
                onClick={() => {
                  onOpenChange(false)
                  onGestionarOT(solicitud)
                }}
                className={cn(
                  "h-7 text-xs gap-1.5 font-semibold shrink-0 cursor-pointer shadow-2xs",
                  !hasOT && "bg-amber-600 hover:bg-amber-700 text-white",
                )}
              >
                {hasOT ? (
                  <>
                    <FileText className="size-3" />
                    <span>Ver Orden de Trabajo</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3" />
                    <span>Crear Orden de Trabajo</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Pie de Diálogo */}
        <DialogFooter className="px-5 py-3 border-t bg-muted/20 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold px-3 cursor-pointer"
          >
            {isComplete ? "Cancelar" : "Cerrar"}
          </Button>

          {isComplete && onProceedWithAction && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onProceedWithAction()
              }}
              className="h-8 text-xs font-bold px-4 gap-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              <span>Continuar con {actionName}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
