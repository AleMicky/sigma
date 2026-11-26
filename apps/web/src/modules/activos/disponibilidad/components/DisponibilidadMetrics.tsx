import { useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  Archive,
  CheckCircle2,
  type LucideIcon,
  Percent,
  Wrench,
} from "lucide-react"

import type { ActivoResumen } from "@/modules/activos/activo/api/activo.service"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import {
  buildDisponibilidadMetricCards,
  type DisponibilidadMetricId,
} from "../lib/disponibilidad-metrics.utils"

export interface DisponibilidadMetricsProps {
  /** Agregados del endpoint `/activos/resumen` con los filtros vigentes. */
  metrics: ActivoResumen
}

type MetricStyle = {
  icon: LucideIcon
  hoverBorder: string
  iconColor: string
  valueColor: string
}

const METRIC_STYLES: Record<DisponibilidadMetricId, MetricStyle> = {
  total: {
    icon: Activity,
    hoverBorder: "hover:border-primary/40",
    iconColor: "text-primary",
    valueColor: "text-foreground",
  },
  disponibilidad: {
    icon: Percent,
    hoverBorder: "hover:border-emerald-500/40",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-600 dark:text-emerald-400",
  },
  operativos: {
    icon: CheckCircle2,
    hoverBorder: "hover:border-emerald-500/40",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-600 dark:text-emerald-400",
  },
  mantenimiento: {
    icon: Wrench,
    hoverBorder: "hover:border-amber-500/40",
    iconColor: "text-amber-500",
    valueColor: "text-amber-600 dark:text-amber-400",
  },
  fueraServicio: {
    icon: AlertTriangle,
    hoverBorder: "hover:border-rose-500/40",
    iconColor: "text-rose-500",
    valueColor: "text-rose-600 dark:text-rose-400",
  },
  reservaBaja: {
    icon: Archive,
    hoverBorder: "hover:border-slate-500/40",
    iconColor: "text-slate-500",
    valueColor: "text-foreground",
  },
}

export function DisponibilidadMetrics({
  metrics,
}: Readonly<DisponibilidadMetricsProps>) {
  const cards = useMemo(
    () => buildDisponibilidadMetricCards(metrics),
    [metrics],
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
      {cards.map((card) => {
        const style = METRIC_STYLES[card.id]
        const Icon = style.icon

        return (
          <Card
            key={card.id}
            className={cn(
              "border-border/60 bg-card/60 shadow-xs transition-colors",
              style.hoverBorder,
            )}
          >
            <CardContent className="p-3.5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className={cn("h-4 w-4", style.iconColor)} />
              </div>
              <div
                className={cn("text-2xl font-bold", style.valueColor)}
                data-testid={`metrica-${card.id}`}
              >
                {card.value}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {card.detail}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
