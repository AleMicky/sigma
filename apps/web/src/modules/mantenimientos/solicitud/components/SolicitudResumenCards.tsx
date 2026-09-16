import type * as React from "react"
import {
  CheckCircle2,
  Clock,
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
  hoverBorderClass: string
  hoverBgClass: string
  iconActiveClass: string
  iconInactiveClass: string
  labelClass?: string
  numberClass?: string
  extraCardClass?: string
}

const RESUMEN_CARDS: ResumenCardConfig[] = [
  {
    estado: "",
    label: "Total",
    icon: FileText,
    getValue: (resumen) => resumen?.total ?? 0,
    activeClass: "border-primary/50 bg-primary/5 ring-1 ring-primary/30",
    hoverBorderClass: "hover:border-border",
    hoverBgClass: "hover:bg-muted/30",
    iconActiveClass: "bg-primary text-primary-foreground shadow-2xs",
    iconInactiveClass: "bg-primary/10 text-primary",
  },
  {
    estado: "borrador",
    label: "Borradores",
    icon: FileEdit,
    getValue: (resumen) => resumen?.borradores ?? 0,
    activeClass: "border-zinc-400 bg-muted ring-1 ring-zinc-400/40",
    hoverBorderClass: "hover:border-border",
    hoverBgClass: "hover:bg-muted/30",
    iconActiveClass: "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 shadow-2xs",
    iconInactiveClass: "bg-muted text-muted-foreground",
  },
  {
    estado: "en_revision",
    label: "En Revisión",
    icon: Clock,
    getValue: (resumen) => resumen?.enRevision ?? 0,
    activeClass: "border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/40",
    hoverBorderClass: "hover:border-amber-500/40",
    hoverBgClass: "hover:bg-amber-500/5",
    iconActiveClass: "bg-amber-600 text-white shadow-2xs",
    iconInactiveClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    labelClass: "text-amber-700 dark:text-amber-400",
    numberClass: "text-amber-600 dark:text-amber-400",
  },
  {
    estado: "en_proceso",
    label: "En Proceso",
    icon: Wrench,
    getValue: (resumen) => resumen?.enProceso ?? 0,
    activeClass: "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30",
    hoverBorderClass: "hover:border-blue-500/30",
    hoverBgClass: "hover:bg-blue-500/5",
    iconActiveClass: "bg-blue-600 text-white shadow-2xs",
    iconInactiveClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    numberClass: "text-blue-600 dark:text-blue-400",
  },
  {
    estado: "finalizada",
    label: "Finalizadas",
    icon: CheckCircle2,
    getValue: (resumen) => resumen?.finalizadas ?? 0,
    activeClass: "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30",
    hoverBorderClass: "hover:border-emerald-500/30",
    hoverBgClass: "hover:bg-emerald-500/5",
    iconActiveClass: "bg-emerald-600 text-white shadow-2xs",
    iconInactiveClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    numberClass: "text-emerald-600 dark:text-emerald-400",
    extraCardClass: "col-span-2 sm:col-span-1",
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
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5", className)}>
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
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              isSelected
                ? card.activeClass
                : cn("border-border/70 bg-card", card.hoverBorderClass, card.hoverBgClass),
              card.extraCardClass,
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
