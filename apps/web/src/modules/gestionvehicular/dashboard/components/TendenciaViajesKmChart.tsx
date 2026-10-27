import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Navigation, Route, TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

import type { TendenciaViajes } from "../types/gestion-vehicular-dashboard.types"

interface TendenciaViajesKmChartProps {
  data: TendenciaViajes[]
  isLoading?: boolean
}

export const TendenciaViajesKmChart = ({
  data,
  isLoading,
}: TendenciaViajesKmChartProps) => {
  const [metricView, setMetricView] = useState<"viajes" | "km">("viajes")

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted/60 animate-pulse rounded mt-1" />
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <div className="h-48 w-full bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const totalViajesPeriodo = data.reduce((acc, curr) => acc + curr.totalViajes, 0)
  const totalKmPeriodo = data.reduce((acc, curr) => acc + curr.totalKmRecorridos, 0)

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="p-3.5 pb-2 flex flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm sm:text-base font-semibold">
              Evolución: Viajes y Kilometraje
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Tendencia operativa por mes en el periodo seleccionado
          </CardDescription>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col items-end text-[11px]">
            <span className="text-muted-foreground">Total periodo:</span>
            <span className="font-bold text-foreground">
              {metricView === "viajes"
                ? `${totalViajesPeriodo} viajes`
                : `${totalKmPeriodo.toLocaleString("es-BO")} km`}
            </span>
          </div>

          <Tabs
            value={metricView}
            onValueChange={(val) => setMetricView(val as "viajes" | "km")}
            className="w-auto"
          >
            <TabsList className="h-7 p-0.5 bg-muted/60">
              <TabsTrigger value="viajes" className="h-6 px-2 text-[11px]">
                <Navigation className="h-2.5 w-2.5 mr-1" />
                Viajes
              </TabsTrigger>
              <TabsTrigger value="km" className="h-6 px-2 text-[11px]">
                <Route className="h-2.5 w-2.5 mr-1" />
                Km
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-0">
        <div className="h-52 w-full">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No hay datos registrados en este periodo
            </div>
          ) : metricView === "viajes" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="mesLabel"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as TendenciaViajes
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b pb-1 mb-1">
                            {label}
                          </p>
                          <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                            <span>Completados:</span>
                            <span className="font-bold">{item.completados}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-blue-600 dark:text-blue-400">
                            <span>En Curso:</span>
                            <span className="font-bold">{item.enCurso}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-rose-600 dark:text-rose-400">
                            <span>Cancelados:</span>
                            <span className="font-bold">{item.cancelados}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t font-bold text-foreground">
                            <span>Total Viajes:</span>
                            <span>{item.totalViajes}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground pt-0.5">
                            <span>Distancia:</span>
                            <span>{item.totalKmRecorridos.toLocaleString("es-BO")} km</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="completados" name="Completados" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="enCurso" name="En Curso" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="cancelados" name="Cancelados" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="mesLabel"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as TendenciaViajes
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b pb-1 mb-1">
                            {label}
                          </p>
                          <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Recorrido Total:</span>
                            <span>{item.totalKmRecorridos.toLocaleString("es-BO")} km</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground pt-0.5">
                            <span>Total Viajes:</span>
                            <span>{item.totalViajes}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalKmRecorridos"
                  name="Km Recorridos"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10B981" }}
                  activeDot={{ r: 6 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
