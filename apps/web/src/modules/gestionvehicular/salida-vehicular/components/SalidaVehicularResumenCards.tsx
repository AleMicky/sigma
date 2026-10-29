import type * as React from "react"
import {
  Ban,
  Car,
  CheckCircle2,
  Clock,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

export interface SalidaVehicularResumen {
  total: number
  iniciadas: number
  enTransito: number
  finalizadas: number
  canceladas: number
}

export interface SalidaVehicularResumenCardsProps {
  resumen?: SalidaVehicularResumen | null
  isLoading?: boolean
  selectedEstado: string
  onSelectEstado: (estado: string) => void
  className?: string
  showDistributionBar?: boolean
}

interface ResumenCardConfig {
  estado: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  getValue: (resumen?: SalidaVehicularResumen | null) => number
  activeClass: string
  indicatorClass: string
  hoverBorderClass: string
  hoverBgClass: string
  iconActiveClass: string
  iconInactiveClass: string
  barClass: string
  labelClass?: string
  numberClass?: string
}

const RESUMEN_CARDS: ResumenCardConfig[] = [
  {
    estado: "",
    label: "Total Salidas",
    icon: Car,
    getValue: (resumen) => resumen?.total ?? 0,
    activeClass:
      "border-primary/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent ring-2 ring-primary/40 shadow-sm",
    indicatorClass: "bg-primary shadow-xs shadow-primary/50",
    hoverBorderClass: "hover:border-primary/40",
    hoverBgClass: "hover:bg-primary/[0.04]",
    iconActiveClass: "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
    iconInactiveClass: "bg-primary/10 text-primary border border-primary/20",
    barClass: "bg-primary",
  },
  {
    estado: "SALIDA",
    label: "Salida",
    icon: Clock,
    getValue: (resumen) => resumen?.iniciadas ?? 0,
    activeClass:
      "border-blue-500/70 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent ring-2 ring-blue-500/40 shadow-sm",
    indicatorClass: "bg-blue-500 shadow-xs shadow-blue-500/50",
    hoverBorderClass: "hover:border-blue-500/50",
    hoverBgClass: "hover:bg-blue-500/[0.06]",
    iconActiveClass: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
    iconInactiveClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    numberClass: "text-blue-600 dark:text-blue-400",
    labelClass: "text-blue-700 dark:text-blue-400",
    barClass: "bg-blue-500",
  },
  {
    estado: "LLEGADA",
    label: "Llegada (Finalizadas)",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.finalizadas ?? 0,
    activeClass:
      "border-emerald-500/70 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent ring-2 ring-emerald-500/40 shadow-sm",
    indicatorClass: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
    hoverBorderClass: "hover:border-emerald-500/50",
    hoverBgClass: "hover:bg-emerald-500/[0.06]",
    iconActiveClass: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
    iconInactiveClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    numberClass: "text-emerald-600 dark:text-emerald-400",
    labelClass: "text-emerald-700 dark:text-emerald-400",
    barClass: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    estado: "CANCELADA",
    label: "Canceladas",
    icon: Ban,
    getValue: (resumen) => resumen?.canceladas ?? 0,
    activeClass:
      "border-rose-500/70 bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent ring-2 ring-rose-500/40 shadow-sm",
    indicatorClass: "bg-rose-500 shadow-xs shadow-rose-500/50",
    hoverBorderClass: "hover:border-rose-500/50",
    hoverBgClass: "hover:bg-rose-500/[0.06]",
    iconActiveClass: "bg-rose-600 text-white shadow-sm shadow-rose-600/30",
    iconInactiveClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    numberClass: "text-rose-600 dark:text-rose-400",
    labelClass: "text-rose-700 dark:text-rose-400",
    barClass: "bg-rose-500 dark:bg-rose-400",
  },
]

export function SalidaVehicularResumenCards({
  resumen,
  isLoading = false,
  selectedEstado,
  onSelectEstado,
  className,
  showDistributionBar = true,
}: SalidaVehicularResumenCardsProps) {
  const total = resumen?.total ?? 0
  const iniciadas = resumen?.iniciadas ?? 0
  const finalizadas = resumen?.finalizadas ?? 0
  const canceladas = resumen?.canceladas ?? 0

  const getPercent = (value: number) => {
    if (!total || total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const iniciadasPct = getPercent(iniciadas)
  const finalizadasPct = getPercent(finalizadas)
  const canceladasPct = getPercent(canceladas)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {RESUMEN_CARDS.map((card) => {
          const isSelected = card.estado
            ? selectedEstado.toUpperCase() === card.estado.toUpperCase()
            : !selectedEstado || selectedEstado === "ALL"
          const Icon = card.icon
          const count = card.getValue(resumen)
          const pct = card.estado ? getPercent(count) : 100

          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onSelectEstado(card.estado)}
              className={cn(
                "group relative flex items-center gap-2 sm:gap-2.5 rounded-xl border p-2 sm:p-2.5 text-left transition-all duration-200 cursor-pointer overflow-hidden transform",
                "hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-[0.99]",
                isSelected
                  ? card.activeClass
                  : cn(
                      "border-border/60 bg-card/70 backdrop-blur-xs",
                      card.hoverBorderClass,
                      card.hoverBgClass
                    )
              )}
            >
              {/* Indicador de acento inferior cuando está activo */}
              {isSelected && (
                <span
                  className={cn(
                    "absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all animate-in fade-in-50 duration-200",
                    card.indicatorClass
                  )}
                />
              )}

              <span
                className={cn(
                  "flex size-7.5 sm:size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-105 shadow-2xs",
                  isSelected ? card.iconActiveClass : card.iconInactiveClass
                )}
              >
                <Icon className="size-3.5 sm:size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate text-muted-foreground leading-none mb-1",
                    card.labelClass
                  )}
                >
                  {card.label}
                </p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "font-heading text-sm sm:text-base font-bold tracking-tight text-foreground leading-none",
                      card.numberClass
                    )}
                  >
                    {isLoading ? (
                      <span className="inline-block h-4 w-6 animate-pulse rounded bg-muted-foreground/20 align-middle" />
                    ) : (
                      count
                    )}
                  </span>
                  {!isLoading && total > 0 && card.estado !== "" && (
                    <span className="text-[10px] font-medium text-muted-foreground/80">
                      ({pct}%)
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Barra de Distribución Porcentual Interactiva */}
      {showDistributionBar && !isLoading && total > 0 && (
        <div className="px-1 pt-0.5">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/70 p-0.5 gap-0.5 shadow-inner">
            {iniciadas > 0 && (
              <div
                style={{ width: `${iniciadasPct}%` }}
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                title={`Salida: ${iniciadas} (${iniciadasPct}%)`}
              />
            )}
            {finalizadas > 0 && (
              <div
                style={{ width: `${finalizadasPct}%` }}
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                title={`Llegada (Finalizadas): ${finalizadas} (${finalizadasPct}%)`}
              />
            )}
            {canceladas > 0 && (
              <div
                style={{ width: `${canceladasPct}%` }}
                className="h-full rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-500"
                title={`Canceladas: ${canceladas} (${canceladasPct}%)`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
