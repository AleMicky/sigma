import * as React from "react"
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Pencil,
  ShieldAlert,
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

import type { Conductor, ConductorLicencia } from "../api/conductor.service"

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

function getEstadoConductorBadge(estado?: string | null) {
  const est = (estado || "ACTIVO").toUpperCase()
  switch (est) {
    case "ACTIVO":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-full px-2 py-0.2 shadow-2xs"
        >
          <CheckCircle2 className="size-3 shrink-0" />
          Activo
        </Badge>
      )
    case "INACTIVO":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-[10px] font-semibold rounded-full px-2 py-0.2 shadow-2xs"
        >
          <XCircle className="size-3 shrink-0" />
          Inactivo
        </Badge>
      )
    case "SUSPENDIDO":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold rounded-full px-2 py-0.2 shadow-2xs"
        >
          <AlertTriangle className="size-3 shrink-0" />
          Suspendido
        </Badge>
      )
    case "BAJA":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-semibold rounded-full px-2 py-0.2 shadow-2xs"
        >
          <ShieldAlert className="size-3 shrink-0" />
          Baja
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {est}
        </Badge>
      )
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border/60 bg-card/60 p-4 space-y-3 rounded-xl shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {conductores.map((conductor) => {
          const nombre = conductor.empleado?.nombreCompleto || "Empleado sin asignar"
          const codigo = conductor.empleado?.codigo || "-"
          const cargo = conductor.empleado?.cargo || null
          const area = conductor.empleado?.area || null
          const initials = getInitials(nombre)
          const licencias: ConductorLicencia[] = conductor.licencias || []

          return (
            <Card
              key={conductor.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card/90 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/50"
            >
              <CardContent className="p-4 flex flex-col gap-3 flex-1">
                {/* Header: Avatar, Name, Employee Code & Conductor Estado */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40 font-bold text-xs text-primary-foreground shadow-2xs ring-2 ring-background">
                      <span>{initials}</span>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background shadow-2xs",
                          conductor.activo ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                        )}
                        title={conductor.activo ? "Habilitado" : "Inactivo"}
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

                  {getEstadoConductorBadge(conductor.estado)}
                </div>

                {/* Detalle de Licencias */}
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="size-3 text-primary" />
                      Licencias ({licencias.length})
                    </span>
                  </div>

                  {licencias.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic py-1">
                      Sin licencias registradas
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {licencias.map((lic, idx) => {
                        const catClasses = getCategoryTheme(lic.categoriaLicencia)
                        let isExpired = false
                        let isExpiringSoon = false
                        let diasRestantes = 0

                        if (lic.fechaVencimiento) {
                          diasRestantes = Math.ceil(
                            (new Date(lic.fechaVencimiento).getTime() - hoy.getTime()) / 86_400_000
                          )
                          isExpired = diasRestantes < 0
                          isExpiringSoon = diasRestantes >= 0 && diasRestantes <= 30
                        }

                        return (
                          <div
                            key={lic.id || idx}
                            className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 border border-border/50 p-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  "inline-flex size-5 items-center justify-center rounded font-bold text-[9.5px] border shrink-0",
                                  catClasses
                                )}
                              >
                                {lic.categoriaLicencia}
                              </span>
                              <span className="font-mono text-xs font-semibold text-foreground truncate">
                                {lic.numeroLicencia}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {lic.fechaVencimiento ? (
                                isExpired ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.2 text-[9.5px] font-semibold text-destructive">
                                    <AlertTriangle className="size-2.5" />
                                    Vencida
                                  </span>
                                ) : isExpiringSoon ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.2 text-[9.5px] font-semibold text-amber-600 dark:text-amber-400">
                                    <Clock className="size-2.5" />
                                    {diasRestantes}d
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatDate(lic.fechaVencimiento)}
                                  </span>
                                )
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Additional Info / Observación */}
                {(conductor.observacion || area) && (
                  <div className="text-[11px] text-muted-foreground flex flex-col gap-1 pt-1 border-t border-border/30">
                    {area && (
                      <div className="flex items-center gap-1.5">
                        <Building className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{area}</span>
                      </div>
                    )}
                    {conductor.observacion && (
                      <p className="text-[10.5px] text-muted-foreground/80 italic line-clamp-1">
                        &quot;{conductor.observacion}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Footer: Actions */}
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    {conductor.activo ? "Habilitado en sistema" : "Deshabilitado"}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(conductor)}
                      className="h-7 gap-1 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Editar conductor"
                    >
                      <Pencil className="size-3" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDelete(conductor)}
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
