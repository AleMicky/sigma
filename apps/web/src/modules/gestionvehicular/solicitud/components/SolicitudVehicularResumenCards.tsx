import type * as React from "react"
import {
  CheckCircle2,
  FileEdit,
  FileText,
  Navigation,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

export interface SolicitudVehicularResumen {
  total: number
  borradores: number
  enProceso: number
  finalizadas: number
}

export interface SolicitudVehicularResumenCardsProps {
  resumen?: SolicitudVehicularResumen | null
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
  getValue: (resumen?: SolicitudVehicularResumen | null) => number
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
    label: "Total",
    icon: FileText,
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
    estado: "BORRADOR",
    label: "Borradores",
    icon: FileEdit,
    getValue: (resumen) => resumen?.borradores ?? 0,
    activeClass:
      "border-zinc-400/90 bg-gradient-to-br from-zinc-500/15 via-zinc-500/5 to-transparent ring-2 ring-zinc-400/50 shadow-sm dark:border-zinc-500/90",
    indicatorClass: "bg-zinc-500 shadow-xs shadow-zinc-500/50",
    hoverBorderClass: "hover:border-zinc-400/50",
    hoverBgClass: "hover:bg-muted/50",
    iconActiveClass: "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm",
    iconInactiveClass: "bg-muted text-muted-foreground border border-border/60",
    barClass: "bg-zinc-400 dark:bg-zinc-500",
  },
  {
    estado: "EN_PROCESO",
    label: "En Proceso",
    icon: Navigation,
    getValue: (resumen) => resumen?.enProceso ?? 0,
    activeClass:
      "border-blue-500/70 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent ring-2 ring-blue-500/40 shadow-sm",
    indicatorClass: "bg-blue-500 shadow-xs shadow-blue-500/50",
    hoverBorderClass: "hover:border-blue-500/50",
    hoverBgClass: "hover:bg-blue-500/[0.06]",
    iconActiveClass: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
    iconInactiveClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    numberClass: "text-blue-600 dark:text-blue-400",
    barClass: "bg-blue-500",
  },
  {
    estado: "FINALIZADA",
    label: "Completadas",
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
    barClass: "bg-emerald-500",
  },
]

export function SolicitudVehicularResumenCards({
  resumen,
  isLoading = false,
  selectedEstado,
  onSelectEstado,
  className,
  showDistributionBar = true,
}: SolicitudVehicularResumenCardsProps) {
  const total = resumen?.total ?? 0
  const borradores = resumen?.borradores ?? 0
  const enProceso = resumen?.enProceso ?? 0
  const finalizadas = resumen?.finalizadas ?? 0

  const getPercent = (value: number) => {
    if (!total || total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const borradorPct = getPercent(borradores)
  const enProcesoPct = getPercent(enProceso)
  const finalizadasPct = getPercent(finalizadas)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 sm:grid-cols-4">
        {RESUMEN_CARDS.map((card) => {
          const isSelected = card.estado
            ? selectedEstado.toUpperCase() === card.estado.toUpperCase()
            : !selectedEstado
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
                  "flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-105 shadow-2xs",
                  isSelected ? card.iconActiveClass : card.iconInactiveClass
                )}
              >
                <Icon className="size-3.5 sm:size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider truncate text-muted-foreground leading-none mb-1",
                    card.labelClass
                  )}
                >
                  {card.label}
                </p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "font-heading text-sm sm:text-lg font-bold tracking-tight text-foreground leading-none",
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
                    <span className="text-[10.5px] font-medium text-muted-foreground/80">
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
            {borradores > 0 && (
              <div
                style={{ width: `${borradorPct}%` }}
                className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-500"
                title={`Borradores: ${borradores} (${borradorPct}%)`}
              />
            )}
            {enProceso > 0 && (
              <div
                style={{ width: `${enProcesoPct}%` }}
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                title={`En Proceso: ${enProceso} (${enProcesoPct}%)`}
              />
            )}
            {finalizadas > 0 && (
              <div
                style={{ width: `${finalizadasPct}%` }}
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                title={`Completadas: ${finalizadas} (${finalizadasPct}%)`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
