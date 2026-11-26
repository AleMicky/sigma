import {
  Car,
  Coins,
  Droplet,
  Fuel,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { TotalesGestionVehicularResponse } from "../../totales/api/gestion-vehicular-totales.service"

export interface ConsumoCombustibleMetricsProps {
  /** Agregados del servidor (`GET /reportes/gestion-vehicular/totales?modulo=combustible`). */
  totales?: TotalesGestionVehicularResponse | null
}

function formatear(valor: number | null | undefined, decimales = 0): string {
  if (valor == null || !Number.isFinite(valor)) return "—"
  return valor.toLocaleString("es-BO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function ConsumoCombustibleMetrics({
  totales,
}: Readonly<ConsumoCombustibleMetricsProps>) {
  const totalLitros = totales?.totalLitros
  const totalImporte = totales?.totalImporte
  const litrosLabel = formatear(totalLitros, 2)
  const importeLabel = formatear(totalImporte, 2)
  const precioPromedio =
    totalLitros != null && totalImporte != null && totalLitros > 0
      ? totalImporte / totalLitros
      : null
  const precioLabel = formatear(precioPromedio, 2)

  return (
    <div
      data-testid="metricas-combustible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden"
    >
      {/* 1. Total Cargas */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-amber-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Total Cargas
            </span>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatear(totales?.totalRegistros)}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Vales y facturas registradas
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Litros */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-sky-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Volumen Total
            </span>
            <Droplet className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {litrosLabel}{" "}
            {litrosLabel !== "—" && (
              <span className="text-sm font-normal text-muted-foreground">L</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Litros despachados con los filtros aplicados
          </p>
        </CardContent>
      </Card>

      {/* 3. Gasto Total Bs. */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Importe Total
            </span>
            <Coins className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {importeLabel}{" "}
            {importeLabel !== "—" && (
              <span className="text-sm font-normal text-muted-foreground">Bs.</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Costo acumulado de combustible
          </p>
        </CardContent>
      </Card>

      {/* 4. Precio Promedio / Litro */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-indigo-500/40 transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Precio Ponderado
            </span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {precioLabel}{" "}
            {precioLabel !== "—" && (
              <span className="text-sm font-normal text-muted-foreground">Bs./L</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Costo promedio por litro
          </p>
        </CardContent>
      </Card>

      {/* 5. Vehículos Atendidos: el agregado no expone este indicador */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-purple-500/40 transition-colors col-span-2 sm:col-span-1">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Vehículos
            </span>
            <Car className="h-4 w-4 text-purple-500" />
          </div>
          <div
            className="text-2xl font-bold text-purple-600 dark:text-purple-400"
            title="El endpoint de totales no reporta vehículos únicos"
          >
            —
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Vehículos abastecidos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
