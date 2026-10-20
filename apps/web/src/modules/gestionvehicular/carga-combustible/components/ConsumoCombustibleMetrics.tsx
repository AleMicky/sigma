import {
  Car,
  Coins,
  Droplet,
  Fuel,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { CargaCombustible } from "../api/carga-combustible.service"

export interface ConsumoCombustibleMetricsProps {
  cargas: CargaCombustible[]
  totalElements?: number
}

export function ConsumoCombustibleMetrics({
  cargas,
  totalElements,
}: Readonly<ConsumoCombustibleMetricsProps>) {
  const total = totalElements ?? cargas.length

  const totalLitros = cargas.reduce((sum, c) => sum + (Number(c.litros) || 0), 0)
  const totalImporte = cargas.reduce((sum, c) => sum + (Number(c.precioTotal) || 0), 0)
  const precioPromedio = totalLitros > 0 ? totalImporte / totalLitros : 0

  const vehiculosUnicos = new Set(
    cargas.map((c) => c.activo?.id ?? c.activoId).filter(Boolean)
  ).size

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden">
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
            {total.toLocaleString()}
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
            {totalLitros.toLocaleString("es-BO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-normal text-muted-foreground">L</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Litros despachados en página
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
            {totalImporte.toLocaleString("es-BO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-normal text-muted-foreground">Bs.</span>
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
            {precioPromedio.toLocaleString("es-BO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-normal text-muted-foreground">Bs./L</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Costo promedio por litro
          </p>
        </CardContent>
      </Card>

      {/* 5. Vehículos Atendidos */}
      <Card className="border-border/60 bg-card/60 shadow-xs hover:border-purple-500/40 transition-colors col-span-2 sm:col-span-1">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Vehículos
            </span>
            <Car className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {vehiculosUnicos}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Vehículos abastecidos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
