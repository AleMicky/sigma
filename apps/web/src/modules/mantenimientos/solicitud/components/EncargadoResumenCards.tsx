import type * as React from "react"
import {
  CheckCircle2,
  Clock,
  Play,
  Wrench,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type EncargadoResumen = {
  porIniciar: number
  enEjecucion: number
  enRevision: number
  finalizadas: number
}

export interface EncargadoResumenCardsProps {
  resumen?: EncargadoResumen | null
  isLoading?: boolean
  selectedEstado: string
  onSelectEstado: (estado: string) => void
  className?: string
}

interface ResumenCardConfig {
  estado: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  getValue: (resumen?: EncargadoResumen | null) => number
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
    estado: "ASIGNADO",
    label: "Por Iniciar",
    icon: Play,
    getValue: (resumen) => resumen?.porIniciar ?? 0,
    activeClass: "border-blue-500/60 bg-blue-500/15 ring-1 ring-blue-500/40",
    hoverBorderClass: "hover:border-blue-500/40",
    hoverBgClass: "hover:bg-blue-500/5",
    iconActiveClass: "bg-blue-600 text-white shadow-2xs",
    iconInactiveClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    labelClass: "text-blue-700 dark:text-blue-400",
    numberClass: "text-blue-600 dark:text-blue-400",
  },
  {
    estado: "EN_MANTENIMIENTO",
    label: "En Ejecución",
    icon: Wrench,
    getValue: (resumen) => resumen?.enEjecucion ?? 0,
    activeClass: "border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/40",
    hoverBorderClass: "hover:border-amber-500/40",
    hoverBgClass: "hover:bg-amber-500/5",
    iconActiveClass: "bg-amber-600 text-white shadow-2xs",
    iconInactiveClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    labelClass: "text-amber-700 dark:text-amber-400",
    numberClass: "text-amber-600 dark:text-amber-400",
  },
  {
    estado: "EN_REVISION",
    label: "En Revisión",
    icon: Clock,
    getValue: (resumen) => resumen?.enRevision ?? 0,
    activeClass: "border-purple-500/60 bg-purple-500/15 ring-1 ring-purple-500/40",
    hoverBorderClass: "hover:border-purple-500/40",
    hoverBgClass: "hover:bg-purple-500/5",
    iconActiveClass: "bg-purple-600 text-white shadow-2xs",
    iconInactiveClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    labelClass: "text-purple-700 dark:text-purple-400",
    numberClass: "text-purple-600 dark:text-purple-400",
  },
  {
    estado: "FINALIZADO",
    label: "Finalizadas",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.finalizadas ?? 0,
    activeClass: "border-emerald-500/60 bg-emerald-500/15 ring-1 ring-emerald-500/40",
    hoverBorderClass: "hover:border-emerald-500/40",
    hoverBgClass: "hover:bg-emerald-500/5",
    iconActiveClass: "bg-emerald-600 text-white shadow-2xs",
    iconInactiveClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    labelClass: "text-emerald-700 dark:text-emerald-400",
    numberClass: "text-emerald-600 dark:text-emerald-400",
  },
]

export function EncargadoResumenCards({
  resumen,
  isLoading = false,
  selectedEstado,
  onSelectEstado,
  className,
}: EncargadoResumenCardsProps) {
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
