import type * as React from "react"
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type SupervisorResumen = {
  porRevisar: number
  observadas: number
  validadas: number
  trabajoConcluido: number
}

export interface SupervisorResumenCardsProps {
  resumen?: SupervisorResumen | null
  isLoading?: boolean
  selectedEstado: string
  onSelectEstado: (estado: string) => void
  className?: string
}

interface ResumenCardConfig {
  estado: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  getValue: (resumen?: SupervisorResumen | null) => number
  activeClass: string
  hoverBorderClass: string
  hoverBgClass: string
  iconActiveClass: string
  iconInactiveClass: string
  labelClass?: string
  numberClass?: string
}

const RESUMEN_CARDS: ResumenCardConfig[] = [
  {
    estado: "EN_REVISION",
    label: "Por Revisar",
    icon: Clock,
    getValue: (resumen) => resumen?.porRevisar ?? 0,
    activeClass: "border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/40",
    hoverBorderClass: "hover:border-amber-500/40",
    hoverBgClass: "hover:bg-amber-500/5",
    iconActiveClass: "bg-amber-600 text-white shadow-2xs",
    iconInactiveClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    labelClass: "text-amber-700 dark:text-amber-400",
    numberClass: "text-amber-600 dark:text-amber-400",
  },
  {
    estado: "OBSERVADO_MANTENIMIENTO",
    label: "Observadas",
    icon: AlertTriangle,
    getValue: (resumen) => resumen?.observadas ?? 0,
    activeClass: "border-rose-500/60 bg-rose-500/15 ring-1 ring-rose-500/40",
    hoverBorderClass: "hover:border-rose-500/40",
    hoverBgClass: "hover:bg-rose-500/5",
    iconActiveClass: "bg-rose-600 text-white shadow-2xs",
    iconInactiveClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    labelClass: "text-rose-700 dark:text-rose-400",
    numberClass: "text-rose-600 dark:text-rose-400",
  },
  {
    estado: "VALIDADO",
    label: "Validadas",
    icon: CheckCheck,
    getValue: (resumen) => resumen?.validadas ?? 0,
    activeClass: "border-blue-500/60 bg-blue-500/15 ring-1 ring-blue-500/40",
    hoverBorderClass: "hover:border-blue-500/40",
    hoverBgClass: "hover:bg-blue-500/5",
    iconActiveClass: "bg-blue-600 text-white shadow-2xs",
    iconInactiveClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    labelClass: "text-blue-700 dark:text-blue-400",
    numberClass: "text-blue-600 dark:text-blue-400",
  },
  {
    estado: "TRABAJO_REALIZADO",
    label: "Trabajo Concluido",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.trabajoConcluido ?? 0,
    activeClass: "border-emerald-500/60 bg-emerald-500/15 ring-1 ring-emerald-500/40",
    hoverBorderClass: "hover:border-emerald-500/40",
    hoverBgClass: "hover:bg-emerald-500/5",
    iconActiveClass: "bg-emerald-600 text-white shadow-2xs",
    iconInactiveClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    labelClass: "text-emerald-700 dark:text-emerald-400",
    numberClass: "text-emerald-600 dark:text-emerald-400",
  },
]

export function SupervisorResumenCards({
  resumen,
  isLoading = false,
  selectedEstado,
  onSelectEstado,
  className,
}: SupervisorResumenCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {RESUMEN_CARDS.map((card) => {
        const isSelected = selectedEstado === card.estado
        const Icon = card.icon
        const count = card.getValue(resumen)

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectEstado(card.estado)}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              isSelected
                ? card.activeClass
                : cn("border-border/70 bg-card", card.hoverBorderClass, card.hoverBgClass),
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                isSelected ? card.iconActiveClass : card.iconInactiveClass,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider truncate text-muted-foreground",
                  card.labelClass,
                )}
              >
                {card.label}
              </p>
              <p
                className={cn(
                  "font-heading text-base font-bold tracking-tight text-foreground",
                  card.numberClass,
                )}
              >
                {isLoading ? "..." : count}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
