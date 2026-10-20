import { useState } from "react"
import { Award, Fuel, Gauge } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"

import type {
  TopVehiculoCombustible,
  TopVehiculoKm,
} from "../types/gestion-vehicular-dashboard.types"

interface TopVehiculosSectionProps {
  topKm: TopVehiculoKm[]
  topCombustible: TopVehiculoCombustible[]
  isLoading?: boolean
}

export const TopVehiculosSection = ({
  topKm,
  topCombustible,
  isLoading,
}: TopVehiculosSectionProps) => {
  const [tab, setTab] = useState<"km" | "combustible">("km")

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-64 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const maxKm = topKm.length > 0 ? topKm[0].totalKmRecorridos : 1
  const maxCosto = topCombustible.length > 0 ? Number(topCombustible[0].totalCosto) : 1

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Top 5 Vehículos con Mayor Actividad
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Rendimiento por distancia recorrida y gasto en combustible
          </CardDescription>
        </div>

        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "km" | "combustible")}
          className="w-auto"
        >
          <TabsList className="h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="km" className="h-7 px-2.5 text-xs">
              <Gauge className="h-3 w-3 mr-1 text-emerald-500" />
              Por Km
            </TabsTrigger>
            <TabsTrigger value="combustible" className="h-7 px-2.5 text-xs">
              <Fuel className="h-3 w-3 mr-1 text-amber-500" />
              Por Combustible
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-1">
        {tab === "km" ? (
          topKm.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No hay viajes finalizados con kilometraje registrado
            </div>
          ) : (
            <div className="space-y-3">
              {topKm.map((veh, index) => {
                const pct = Math.max(8, Math.round((veh.totalKmRecorridos / maxKm) * 100))
                return (
                  <div
                    key={veh.activoId || index}
                    className="p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          #{index + 1}
                        </span>
                        <Badge variant="outline" className="font-mono text-[11px] font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10">
                          {veh.placa}
                        </Badge>
                        <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                          {veh.marcaModelo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {veh.cantidadViajes} {veh.cantidadViajes === 1 ? "viaje" : "viajes"}
                        </span>
                        <span className="font-bold text-foreground font-mono">
                          {veh.totalKmRecorridos.toLocaleString("es-BO")} km
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : topCombustible.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No hay cargas de combustible registradas
          </div>
        ) : (
          <div className="space-y-3">
            {topCombustible.map((veh, index) => {
              const costoNum = Number(veh.totalCosto)
              const pct = Math.max(8, Math.round((costoNum / maxCosto) * 100))
              return (
                <div
                  key={veh.activoId || index}
                  className="p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        #{index + 1}
                      </span>
                      <Badge variant="outline" className="font-mono text-[11px] font-bold border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                        {veh.placa}
                      </Badge>
                      <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                        {veh.marcaModelo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        {Number(veh.totalLitros).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
                      </span>
                      <span className="font-bold text-foreground font-mono text-amber-600 dark:text-amber-400">
                        Bs. {costoNum.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
