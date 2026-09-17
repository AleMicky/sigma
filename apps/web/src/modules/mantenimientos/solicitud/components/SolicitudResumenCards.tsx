import type * as React from "react"
import {
  CheckCircle2,
  FileEdit,
  FileText,
  Wrench,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import type { SolicitudMantenimientoResumen } from "../types/solicitud.type"

export interface SolicitudResumenCardsProps {
  resumen?: SolicitudMantenimientoResumen | null
  isLoading?: boolean
  selectedEstado: string
  onSelectEstado: (estado: string) => void
  className?: string
}

interface ResumenCardConfig {
  estado: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  getValue: (resumen?: SolicitudMantenimientoResumen | null) => number
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
    estado: "",
    label: "Total",
    icon: FileText,
    getValue: (resumen) => resumen?.total ?? 0,
    activeClass: "border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-primary/30 shadow-xs",
    indicatorClass: "bg-primary shadow-xs shadow-primary/50",
    hoverBorderClass: "hover:border-primary/30",
    hoverBgClass: "hover:bg-primary/[0.03]",
    iconActiveClass: "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
    iconInactiveClass: "bg-primary/10 text-primary border border-primary/20",
  },
  {
    estado: "borrador",
    label: "Borradores",
    icon: FileEdit,
    getValue: (resumen) => resumen?.borradores ?? 0,
    activeClass: "border-zinc-400/80 bg-gradient-to-br from-zinc-500/10 via-zinc-500/5 to-transparent ring-1 ring-zinc-400/40 shadow-xs dark:border-zinc-500/80",
    indicatorClass: "bg-zinc-500 shadow-xs shadow-zinc-500/50",
    hoverBorderClass: "hover:border-zinc-400/40",
    hoverBgClass: "hover:bg-muted/40",
    iconActiveClass: "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm",
    iconInactiveClass: "bg-muted text-muted-foreground border border-border/60",
  },
  {
    estado: "en_proceso",
    label: "En Proceso",
    icon: Wrench,
    getValue: (resumen) => resumen?.enProceso ?? 0,
    activeClass: "border-blue-500/60 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent ring-1 ring-blue-500/30 shadow-xs",
    indicatorClass: "bg-blue-500 shadow-xs shadow-blue-500/50",
    hoverBorderClass: "hover:border-blue-500/40",
    hoverBgClass: "hover:bg-blue-500/[0.04]",
    iconActiveClass: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
    iconInactiveClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    numberClass: "text-blue-600 dark:text-blue-400",
  },
  {
    estado: "finalizada",
    label: "Finalizadas",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.finalizadas ?? 0,
    activeClass: "border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent ring-1 ring-emerald-500/30 shadow-xs",
    indicatorClass: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
    hoverBorderClass: "hover:border-emerald-500/40",
    hoverBgClass: "hover:bg-emerald-500/[0.04]",
    iconActiveClass: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
    iconInactiveClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    numberClass: "text-emerald-600 dark:text-emerald-400",
  },
]

export function SolicitudResumenCards({
  resumen,
  isLoading = false,
  selectedEstado,
  onSelectEstado,
  className,
}: SolicitudResumenCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-4 lg:grid-cols-4", className)}>
      {RESUMEN_CARDS.map((card) => {
        const isSelected = card.estado ? selectedEstado === card.estado : !selectedEstado
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
