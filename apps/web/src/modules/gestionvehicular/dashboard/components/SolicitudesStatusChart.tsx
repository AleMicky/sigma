import { FileCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import type { DistribucionEstado } from "../types/gestion-vehicular-dashboard.types"

interface SolicitudesStatusChartProps {
  data: DistribucionEstado[]
  totalSolicitudes: number
  isLoading?: boolean
}

export const SolicitudesStatusChart = ({
  data,
  totalSolicitudes,
  isLoading,
}: SolicitudesStatusChartProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="h-40 w-full bg-muted/40 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Embudo de Solicitudes
            </CardTitle>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {totalSolicitudes} registradas
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Distribución por etapa de autorización y despacho
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 space-y-3">
        {data.map((item) => (
          <div key={item.clave} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{item.cantidad}</span>
                <span className="text-[11px] text-muted-foreground">
                  ({item.porcentaje}%)
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(item.porcentaje, item.cantidad > 0 ? 3 : 0)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
