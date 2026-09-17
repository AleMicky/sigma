import type * as React from "react"
import { Link } from "@tanstack/react-router"
import { ClipboardList, Plus } from "lucide-react"

import { routes } from "@/app/config/routes"
import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export interface SolicitudHeaderProps {
  title?: string
  description?: string | null
  icon?: React.ReactNode
  totalCount?: number
  countLabel?: string
  createHref?: string
  onCreate?: () => void
  createLabel?: string
  showCreate?: boolean
  queries?: QueryLike | QueryLike[]
  onRefresh?: () => void | Promise<unknown>
  isRefreshing?: boolean
  showRefresh?: boolean
  extraActions?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function SolicitudHeader({
  title = "Solicitudes de Mantenimiento",
  description = "Gestiona las solicitudes de mantenimiento correctivo y preventivo de activos.",
  icon,
  totalCount,
  countLabel = "solicitudes",
  createHref = routes.mantenimientos.nuevaSolicitud,
  onCreate,
  createLabel = "Nueva Solicitud",
  showCreate = true,
  queries,
  onRefresh,
  isRefreshing,
  showRefresh = true,
  extraActions,
  className,
  children,
}: SolicitudHeaderProps) {
  const defaultIcon = (
    <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-2xs">
      <ClipboardList className="size-3.5 sm:size-4" />
    </div>
  )

  const renderCreateButton = (isMobile = false) => {
    if (!showCreate) return null

    const buttonContent = (
      <>
        <Plus className="size-3.5" />
        <span className={cn(isMobile ? "hidden xs:inline-block" : "inline-block")}>
          {createLabel}
        </span>
      </>
    )

    if (onCreate) {
      return (
        <Button
          size="sm"
          type="button"
          onClick={onCreate}
          className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer shadow-xs shadow-primary/20 transition-all duration-150 active:scale-[0.98] gap-1.5"
        >
          {buttonContent}
        </Button>
      )
    }

    return (
      <Link to={createHref}>
        <Button
          size="sm"
          type="button"
          className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer shadow-xs shadow-primary/20 transition-all duration-150 active:scale-[0.98] gap-1.5"
        >
          {buttonContent}
        </Button>
      </Link>
    )
  }

  const renderRefreshButton = (isMobile = false) => {
    if (!showRefresh) return null

    return (
      <RefreshButton
        size="sm"
        queries={queries}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        className={cn(
          "h-7.5 cursor-pointer shadow-2xs transition-all text-xs",
          isMobile ? "px-2" : "gap-1 px-2.5 font-medium",
        )}
      />
    )
  }

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-1.5 border-b border-border/70 py-1.5 sm:py-2 md:flex-row md:items-center md:justify-between transition-colors",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start sm:items-center justify-between gap-2 sm:gap-2.5">
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge */}
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
                    {totalCount} {totalCount === 1 ? countLabel.replace(/es$/, "").replace(/s$/, "") : countLabel}
                  </span>
                </span>
              )}
            </div>

            {description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 leading-tight">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Acciones en pantallas móviles (< md) */}
        <div className="flex items-center gap-1.5 shrink-0 md:hidden self-center sm:self-auto">
          {extraActions}
          {renderRefreshButton(true)}
          {renderCreateButton(true)}
        </div>
      </div>

      {/* Acciones en pantallas medianas y grandes (>= md) */}
      <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
        {extraActions}
        {renderRefreshButton(false)}
        {renderCreateButton(false)}
      </div>

      {/* Contenido adicional / sub-toolbar si se proporciona */}
      {children && (
        <div className="w-full shrink-0 pt-0.5">
          {children}
        </div>
      )}
    </header>
  )
}

