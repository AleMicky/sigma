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
  indicatorClass: string
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
    activeClass: "border-amber-500/60 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent ring-1 ring-amber-500/30 shadow-xs",
    indicatorClass: "bg-amber-500 shadow-xs shadow-amber-500/50",
    hoverBorderClass: "hover:border-amber-500/40",
    hoverBgClass: "hover:bg-amber-500/[0.04]",
    iconActiveClass: "bg-amber-600 text-white shadow-sm shadow-amber-600/30",
    iconInactiveClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    labelClass: "text-amber-700 dark:text-amber-400",
    numberClass: "text-amber-600 dark:text-amber-400",
  },
  {
    estado: "OBSERVADO_MANTENIMIENTO",
    label: "Observadas",
    icon: AlertTriangle,
    getValue: (resumen) => resumen?.observadas ?? 0,
    activeClass: "border-rose-500/60 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent ring-1 ring-rose-500/30 shadow-xs",
    indicatorClass: "bg-rose-500 shadow-xs shadow-rose-500/50",
    hoverBorderClass: "hover:border-rose-500/40",
    hoverBgClass: "hover:bg-rose-500/[0.04]",
    iconActiveClass: "bg-rose-600 text-white shadow-sm shadow-rose-600/30",
    iconInactiveClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    labelClass: "text-rose-700 dark:text-rose-400",
    numberClass: "text-rose-600 dark:text-rose-400",
  },
  {
    estado: "VALIDADO",
    label: "Validadas",
    icon: CheckCheck,
    getValue: (resumen) => resumen?.validadas ?? 0,
    activeClass: "border-blue-500/60 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent ring-1 ring-blue-500/30 shadow-xs",
    indicatorClass: "bg-blue-500 shadow-xs shadow-blue-500/50",
    hoverBorderClass: "hover:border-blue-500/40",
    hoverBgClass: "hover:bg-blue-500/[0.04]",
    iconActiveClass: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
    iconInactiveClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    labelClass: "text-blue-700 dark:text-blue-400",
    numberClass: "text-blue-600 dark:text-blue-400",
  },
  {
    estado: "TRABAJO_REALIZADO",
    label: "Trabajo Concluido",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.trabajoConcluido ?? 0,
    activeClass: "border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent ring-1 ring-emerald-500/30 shadow-xs",
    indicatorClass: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
    hoverBorderClass: "hover:border-emerald-500/40",
    hoverBgClass: "hover:bg-emerald-500/[0.04]",
    iconActiveClass: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
    iconInactiveClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
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
    <div className={cn("grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-4", className)}>
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
              "group relative flex items-center gap-2 sm:gap-2.5 rounded-lg border p-1.5 sm:p-2 text-left transition-all duration-150 cursor-pointer overflow-hidden",
              "hover:shadow-2xs",
              isSelected
                ? card.activeClass
                : cn("border-border/60 bg-card/70 backdrop-blur-xs", card.hoverBorderClass, card.hoverBgClass),
            )}
          >
            {/* Indicador de acento inferior cuando está activo */}
            {isSelected && (
              <span
                className={cn(
                  "absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all",
                  card.indicatorClass,
                )}
              />
            )}

            <span
              className={cn(
                "flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-md transition-all duration-150 group-hover:scale-105",
                isSelected ? card.iconActiveClass : card.iconInactiveClass,
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider truncate text-muted-foreground leading-none mb-0.5",
                  card.labelClass,
                )}
              >
                {card.label}
              </p>
              <p
                className={cn(
                  "font-heading text-sm sm:text-base font-bold tracking-tight text-foreground leading-none",
                  card.numberClass,
                )}
              >
                {isLoading ? (
                  <span className="inline-block h-3.5 w-6 animate-pulse rounded bg-muted-foreground/20 align-middle" />
                ) : (
                  count
                )}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

