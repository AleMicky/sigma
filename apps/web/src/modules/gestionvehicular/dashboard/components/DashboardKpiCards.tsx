import {
  AlertTriangle,
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  Navigation,
  UserCheck,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

import type { GestionVehicularKpis } from "../types/gestion-vehicular-dashboard.types"

interface DashboardKpiCardsProps {
  kpis: GestionVehicularKpis
  isLoading?: boolean
}

export const DashboardKpiCards = ({ kpis, isLoading }: DashboardKpiCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse h-24 bg-muted/40 border-border/60" />
        ))}
      </div>
    )
  }

  const disponibilidadPorcentaje =
    kpis.totalVehiculosFlota > 0
      ? Math.round((kpis.vehiculosDisponibles / kpis.totalVehiculosFlota) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Flota Total */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-cyan-500/[0.06] via-card to-card hover:border-cyan-500/40 transition-all shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Flota Activa
            </span>
            <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CarFront className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {kpis.totalVehiculosFlota}
            </div>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            >
              {disponibilidadPorcentaje}% Disp.
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground border-t border-border/50 truncate">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {kpis.vehiculosDisponibles} libres
            </span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">
              {kpis.vehiculosEnViaje} en ruta
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Viajes del Mes */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-blue-500/[0.06] via-card to-card hover:border-blue-500/40 transition-all shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Viajes del Mes
            </span>
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Navigation className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {kpis.viajesMesActual}
            </div>
            {kpis.viajesEnCurso > 0 ? (
              <Badge className="text-[10px] px-1.5 py-0 font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                {kpis.viajesEnCurso} en curso
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                0 en ruta
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground border-t border-border/50 truncate">
            <span>Activas:</span>
            <span className="font-semibold text-foreground">
              {kpis.solicitudesEnCurso + kpis.solicitudesAprobadas}
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {kpis.solicitudesPendientes} pend.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Kilometraje Recorrido */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-emerald-500/[0.06] via-card to-card hover:border-emerald-500/40 transition-all shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Kilometraje Mes
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Gauge className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {kpis.kmRecorridosMesActual.toLocaleString("es-BO")}
              <span className="text-[11px] font-normal text-muted-foreground ml-1">km</span>
            </div>
          </div>
          <div className="pt-1 text-[10px] text-muted-foreground border-t border-border/50 truncate">
            <span>Odómetro acumulado en mes</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Combustible y Costo */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-amber-500/[0.06] via-card to-card hover:border-amber-500/40 transition-all shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Combustible Mes
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Fuel className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-mono">
              Bs. {Number(kpis.combustibleCostoMesActual).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/50 truncate">
            <span>Volumen:</span>
            <span className="font-semibold text-foreground">
              {Number(kpis.combustibleLitrosMesActual).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 5. Conductores & Licencias */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-indigo-500/[0.06] via-card to-card hover:border-indigo-500/40 transition-all shadow-xs col-span-2 md:col-span-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Conductores
            </span>
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {kpis.conductoresActivos}
              <span className="text-[11px] font-normal text-muted-foreground ml-1">
                / {kpis.totalConductores}
              </span>
            </div>
            {kpis.licenciasPorVencer > 0 ? (
              <Badge className="text-[10px] px-1.5 py-0 font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5 inline" />
                {kpis.licenciasPorVencer} alert
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline text-emerald-500" />
                Al día
              </Badge>
            )}
          </div>
          <div className="pt-1 text-[10px] text-muted-foreground border-t border-border/50 truncate">
            <span>Habilitados para servicio</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
