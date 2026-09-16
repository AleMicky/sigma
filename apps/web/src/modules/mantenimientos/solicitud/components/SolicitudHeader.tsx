import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Plus, Shield, User } from "lucide-react"

import { routes } from "@/app/config/routes"
import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { RoleScope } from "../hooks/use-solicitud-role-scope"

export interface SolicitudHeaderProps {
  title?: ReactNode
  description?: ReactNode
  isAdmin?: boolean
  scope?: RoleScope
  onScopeChange?: (scope: RoleScope) => void
  queries?: QueryLike | QueryLike[]
  onRefresh?: () => void
  isRefreshing?: boolean
  onCreate?: () => void
  createHref?: string
  createLabel?: string
  children?: ReactNode
  className?: string
}

export function SolicitudHeader({
  title = "Solicitudes de Mantenimiento",
  description = "Gestiona las solicitudes de mantenimiento correctivo y preventivo de activos.",
  isAdmin = false,
  scope = "MINE",
  onScopeChange,
  queries,
  onRefresh,
  isRefreshing,
  onCreate,
  createHref = routes.mantenimientos.nuevaSolicitud,
  createLabel = "Crear Solicitud",
  children,
  className,
}: SolicitudHeaderProps) {
  const renderCreateButton = (isMobile: boolean) => {
    const commonClasses = isMobile
      ? "h-7 px-2 text-xs"
      : "h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs"

    if (onCreate) {
      return (
        <Button
          size="sm"
          type="button"
          onClick={onCreate}
          className={commonClasses}
        >
          <Plus className="size-3.5" />
          {isMobile ? (
            <span className="sr-only sm:not-sr-only">Crear</span>
          ) : (
            <span>{createLabel}</span>
          )}
        </Button>
      )
    }

    return (
      <Button
        size="sm"
        type="button"
        render={<Link to={createHref} />}
        className={commonClasses}
      >
        <Plus className="size-3.5" />
        {isMobile ? (
          <span className="sr-only sm:not-sr-only">Crear</span>
        ) : (
          <span>{createLabel}</span>
        )}
      </Button>
    )
  }

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              {title}
            </h1>

            {isAdmin ? (
              <div className="inline-flex rounded-lg bg-muted p-0.5 border text-xs">
                <button
                  type="button"
                  onClick={() => onScopeChange?.("ALL")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    scope === "ALL"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Shield className="size-3" />
                  <span>Todas (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onScopeChange?.("MINE")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    scope === "MINE"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <User className="size-3" />
                  <span>Solo Mías</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <User className="size-3" />
                <span>Mis Solicitudes</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 md:hidden">
            <RefreshButton
              queries={queries}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              size="sm"
              className="h-7 px-2"
            />
            {renderCreateButton(true)}
            {children}
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
        <RefreshButton
          queries={queries}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs"
        />
        {renderCreateButton(false)}
        {children}
      </div>
    </header>
  )
}
