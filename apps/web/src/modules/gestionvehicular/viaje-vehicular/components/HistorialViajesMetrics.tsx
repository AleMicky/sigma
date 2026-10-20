import {
  Car,
  CheckCircle2,
  Clock,
  Gauge,
  Navigation,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { ViajeVehicular } from "../api/viaje-vehicular.service"

export interface HistorialViajesMetricsProps {
  viajes: ViajeVehicular[]
  totalElements?: number
}

export function HistorialViajesMetrics({
  viajes,
  totalElements,
}: Readonly<HistorialViajesMetricsProps>) {
  const total = totalElements ?? viajes.length

  const finalizados = viajes.filter((v) => v.estado === "FINALIZADO").length
  const enCurso = viajes.filter((v) => v.estado === "EN_CURSO").length
  const programados = viajes.filter((v) => v.estado === "PROGRAMADO").length
  const cancelados = viajes.filter((v) => v.estado === "CANCELADO").length

  const kmTotal = viajes.reduce((acc, v) => {
    if (
      v.kilometrajeRetorno != null &&
      v.kilometrajeSalida != null &&
      v.kilometrajeRetorno >= v.kilometrajeSalida
    ) {
      return acc + (v.kilometrajeRetorno - v.kilometrajeSalida)
    }
    return acc
  }, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden">
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
            {total.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Registrados en el sistema
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
            {enCurso}
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
            {finalizados}
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
            {kmTotal.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">km</span>
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
            {programados}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {cancelados > 0 ? `${cancelados} cancelados` : "Pendientes de salida"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
