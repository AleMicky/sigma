import { useQuery } from "@tanstack/react-query"
import {
  Compass,
  FileText,
  RefreshCw,
  ExternalLink,
  User,
  Clock,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { SalidaVehicularStatusBadge } from "./SalidaVehicularStatusBadge"

interface ConsultarBitacoraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salida: SalidaVehicular | null
}

function formatFechaHora(dateStr?: string | null): string {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(dateStr)
  }
}

export function ConsultarBitacoraDialog({
  open,
  onOpenChange,
  salida,
}: ConsultarBitacoraDialogProps) {
  const bitacorasQuery = useQuery({
    ...salidaVehicularQueries.bitacoras(salida?.id ?? ""),
    enabled: Boolean(salida?.id) && open,
  })

  const bitacoras = bitacorasQuery.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden gap-0 rounded-2xl shadow-2xl">
        {/* Header Hero */}
        <div className="relative border-b bg-gradient-to-br from-card via-card to-muted/40 p-5 sm:p-6 pb-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shadow-2xs shrink-0">
                  <FileText className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-tight">
                      Consulta de Bitácora
                    </DialogTitle>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      Tiempo Real
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-foreground/80">
                      Salida #{salida?.numero}
                    </span>
                    <span>&bull;</span>
                    <span>{salida?.placa ?? salida?.activoDescripcion}</span>
                  </p>
                </div>
              </div>

              {salida?.estado && <SalidaVehicularStatusBadge status={salida.estado} />}
            </div>
            <DialogDescription className="sr-only">
              Consulta de registros de bitácora capturados automáticamente en tiempo real con geolocalización.
            </DialogDescription>
          </DialogHeader>
        </div>

        {salida && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Banner Informativo de Ruta y Conductor */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium text-foreground truncate max-w-[260px]" title={salida.descripcionActividad}>
                    {salida.descripcionActividad}
                  </span>
                </div>

                {salida.empleadoNombre && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <User className="size-3 shrink-0" />
                    <span className="truncate">
                      Conductor: <strong className="text-foreground/80 font-medium">{salida.empleadoNombre}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Registros generados automáticamente con geolocalización
                </span>
                <span className="font-semibold text-foreground">
                  {bitacoras.length} registro{bitacoras.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Listado de Entradas en Tiempo Real */}
            {bitacorasQuery.isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : bitacoras.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-2">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 mx-auto text-muted-foreground">
                  <Compass className="size-6 text-muted-foreground/60" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Sin registros de bitácora todavía
                </h4>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Las entradas en la bitácora se registran de forma 100% automática en tiempo real con las coordenadas GPS al cambiar de estado (Iniciar Salida, Llegada, Retorno y Finalizar).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bitacoras.map((item, idx) => {
                  const hasGps = item.latitud != null && item.longitud != null
                  const mapsUrl = hasGps ? `https://maps.google.com/?q=${item.latitud},${item.longitud}` : null

                  return (
                    <div
                      key={item.id ?? idx}
                      className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 shadow-2xs hover:border-border transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2",
                              item.tipo === "ACTIVIDAD" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                              item.tipo === "NOVEDAD" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                              item.tipo === "INCIDENTE" && "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                            )}
                          >
                            {item.tipo}
                          </Badge>
                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatFechaHora(item.fechaHora || item.createdAt)}
                          </span>
                        </div>

                        {hasGps && mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline font-mono bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded border border-primary/20 transition-colors"
                            title="Abrir ubicación en Google Maps"
                          >
                            <Compass className="size-3 shrink-0" />
                            <span>
                              {Number(item.latitud).toFixed(5)}, {Number(item.longitud).toFixed(5)}
                            </span>
                            <ExternalLink className="size-2.5 opacity-70" />
                          </a>
                        )}
                      </div>

                      {/* Descripción del evento */}
                      <p className="text-xs text-foreground leading-relaxed font-medium">
                        {item.descripcion}
                      </p>

                      {/* Conductor / Registrante */}
                      {item.empleadoNombre && (
                        <div className="pt-1.5 border-t border-border/50 text-[10.5px] text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <User className="size-2.5 text-muted-foreground/70" />
                            <span>Registrado por: <strong className="text-foreground/80 font-medium">{item.empleadoNombre}</strong></span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
                            Automático
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="border-t bg-muted/20 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => bitacorasQuery.refetch()}
            disabled={bitacorasQuery.isFetching}
            className="text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-3", bitacorasQuery.isFetching && "animate-spin")} />
            <span>Actualizar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
