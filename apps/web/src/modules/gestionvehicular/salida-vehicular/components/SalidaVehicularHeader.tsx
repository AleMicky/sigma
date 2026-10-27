import type * as React from "react"
import { Car, Plus } from "lucide-react"

import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export interface SalidaVehicularHeaderProps {
  title?: string
  description?: string | null
  icon?: React.ReactNode
  totalCount?: number
  countLabel?: string
  onCreate?: () => void
  createLabel?: string
  showCreate?: boolean
  queries?: QueryLike | QueryLike[]
  onRefresh?: () => void | Promise<unknown>
  isRefreshing?: boolean
  showRefresh?: boolean
  extraActions?: React.ReactNode
  className?: string
}

export function SalidaVehicularHeader({
  title = "Gestión de Salidas Vehiculares",
  description = "Control operativo de comisiones de viaje, seguimiento de transiciones Flowable BPMN y registro de bitácoras.",
  icon,
  totalCount,
  countLabel = "salidas",
  onCreate,
  createLabel = "Nueva Salida",
  showCreate = true,
  queries,
  onRefresh,
  isRefreshing,
  showRefresh = true,
  extraActions,
  className,
}: SalidaVehicularHeaderProps) {
  const defaultIcon = (
    <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-2xs">
      <Car className="size-3.5 sm:size-4" />
    </div>
  )

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-2 border-b border-border/70 py-1.5 sm:py-2 md:flex-row md:items-center md:justify-between transition-colors",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-start sm:items-center justify-between gap-2 sm:gap-2.5">
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge de conteo */}
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-2.5">
          {icon !== undefined ? icon : defaultIcon}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-heading text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground truncate leading-tight">
                {title}
              </h1>
              {totalCount !== undefined && totalCount >= 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/25 px-2 py-0.2 text-[10px] sm:text-[11px] font-semibold text-primary shrink-0 transition-all shadow-2xs">
                  <span className="relative flex size-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
                  </span>
                  <span>
                    {totalCount} {totalCount === 1 ? countLabel.replace(/s\b/g, "") : countLabel}
                  </span>
                </span>
              )}
            </div>

            {description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Acciones en pantallas móviles (< md) */}
        <div className="flex items-center gap-1.5 shrink-0 md:hidden self-center sm:self-auto">
          {showRefresh && (
            <RefreshButton
              size="sm"
              queries={queries}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              className="h-7.5 px-2 text-xs"
            />
          )}
          {showCreate && onCreate && (
            <Button
              size="sm"
              type="button"
              onClick={onCreate}
              className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer shadow-xs gap-1"
            >
              <Plus className="size-3.5" />
              <span className="hidden xs:inline-block">{createLabel}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lado derecho en pantallas de escritorio (>= md) */}
      <div className="hidden md:flex md:items-center md:gap-2 shrink-0">

        {extraActions}

        {showRefresh && (
          <RefreshButton
            size="sm"
            queries={queries}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            className="h-7.5 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
          />
        )}

        {showCreate && onCreate && (
          <Button
            size="sm"
            type="button"
            onClick={onCreate}
            className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer shadow-xs shadow-primary/20 gap-1.5 transition-all active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            <span>{createLabel}</span>
          </Button>
        )}
      </div>
    </header>
  )
}
