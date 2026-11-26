import {
  Car,
  CheckCircle2,
  Clock,
  Gauge,
  Navigation,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { TotalesGestionVehicularResponse } from "../../totales/api/gestion-vehicular-totales.service"

export interface HistorialViajesMetricsProps {
  /** Agregados del servidor (`GET /reportes/gestion-vehicular/totales?modulo=viajes`). */
  totales?: TotalesGestionVehicularResponse | null
}

function formatear(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "—"
  return valor.toLocaleString()
}

export function HistorialViajesMetrics({
  totales,
}: Readonly<HistorialViajesMetricsProps>) {
  const kmLabel = formatear(totales?.totalKm)
  // El contrato de totales no incluye desglose por estado; no se calcula desde `content`.
  const estadoNoDisponible = "—"

  return (
    <div
      data-testid="metricas-viajes"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden"
    >
      {/* 1. Total Viajes */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Total Viajes
            </span>
            <Car className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatear(totales?.totalRegistros)}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Registrados con los filtros aplicados
          </p>
        </CardContent>
      </Card>

      {/* 2. En Curso */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-amber-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              En Tránsito
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {estadoNoDisponible}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Vehículos en ruta activa
          </p>
        </CardContent>
      </Card>

      {/* 3. Finalizados */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Finalizados
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {estadoNoDisponible}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Retorno y odómetro confirmado
          </p>
        </CardContent>
      </Card>

      {/* 4. Km Totales Recorridos */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-sky-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Km Recorridos
            </span>
            <Gauge className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {kmLabel}{" "}
            {kmLabel !== "—" && (
              <span className="text-xs font-normal text-muted-foreground">km</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Distancia neta acumulada
          </p>
        </CardContent>
      </Card>

      {/* 5. Programados / Otros */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-blue-500/40 transition-colors col-span-2 sm:col-span-1">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Programados
            </span>
            <Navigation className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {estadoNoDisponible}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Pendientes de salida
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
