import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Clock,
  MapPin,
  Radio,
  User,
} from "lucide-react"

import { routes } from "@/app/config"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { buttonVariants } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { ViajeActivoReciente } from "../types/gestion-vehicular-dashboard.types"

interface ViajesActivosLiveListProps {
  viajes: ViajeActivoReciente[]
  isLoading?: boolean
}

export const ViajesActivosLiveList = ({
  viajes,
  isLoading,
}: ViajesActivosLiveListProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-64 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const formatFecha = (fechaStr?: string | null) => {
    if (!fechaStr) return "-"
    try {
      const d = new Date(fechaStr)
      return d.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return fechaStr
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "EN_CURSO":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            EN RUTA
          </Badge>
        )
      case "PROGRAMADO":
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
            PROGRAMADO
          </Badge>
        )
      case "FINALIZADO":
        return (
          <Badge variant="outline" className="border-muted text-muted-foreground">
            FINALIZADO
          </Badge>
        )
      case "CANCELADO":
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-500/10">
            CANCELADO
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <CardTitle className="text-base font-semibold">
              Monitoreo de Viajes en Ruta y Recientes
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Seguimiento de salidas activas, vehículos y conductores en operación
          </CardDescription>
        </div>

        <Link
          to={routes.gestionVehicular.reportes.historialViajes}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs gap-1 text-cyan-600 hover:text-cyan-700")}
        >
          Ver historial
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="pt-1">
        {viajes.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No hay registros de viajes activos o recientes
          </div>
        ) : (
          <div className="space-y-2.5">
            {viajes.map((viaje) => (
              <div
                key={viaje.viajeId}
                className="p-3 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">
                      {viaje.numeroSolicitud}
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px] font-semibold border-cyan-500/30 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10">
                      {viaje.placa}
                    </Badge>
                    <span className="text-muted-foreground truncate max-w-[160px] sm:max-w-[220px]">
                      {viaje.marcaModelo}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {viaje.conductorNombre}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      Destino: <strong className="text-foreground">{viaje.destino}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      Salida: {formatFecha(viaje.fechaSalida)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {viaje.kilometrajeSalida && (
                    <div className="text-right hidden md:block">
                      <span className="text-[10px] text-muted-foreground block">Km Salida:</span>
                      <span className="font-mono font-bold text-foreground">
                        {viaje.kilometrajeSalida.toLocaleString("es-BO")}
                      </span>
                    </div>
                  )}
                  {getStatusBadge(viaje.estado)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
