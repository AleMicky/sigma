import {
  Banknote,
  Car,
  Fuel,
  Gauge,
  Navigation,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import type { BitacoraVehicularResumen } from "../api/bitacora.service"

export interface BitacoraResumenMetricsProps {
  resumen: BitacoraVehicularResumen
}

export function BitacoraResumenMetrics({ resumen }: BitacoraResumenMetricsProps) {
  const kmRecorridos = resumen.totalKmRecorridos ?? 0
  const litrosCombustible = resumen.totalLitrosCombustible ?? 0
  const importeCombustible = resumen.totalImporteCombustible ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
      {/* 1. Total Viajes */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Viajes</span>
            <Car className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {resumen.totalViajes}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {resumen.totalCargasCombustible} cargas de combustible
          </p>
        </CardContent>
      </Card>

      {/* 2. Kilometraje Total */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Km Recorrido</span>
            <Gauge className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
            {kmRecorridos.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {resumen.kmSalidaInicial && resumen.kmRetornoFinal
              ? `${resumen.kmSalidaInicial} → ${resumen.kmRetornoFinal} km`
              : "Kilómetros netos"}
          </p>
        </CardContent>
      </Card>

      {/* 3. Combustible Total */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Combustible</span>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {litrosCombustible.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Volumen cargado
          </p>
        </CardContent>
      </Card>

      {/* 4. Importe Total Combustible */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Gasto Total</span>
            <Banknote className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            Bs. {importeCombustible.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Facturado en moneda nacional
          </p>
        </CardContent>
      </Card>

      {/* 5. Rendimiento Promedio */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Rendimiento</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {resumen.rendimientoKmPorLitro
              ? `${resumen.rendimientoKmPorLitro.toFixed(2)} Km/L`
              : "-"}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Eficiencia vehicular
          </p>
        </CardContent>
      </Card>

      {/* 6. Costo Promedio por Km */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">Costo / Km</span>
            <Navigation className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {resumen.costoPromedioPorKm
              ? `Bs. ${resumen.costoPromedioPorKm.toFixed(2)}`
              : "-"}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Costo operativo estimado
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
