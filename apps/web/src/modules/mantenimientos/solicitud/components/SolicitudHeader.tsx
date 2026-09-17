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
    <div className="flex size-8.5 sm:size-9.5 md:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
      <ClipboardList className="size-4 sm:size-4.5 md:size-5" />
    </div>
  )

  const renderCreateButton = (isMobile = false) => {
    if (!showCreate) return null

    const buttonContent = (
      <>
        <Plus className={cn(isMobile ? "size-3.5" : "size-4")} />
        <span className={cn(isMobile ? "hidden xs:inline-block sm:inline-block" : "inline-block")}>
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
          className={cn(
            "shrink-0 font-semibold cursor-pointer shadow-xs transition-all active:scale-[0.98]",
            isMobile ? "h-7.5 px-2 xs:px-2.5 sm:px-3 text-xs gap-1.5" : "h-8.5 gap-2 px-3.5 text-xs",
          )}
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
          className={cn(
            "shrink-0 font-semibold cursor-pointer shadow-xs transition-all active:scale-[0.98]",
            isMobile ? "h-7.5 px-2 xs:px-2.5 sm:px-3 text-xs gap-1.5" : "h-8.5 gap-2 px-3.5 text-xs",
          )}
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
          "cursor-pointer shadow-2xs transition-all",
          isMobile ? "h-7.5 px-2 text-xs" : "h-8.5 gap-1.5 px-2.5 text-xs font-medium",
        )}
      />
    )
  }

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-2.5 border-b border-border/70 py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between transition-colors",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge */}
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
          {icon !== undefined ? icon : defaultIcon}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-base sm:text-lg md:text-2xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
              {totalCount !== undefined && totalCount >= 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-primary shrink-0 transition-all">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>
                    {totalCount} {totalCount === 1 ? countLabel.replace(/es$/, "").replace(/s$/, "") : countLabel}
                  </span>
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Acciones en pantallas móviles (< md) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 md:hidden self-center sm:self-auto">
          {extraActions}
          {renderRefreshButton(true)}
          {renderCreateButton(true)}
        </div>
      </div>

      {/* Acciones en pantallas medianas y grandes (>= md) */}
      <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
        {extraActions}
        {renderRefreshButton(false)}
        {renderCreateButton(false)}
      </div>

      {/* Contenido adicional / sub-toolbar si se proporciona */}
      {children && (
        <div className="w-full shrink-0 pt-1">
          {children}
        </div>
      )}
    </header>
  )
}
