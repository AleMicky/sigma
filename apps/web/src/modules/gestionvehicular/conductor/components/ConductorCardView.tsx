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
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

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
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border/60 bg-card/60 p-3.5 space-y-3 rounded-xl shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-lg" />
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (conductores.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/40 p-8 text-center shadow-2xs">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          action={emptyAction}
        />
      </div>
    )
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {conductores.map((conductor) => {
          const nombre = conductor.empleado?.nombreCompleto || "Empleado sin asignar"
          const codigo = conductor.empleado?.codigo || "-"
          const cargo = conductor.empleado?.cargo || null
          const area = conductor.empleado?.area || null
          const initials = getInitials(nombre)

          const dateStr = conductor.fechaVencimiento
          let isExpired = false
          let isExpiringSoon = false
          let diasRestantes = 0

          if (dateStr) {
            diasRestantes = Math.ceil(
              (new Date(dateStr).getTime() - hoy.getTime()) / 86_400_000
            )
            isExpired = diasRestantes < 0
            isExpiringSoon = diasRestantes >= 0 && diasRestantes <= 30
          }

          const categoryClasses = getCategoryTheme(conductor.categoriaLicencia)

          return (
            <Card
              key={conductor.id}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/90 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                isExpired
                  ? "border-destructive/40 hover:border-destructive/70"
                  : isExpiringSoon
                  ? "border-amber-500/40 hover:border-amber-500/70"
                  : "border-border/70 hover:border-primary/50"
              )}
            >
              <CardContent className="p-3.5 flex flex-col gap-2.5 flex-1">
                {/* Header: Avatar, Name, Category */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40 font-bold text-xs text-primary-foreground shadow-2xs ring-2 ring-background">
                      <span>{initials}</span>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background shadow-2xs",
                          conductor.activo ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                        )}
                        title={conductor.activo ? "Habilitado / Activo" : "Inactivo"}
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <button
                        type="button"
                        onClick={() => onEdit(conductor)}
                        className="text-left text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                        title={nombre}
                      >
                        {nombre}
                      </button>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                        <span className="font-mono text-[10px] font-semibold text-foreground/85 bg-muted/90 px-1.5 py-0.2 rounded border border-border/40">
                          {codigo}
                        </span>
                        {cargo && (
                          <span className="truncate text-[10px] font-medium text-foreground/75" title={cargo}>
                            • {cargo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-lg font-bold text-[10px] px-2 py-0.5 border shadow-2xs shrink-0",
                      categoryClasses
                    )}
                    title={`Categoría: ${conductor.categoriaLicencia}`}
                  >
                    Cat. {conductor.categoriaLicencia}
                  </span>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50 text-xs">
                  {/* License Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                      <IdCard className="size-3 text-muted-foreground/70" />
                      Nº Licencia:
                    </span>
                    <span className="font-mono text-xs font-semibold text-foreground tracking-wide">
                      {conductor.numeroLicencia}
                    </span>
                  </div>

                  {/* Expiration Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      Vencimiento:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-foreground">
                        {dateStr ? formatDate(dateStr) : "Sin fecha"}
                      </span>
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-1 py-0.2 text-[10px] font-semibold text-destructive">
                          <AlertTriangle className="size-2.5" />
                          Vencida ({Math.abs(diasRestantes)}d)
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1 py-0.2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="size-2.5" />
                          Vence ({diasRestantes}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1 py-0.2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Vigente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Area Row */}
                  {area && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                        <Building className="size-3 text-muted-foreground/70" />
                        Área:
                      </span>
                      <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]" title={area}>
                        {area}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: State & Actions */}
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                  <div>
                    {conductor.activo ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full px-2 py-0.2 shadow-2xs"
                      >
                        <CheckCircle2 className="size-3" />
                        Habilitado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium rounded-full px-2 py-0.2 shadow-2xs"
                      >
                        <XCircle className="size-3" />
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(conductor)}
                      className="h-7 gap-1 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar conductor"
                    >
                      <Pencil className="size-3" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDelete(conductor)}
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar conductor"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

