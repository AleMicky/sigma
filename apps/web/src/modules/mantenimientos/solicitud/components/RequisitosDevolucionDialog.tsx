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
  XCircle,
} from "lucide-react"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
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

export type RequisitosDevolucionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  actionName?: string
  onRegistrarDevolucion: (solicitud: SolicitudMantenimiento) => void
  onProceedWithAction?: () => void
}

export function RequisitosDevolucionDialog({
  open,
  onOpenChange,
  solicitud,
  actionName = "Finalizar Solicitud",
  onRegistrarDevolucion,
  onProceedWithAction,
}: RequisitosDevolucionDialogProps) {
  const solicitudId = solicitud?.id ?? ""

  // Consultar controles de activo de la solicitud
  const controlesQuery = useQuery({
    ...controlActivoQueries.bySolicitud(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  const controles = controlesQuery.data ?? []
  const devolucion = useMemo(
    () => controles.find((c) => c.tipo === "DEVOLUCION"),
    [controles],
  )
  const hasDevolucion = Boolean(devolucion)

  if (!solicitud) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
        {/* Cabecera */}
        <DialogHeader className="px-5 py-4 border-b bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/20 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs shrink-0">
              {hasDevolucion ? (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock className="size-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold text-foreground">
                Requisito Obligatorio: Acta de Devolución
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
          {!hasDevolucion ? (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-semibold text-xs text-amber-800 dark:text-amber-300">
                  Acción bloqueada: Debe registrar el Acta de Devolución
                </p>
                <p className="text-[11px] text-muted-foreground">
                  El trabajo técnico ha sido completado. Para ejecutar la acción{" "}
                  <em>"{actionName}"</em> y cambiar el estado de la solicitud, es obligatorio registrar previamente el{" "}
                  <strong>Acta de Devolución del Activo</strong> para constatar la recepción conforme del bien.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                  Acta de Devolución registrada
                </p>
                <p className="text-[11px] text-muted-foreground">
                  El acta de devolución se encuentra registrada en el sistema. Puedes continuar con el cambio de estado.
                </p>
              </div>
            </div>
          )}

          {/* Tarjeta de Requisito */}
          <div className="space-y-2.5">
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                hasDevolucion
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-card border-border/80 shadow-2xs",
              )}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg shrink-0",
                    hasDevolucion
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  )}
                >
                  <ClipboardCheck className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-xs">
                      Acta de Devolución de Activo
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        hasDevolucion
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {hasDevolucion ? (
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
                    Constancia física y verificación de estado al momento de devolver el activo al solicitante.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="xs"
                variant={hasDevolucion ? "outline" : "default"}
                onClick={() => {
                  onOpenChange(false)
                  onRegistrarDevolucion(solicitud)
                }}
                className={cn(
                  "h-7 text-xs gap-1.5 font-semibold shrink-0 cursor-pointer shadow-2xs",
                  !hasDevolucion && "bg-sky-600 hover:bg-sky-700 text-white",
                )}
              >
                {hasDevolucion ? (
                  <>
                    <FileText className="size-3" />
                    <span>Ver Acta</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3" />
                    <span>Registrar Devolución</span>
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
            {hasDevolucion ? "Cancelar" : "Cerrar"}
          </Button>

          {hasDevolucion && onProceedWithAction && (
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
