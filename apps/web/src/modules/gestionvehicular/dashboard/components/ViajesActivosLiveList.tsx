import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Clock,
  ExternalLink,
  MapPin,
  Radio,
  Search,
  User,
  X,
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
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
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
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="p-3.5 pb-2">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="p-3.5 pt-1 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-lg" />
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
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold gap-1 text-[10px] px-1.5 py-0.5 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            EN RUTA
          </Badge>
        )
      case "PROGRAMADO":
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px] px-1.5 py-0.5">
            PROGRAMADO
          </Badge>
        )
      case "FINALIZADO":
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-[10px] px-1.5 py-0.5">
            FINALIZADO
          </Badge>
        )
      case "CANCELADO":
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-500/10 text-[10px] px-1.5 py-0.5">
            CANCELADO
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-[10px]">{estado}</Badge>
    }
  }

  // Filtrado local en vivo
  const viajesFiltrados = viajes.filter((v) => {
    if (estadoFilter !== "TODOS" && v.estado !== estadoFilter) {
      return false
    }
    if (!search.trim()) return true
    const term = search.toLowerCase()
    return (
      v.numeroSolicitud?.toLowerCase().includes(term) ||
      v.placa?.toLowerCase().includes(term) ||
      v.conductorNombre?.toLowerCase().includes(term) ||
      v.destino?.toLowerCase().includes(term) ||
      v.marcaModelo?.toLowerCase().includes(term)
    )
  })

  const countEnRuta = viajes.filter((v) => v.estado === "EN_CURSO").length

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="p-3.5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <CardTitle className="text-sm sm:text-base font-semibold">
              Monitoreo de Viajes en Ruta y Operaciones Recientes
            </CardTitle>
            {countEnRuta > 0 && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0">
                {countEnRuta} en ruta
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Control en tiempo real de salidas vehiculares, conductores y destinos asignados
          </CardDescription>
        </div>

        <Link
          to={routes.gestionVehicular.reportes.historialViajes}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 text-xs gap-1 text-cyan-600 hover:text-cyan-700 self-end sm:self-auto px-2"
          )}
        >
          <span>Ver historial completo</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-3.5 pt-1 space-y-2.5">
        {/* Controles de filtro en vivo: búsqueda y estados */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa, conductor, destino..."
              className="h-7.5 pl-8 pr-7 text-xs bg-muted/30 border-border/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {(["TODOS", "EN_CURSO", "PROGRAMADO", "FINALIZADO"] as const).map((st) => (
              <Button
                key={st}
                variant={estadoFilter === st ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setEstadoFilter(st)}
                className={cn(
                  "h-6 px-2 text-[11px] rounded-md font-medium",
                  estadoFilter === st && "bg-muted text-foreground font-semibold"
                )}
              >
                {st === "TODOS"
                  ? "Todos"
                  : st === "EN_CURSO"
                  ? "En Ruta"
                  : st === "PROGRAMADO"
                  ? "Programados"
                  : "Finalizados"}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de viajes en vivo compacta */}
        {viajesFiltrados.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg">
            No se encontraron viajes con los criterios seleccionados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {viajesFiltrados.map((viaje) => (
              <div
                key={viaje.viajeId}
                className="p-2.5 rounded-lg border border-border/60 bg-card/60 hover:bg-muted/40 transition-colors flex flex-col justify-between gap-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-foreground">
                      {viaje.numeroSolicitud}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] font-semibold border-cyan-500/30 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-1 py-0"
                    >
                      {viaje.placa}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[130px] sm:max-w-[180px]">
                      {viaje.marcaModelo}
                    </span>
                  </div>
                  {getStatusBadge(viaje.estado)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                  <span className="flex items-center gap-1 truncate text-foreground font-medium">
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    {viaje.conductorNombre}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                    <strong className="text-foreground">{viaje.destino}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    Salida: {formatFecha(viaje.fechaSalida)}
                  </span>
                  {viaje.kilometrajeSalida && (
                    <span className="font-mono font-medium">
                      Km: {viaje.kilometrajeSalida.toLocaleString("es-BO")}
                    </span>
                  )}
                  {viaje.solicitudId && (
                    <Link
                      to={routes.gestionVehicular.salidaDetalle(viaje.viajeId)}
                      className="text-cyan-600 hover:text-cyan-700 flex items-center gap-0.5 font-medium ml-auto"
                    >
                      <span>Detalle</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

