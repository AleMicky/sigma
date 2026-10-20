import {
  Activity,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Percent,
  Wrench,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { Activo } from "@/modules/activos/activo/api/activo.service"

export interface DisponibilidadMetricsProps {
  activos: Activo[]
  totalElements?: number
}

export function DisponibilidadMetrics({
  activos,
  totalElements,
}: Readonly<DisponibilidadMetricsProps>) {
  const total = totalElements ?? activos.length

  const operativos = activos.filter(
    (a) => a.estadoOperativo?.codigo === "OPERATIVO",
  ).length
  const reserva = activos.filter(
    (a) => a.estadoOperativo?.codigo === "RESERVA",
  ).length
  const enViaje = activos.filter(
    (a) => a.estadoOperativo?.codigo === "EN_VIAJE",
  ).length
  const disponibles = operativos + reserva + enViaje

  const enMantenimiento = activos.filter(
    (a) => a.estadoOperativo?.codigo === "MANTENIMIENTO",
  ).length
  const fueraServicio = activos.filter(
    (a) => a.estadoOperativo?.codigo === "FUERA_SERVICIO",
  ).length
  const deBaja = activos.filter(
    (a) => a.estadoOperativo?.codigo === "DE_BAJA",
  ).length

  const tasaDisponibilidad =
    activos.length > 0 ? ((disponibles / activos.length) * 100).toFixed(1) : "0.0"

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
      {/* 1. Total Activos */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Total Activos
            </span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {total.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            En catálogo general
          </p>
        </CardContent>
      </Card>

      {/* 2. % Disponibilidad */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Disponibilidad
            </span>
            <Percent className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {tasaDisponibilidad}%
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {disponibles} activos listos para uso
          </p>
        </CardContent>
      </Card>

      {/* 3. Operativos */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Operativos
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {operativos}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Condición óptima
          </p>
        </CardContent>
      </Card>

      {/* 4. En Mantenimiento */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-amber-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Mantenimiento
            </span>
            <Wrench className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {enMantenimiento}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Preventivo / Correctivo
          </p>
        </CardContent>
      </Card>

      {/* 5. Fuera de Servicio */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-rose-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Fuera de Serv.
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {fueraServicio}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Averías o paradas técnicas
          </p>
        </CardContent>
      </Card>

      {/* 6. En Reserva / Baja */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-slate-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Reserva / Baja
            </span>
            <Archive className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {reserva + deBaja}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {reserva} reserva | {deBaja} baja
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
