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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse h-28 bg-muted/40 border-border/60" />
        ))}
      </div>
    )
  }

  const disponibilidadPorcentaje =
    kpis.totalVehiculosFlota > 0
      ? Math.round((kpis.vehiculosDisponibles / kpis.totalVehiculosFlota) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Flota Total */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-cyan-500/[0.07] via-background to-background hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Flota Vehicular
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CarFront className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.totalVehiculosFlota}
            </div>
            <Badge variant="outline" className="text-[11px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              {disponibilidadPorcentaje}% Disp.
            </Badge>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {kpis.vehiculosDisponibles} libres
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {kpis.vehiculosEnViaje} en ruta
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Viajes del Mes */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-blue-500/[0.07] via-background to-background hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Viajes del Mes
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.viajesMesActual}
            </div>
            {kpis.viajesEnCurso > 0 ? (
              <Badge className="text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                {kpis.viajesEnCurso} en curso
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                0 en ruta
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
            <span>Solicitudes activas:</span>
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
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-emerald-500/[0.07] via-background to-background hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kilometraje Mes
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.kmRecorridosMesActual.toLocaleString("es-BO")}
              <span className="text-xs font-normal text-muted-foreground ml-1">km</span>
            </div>
          </div>
          <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40 truncate">
            <span>Odómetro acumulado en viajes cerrados</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Combustible y Costo */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-amber-500/[0.07] via-background to-background hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Combustible Mes
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Fuel className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              Bs. {Number(kpis.combustibleCostoMesActual).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
            <span>Total cargado:</span>
            <span className="font-semibold text-foreground">
              {Number(kpis.combustibleLitrosMesActual).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 5. Conductores & Licencias */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-indigo-500/[0.07] via-background to-background hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Padrón Conductores
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.conductoresActivos}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / {kpis.totalConductores}
              </span>
            </div>
            {kpis.licenciasPorVencer > 0 ? (
              <Badge className="text-[11px] font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-3 w-3 mr-1 inline" />
                {kpis.licenciasPorVencer} lic. alert
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1 inline text-emerald-500" />
                Vigentes
              </Badge>
            )}
          </div>
          <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40">
            <span>Habilitados para asignación</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
