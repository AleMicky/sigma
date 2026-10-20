import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DollarSign, Droplets, Fuel } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

import type { TendenciaCombustible } from "../types/gestion-vehicular-dashboard.types"

interface TendenciaCombustibleChartProps {
  data: TendenciaCombustible[]
  isLoading?: boolean
}

export const TendenciaCombustibleChart = ({
  data,
  isLoading,
}: TendenciaCombustibleChartProps) => {
  const [metricView, setMetricView] = useState<"costo" | "litros">("costo")

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

  const totalCostoPeriodo = data.reduce((acc, curr) => acc + Number(curr.totalCosto), 0)
  const totalLitrosPeriodo = data.reduce((acc, curr) => acc + Number(curr.totalLitros), 0)

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Fuel className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Consumo y Gasto de Combustible
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Inversión mensual y volumen suministrado
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="text-muted-foreground font-medium">Total invertido:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {metricView === "costo"
                ? `Bs. ${totalCostoPeriodo.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${totalLitrosPeriodo.toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`}
            </span>
          </div>

          <Tabs
            value={metricView}
            onValueChange={(val) => setMetricView(val as "costo" | "litros")}
            className="w-auto"
          >
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="costo" className="h-7 px-2.5 text-xs">
                <DollarSign className="h-3 w-3 mr-0.5" />
                Costo (Bs.)
              </TabsTrigger>
              <TabsTrigger value="litros" className="h-7 px-2.5 text-xs">
                <Droplets className="h-3 w-3 mr-0.5" />
                Litros (L)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No hay cargas de combustible registradas
            </div>
          ) : metricView === "costo" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 15, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                      const item = payload[0].payload as TendenciaCombustible
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b pb-1 mb-1">
                            {label}
                          </p>
                          <div className="flex justify-between gap-4 text-amber-600 dark:text-amber-400 font-bold">
                            <span>Total Gasto:</span>
                            <span>Bs. {Number(item.totalCosto).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground">
                            <span>Volumen:</span>
                            <span>{Number(item.totalLitros).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Litros</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground pt-0.5 border-t">
                            <span>Cargas realizadas:</span>
                            <span className="font-medium text-foreground">{item.cantidadCargas}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalCosto"
                  name="Gasto Total (Bs.)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCosto)"
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as TendenciaCombustible
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-xs p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b pb-1 mb-1">
                            {label}
                          </p>
                          <div className="flex justify-between gap-4 text-cyan-600 dark:text-cyan-400 font-bold">
                            <span>Volumen Total:</span>
                            <span>{Number(item.totalLitros).toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground">
                            <span>Importe:</span>
                            <span>Bs. {Number(item.totalCosto).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground pt-0.5 border-t">
                            <span>Cargas realizadas:</span>
                            <span className="font-medium text-foreground">{item.cantidadCargas}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="totalLitros"
                  name="Volumen Suministrado (Litros)"
                  fill="#06B6D4"
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
