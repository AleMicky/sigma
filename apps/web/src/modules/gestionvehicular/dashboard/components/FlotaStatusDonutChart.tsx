import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { PieChart as PieIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import type { DistribucionEstado } from "../types/gestion-vehicular-dashboard.types"

interface FlotaStatusDonutChartProps {
  data: DistribucionEstado[]
  totalVehiculos: number
  vehiculosDisponibles: number
  isLoading?: boolean
}

export const FlotaStatusDonutChart = ({
  data,
  totalVehiculos,
  vehiculosDisponibles,
  isLoading,
}: FlotaStatusDonutChartProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="h-40 w-40 rounded-full bg-muted/40 animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const porcentajeDisponibilidad =
    totalVehiculos > 0
      ? Math.round((vehiculosDisponibles / totalVehiculos) * 100)
      : 0

  const activeData = data.filter((d) => d.cantidad > 0)

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PieIcon className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Estado de Flota Vehicular
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Disponibilidad y estatus operativo en tiempo real
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          {/* Donut Chart with Center Text */}
          <div className="relative h-48 w-full flex items-center justify-center">
            {activeData.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sin vehículos registrados</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as DistribucionEstado
                          return (
                            <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-2 shadow-md text-xs space-y-0.5">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                {item.label}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-bold text-foreground">{item.cantidad}</span> vehículos ({item.porcentaje}%)
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Pie
                      data={activeData}
                      dataKey="cantidad"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={3}
                      strokeWidth={1}
                      stroke="hsl(var(--background))"
                    >
                      {activeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {porcentajeDisponibilidad}%
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Disponibles
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Legend Items */}
          <div className="flex flex-col gap-2">
            {data.map((item) => (
              <div
                key={item.clave}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>{item.cantidad}</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({item.porcentaje}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
