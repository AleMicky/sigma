import { Activity, AlertTriangle, Car, CheckCircle2, Clock } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"

interface SalidaVehicularMetricsProps {
  total: number
  activas: number
  finalizadas: number
  canceladas: number
  totalBitacoras?: number
}

export function SalidaVehicularMetrics({
  total,
  activas,
  finalizadas,
  canceladas,
  totalBitacoras = 0,
}: SalidaVehicularMetricsProps) {
  const cards = [
    {
      title: "Total Salidas",
      value: total,
      description: "Registradas en el sistema",
      icon: Car,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "En Tránsito / Activas",
      value: activas,
      description: "Operaciones en curso BPMN",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Finalizadas",
      value: finalizadas,
      description: "Completadas con éxito",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Canceladas",
      value: canceladas,
      description: "Salidas anuladas",
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      title: "Bitácoras e Incidentes",
      value: totalBitacoras,
      description: "Eventos registrados",
      icon: Activity,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className={`border shadow-xs hover:shadow-md transition-all duration-200 ${card.borderColor}`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <p className="text-[11px] text-muted-foreground/80">{card.description}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
