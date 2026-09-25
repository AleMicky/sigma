import * as React from "react"
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  IdCard,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import type { Conductor } from "../api/conductor.service"

function getInitials(name?: string | null): string {
  const clean = (name || "").trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getCategoryTheme(cat?: string | null) {
  const c = (cat || "").toUpperCase()
  switch (c) {
    case "M":
    case "P":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
    case "A":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
    case "B":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
    case "C":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    case "T":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
    default:
      return "bg-primary/15 text-primary border-primary/30"
  }
}

type ConductorCardViewProps = {
  conductores: Conductor[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  onEdit: (conductor: Conductor) => void
  onDelete: (conductor: Conductor) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function ConductorCardView({
  conductores,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle = "No se encontraron conductores",
  emptyDescription = "No hay registros disponibles para mostrar.",
  emptyIcon,
  emptyAction,
}: ConductorCardViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border/60 bg-card/60 p-5 space-y-4 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4.5 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (conductores.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-12 text-center shadow-2xs">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          action={emptyAction}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {conductores.map((conductor) => {
          const nombre =
            conductor.empleado?.nombreCompleto || "Empleado sin asignar"
          const codigo = conductor.empleado?.codigo || "-"
          const cargo = conductor.empleado?.cargo || null
          const area = conductor.empleado?.area || null
          const initials = getInitials(nombre)

          const dateStr = conductor.fechaVencimiento
          let isExpired = false
          let isExpiringSoon = false
          let diasRestantes = 0

          if (dateStr) {
            const vencimiento = new Date(dateStr)
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            diasRestantes = Math.ceil(
              (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
            )
            isExpired = diasRestantes < 0
            isExpiringSoon = diasRestantes >= 0 && diasRestantes <= 30
          }

          const categoryClasses = getCategoryTheme(conductor.categoriaLicencia)

          return (
            <Card
              key={conductor.id}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/90 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                isExpired
                  ? "border-destructive/40 hover:border-destructive/70"
                  : isExpiringSoon
                  ? "border-amber-500/40 hover:border-amber-500/70"
                  : "border-border/70 hover:border-primary/50"
              )}
            >
              <CardContent className="p-4.5 sm:p-5 flex flex-col gap-4 flex-1">
                {/* Header: Avatar, Name, Category & Status Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40 font-bold text-xs sm:text-sm text-primary-foreground shadow-sm ring-2 ring-background">
                      <span>{initials}</span>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background shadow-xs",
                          conductor.activo ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                        )}
                        title={conductor.activo ? "Habilitado / Activo" : "Inactivo"}
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <button
                        type="button"
                        onClick={() => onEdit(conductor)}
                        className="text-left text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
                        title={nombre}
                      >
                        {nombre}
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-foreground/85 bg-muted/90 px-1.5 py-0.2 rounded-md border border-border/40">
                          {codigo}
                        </span>
                        {cargo && (
                          <span className="text-[11px] font-medium text-foreground/75" title={cargo}>
                            • {cargo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-xl font-bold text-xs px-2.5 py-1 border shadow-2xs shrink-0",
                      categoryClasses
                    )}
                    title={`Categoría de licencia: ${conductor.categoriaLicencia}`}
                  >
                    Cat. {conductor.categoriaLicencia}
                  </span>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-2 pt-3 border-t border-border/50 text-xs">
                  {/* License Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <IdCard className="size-3.5 text-muted-foreground/70" />
                      Nº Licencia:
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground tracking-wide">
                      {conductor.numeroLicencia}
                    </span>
                  </div>

                  {/* Expiration Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      Vencimiento:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {dateStr ? formatDate(dateStr) : "Sin fecha"}
                      </span>
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                          <AlertTriangle className="size-3" />
                          Vencida ({Math.abs(diasRestantes)}d)
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="size-3" />
                          Vence en {diasRestantes}d
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Vigente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Area Row */}
                  {area && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Building className="size-3.5 text-muted-foreground/70" />
                        Área:
                      </span>
                      <span className="font-medium text-foreground text-right" title={area}>
                        {area}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: State & Actions */}
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
                  <div>
                    {conductor.activo ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full px-2.5 py-0.5 shadow-2xs"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Habilitado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full px-2.5 py-0.5 shadow-2xs"
                      >
                        <XCircle className="size-3.5" />
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(conductor)}
                      className="h-8 gap-1.5 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar conductor"
                    >
                      <Pencil className="size-3.5" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDelete(conductor)}
                      className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar conductor"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {page && onPageChange && page.totalElements > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs">
          <Pagination page={page} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
