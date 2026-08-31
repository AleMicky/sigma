import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  History,
  Loader2,
  Package,
  Plus,
  User,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { controlActivoQueries } from "../api/control-activo.queries"
import type { ControlActivo } from "../api/control-activo.service"

type ControlActivoHistorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId?: string | null
  solicitudNumero?: string | null
}

function ControlItemCard({ control }: { control: ControlActivo }) {
  const [expanded, setExpanded] = useState(false)

  const detallesQuery = useQuery({
    ...controlActivoQueries.detallesList({ controlActivoId: control.id }),
    enabled: expanded,
  })

  const detalles = detallesQuery.data?.content ?? []
  const isEntrega = control.tipo === "ENTREGA"

  return (
    <div className="rounded-xl border bg-card shadow-2xs overflow-hidden transition-all">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 select-none"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-xs",
              isEntrega
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
            )}
          >
            {isEntrega ? "ENT" : "DEV"}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-sm font-bold text-foreground">
                Acta de {isEntrega ? "Entrega" : "Devolución"}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border",
                  control.conforme
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                )}
              >
                {control.conforme ? (
                  <CheckCircle2 className="size-3 text-emerald-500" />
                ) : (
                  <AlertTriangle className="size-3 text-amber-500" />
                )}
                {control.conforme ? "Conforme" : "Con Observaciones"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(control.fecha)}
              </span>
              {control.entregadoPor && (
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  Entrega: <strong className="text-foreground">{control.entregadoPor.nombre}</strong>
                </span>
              )}
              {control.recibidoPor && (
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  Recibe: <strong className="text-foreground">{control.recibidoPor.nombre}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-semibold gap-1"
          >
            <span>{expanded ? "Ocultar accesorios" : "Ver accesorios"}</span>
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {control.observacion && (
        <div className="px-3.5 pb-3 text-xs text-muted-foreground bg-muted/20 border-t pt-2">
          <strong>Observación general:</strong> {control.observacion}
        </div>
      )}

      {/* Detalles desplegables */}
      {expanded && (
        <div className="border-t bg-muted/40 p-3 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Package className="size-3.5 text-primary" />
            Accesorios y Elementos Verificados
          </h4>

          {detallesQuery.isLoading ? (
            <div className="flex items-center gap-2 py-4 justify-center text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando verificación de accesorios...</span>
            </div>
          ) : detalles.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No se registraron accesorios específicos en este control.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {detalles.map((det) => (
                <div
                  key={det.id}
                  className="rounded-lg border bg-card p-2.5 text-xs shadow-2xs flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {det.accesorio?.codigo ?? "ACC"}
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {det.accesorio?.nombre ?? "Accesorio"}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        det.conforme
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {det.conforme ? "OK" : "NO OK"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-1.5">
                    <span>
                      Esperado: <strong className="text-foreground">{det.cantidadEsperada}</strong>
                    </span>
                    <span>
                      Encontrado: <strong className="text-foreground">{det.cantidadEncontrada}</strong>
                    </span>
                  </div>

                  {det.observacion && (
                    <p className="text-[10px] text-muted-foreground italic bg-muted/30 p-1 rounded">
                      Obs: {det.observacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ControlActivoHistorialModal({
  open,
  onOpenChange,
  solicitudId,
  solicitudNumero,
}: ControlActivoHistorialModalProps) {
  const controlesQuery = useQuery({
    ...controlActivoQueries.list({
      solicitudMantenimientoId: solicitudId ?? undefined,
      size: 50,
      sortBy: "fecha",
      direction: "DESC",
    }),
    enabled: open && Boolean(solicitudId),
  })

  const controles = controlesQuery.data?.content ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <History className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold">
                  Historial de Controles de Activo
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Actas de Entrega y Devolución registradas para el folio{" "}
                  <strong className="text-foreground font-mono">
                    {solicitudNumero || "N/A"}
                  </strong>
                </DialogDescription>
              </div>
            </div>

            {solicitudId && (
              <Link
                to="/mantenimientos/controles-activos/nuevo"
                search={{ solicitudId }}
                onClick={() => onOpenChange(false)}
                className="shrink-0"
              >
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="size-3.5" />
                  <span>Registrar Acta</span>
                </Button>
              </Link>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {controlesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Cargando historial de actas...</span>
            </div>
          ) : controles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
              <ClipboardList className="size-10 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-foreground">
                  Sin controles registrados
                </p>
                <p className="text-xs max-w-xs text-muted-foreground">
                  Aún no se han generado actas de entrega ni devolución de activo para esta solicitud.
                </p>
                {solicitudId && (
                  <Link
                    to="/mantenimientos/controles-activos/nuevo"
                    search={{ solicitudId }}
                    onClick={() => onOpenChange(false)}
                  >
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-sm mt-2"
                    >
                      <Plus className="size-3.5" />
                      <span>Crear Acta Ahora</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            controles.map((control) => (
              <ControlItemCard key={control.id} control={control} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
