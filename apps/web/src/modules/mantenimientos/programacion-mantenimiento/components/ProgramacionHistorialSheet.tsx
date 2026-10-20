import { CheckCircle2, Clock, Gauge, History, Hourglass, ShieldAlert } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useHistorialProgramacion } from "../api/programacion-mantenimiento.queries"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"

interface ProgramacionHistorialSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacion: ProgramacionMantenimiento | null
}

export function ProgramacionHistorialSheet({
  open,
  onOpenChange,
  programacion,
}: ProgramacionHistorialSheetProps) {
  const { data: historial = [], isLoading } = useHistorialProgramacion(
    open ? programacion?.id : undefined,
  )

  if (!programacion) return null

  const activo = programacion.planActivo

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <History className="size-5" />
            <SheetTitle className="text-lg font-bold">
              Historial de Disparos y Mantenimientos
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Registro histórico de valores y criterios que provocaron cada ejecución preventiva (Regla 6).
          </SheetDescription>
        </SheetHeader>

        {/* Resumen Cabecera */}
        <div className="my-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
          <div className="font-semibold text-foreground">
            {activo?.activoCodigo} • {activo?.activoNombre}
          </div>
          <div className="text-muted-foreground text-[11px]">
            Plan: <span className="font-medium text-foreground">{activo?.planNombre}</span>
          </div>
        </div>

        {/* Lista de Registros Históricos */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : historial.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
              <ShieldAlert className="size-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Sin registros históricos aún</p>
              <p className="text-[11px] mt-0.5">
                Los registros se conservan automáticamente cada vez que se evalúa y cumple un criterio de mantenimiento.
              </p>
            </div>
          ) : (
            historial.map((item, index) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-border/60 bg-card p-3.5 shadow-xs space-y-2.5 text-xs transition-all hover:border-primary/40"
              >
                {/* Header del registro */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                      #{historial.length - index}
                    </span>
                    <Badge
                      variant={item.completado ? "default" : "secondary"}
                      className={`text-[10px] font-semibold ${
                        item.completado
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.completado ? "Servicio Completado" : "En Trámite"}
                    </Badge>
                  </div>

                  {item.solicitudNumero && (
                    <Badge variant="outline" className="text-[11px] font-mono">
                      {item.solicitudNumero}
                    </Badge>
                  )}
                </div>

                {/* Criterio disparador y valores */}
                <div className="rounded-lg bg-muted/40 p-2.5 space-y-1.5 text-[11.5px]">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-primary">
                      {item.tipoCriterioDisparador === "TIEMPO" && <Clock className="size-3.5" />}
                      {item.tipoCriterioDisparador === "KILOMETRAJE" && <Gauge className="size-3.5" />}
                      {item.tipoCriterioDisparador === "HORAS_USO" && <Hourglass className="size-3.5" />}
                      Criterio: {item.tipoCriterioDisparador}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground font-normal">
                      Disparo: {new Date(item.fechaDisparo).toLocaleDateString()}{" "}
                      {new Date(item.fechaDisparo).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px] pt-0.5">
                    <div>
                      <span className="text-muted-foreground/80">Valor disparador:</span>
                      <div className="font-medium text-foreground">{item.valorDisparador}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground/80">Límite programado:</span>
                      <div className="font-medium text-foreground">{item.valorLimite ?? "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Datos de culminación del servicio si fue completado */}
                {item.completado && (
                  <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Fecha servicio: {item.fechaServicio ?? "—"}
                    </span>
                    {item.valorUsoServicio !== null && item.valorUsoServicio !== undefined && (
                      <span>Uso: {item.valorUsoServicio.toLocaleString()}</span>
                    )}
                  </div>
                )}

                {item.observacion && (
                  <p className="text-[11px] text-muted-foreground italic border-t border-border/30 pt-1.5">
                    "{item.observacion}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
