import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Calendar,
  CheckSquare,
  Edit2,
  Eye,
  Trash2,
  User,
  Wrench,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
import type { OrdenTrabajo } from "../api/orden-trabajo.service"

type OrdenTrabajoListItemProps = {
  ordenTrabajo: OrdenTrabajo
  onQuickView: (ot: OrdenTrabajo) => void
  onEdit: (ot: OrdenTrabajo) => void
  onDelete: (id: string) => void
}

export function OrdenTrabajoListItem({
  ordenTrabajo,
  onQuickView,
  onEdit,
  onDelete,
}: OrdenTrabajoListItemProps) {
  // Query activities count & completion
  const actividadesQuery = useQuery(
    ordenTrabajoQueries.actividadesByOT(ordenTrabajo.id),
  )
  const actividades = actividadesQuery.data?.content ?? []
  const totalAct = actividades.length
  const completadas = actividades.filter((a) => a.realizado).length
  const progressPercent =
    totalAct > 0 ? Math.round((completadas / totalAct) * 100) : 0

  return (
    <div
      onClick={() => onQuickView(ordenTrabajo)}
      className="group relative flex flex-col gap-2 rounded-xl border border-border/80 bg-card/60 p-3 sm:p-3.5 shadow-2xs hover:border-sky-500/50 hover:bg-muted/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Icon, OT Number, Activo, Responsable */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs group-hover:scale-105 transition-transform">
            <Wrench className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-xs sm:text-sm text-foreground">
                {ordenTrabajo.numero || "OT"}
              </span>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0 uppercase tracking-wide",
                  progressPercent === 100
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : progressPercent > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
                )}
              >
                {progressPercent === 100
                  ? "Finalizada"
                  : progressPercent > 0
                    ? `${progressPercent}% ejecutado`
                    : "Asignada"}
              </Badge>

              {totalAct > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <CheckSquare className="size-3 text-emerald-500" />
                  <span>{completadas}/{totalAct} tareas</span>
                </span>
              )}
            </div>

            {/* Activo & Responsable */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
              {ordenTrabajo.activo && (
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <Box className="size-3 text-sky-500 shrink-0" />
                  <span className="font-semibold text-foreground truncate">
                    {ordenTrabajo.activo.codigo}
                  </span>
                  <span className="truncate">({ordenTrabajo.activo.nombre})</span>
                </div>
              )}

              {ordenTrabajo.responsable && (
                <>
                  <span className="text-muted-foreground/40 font-bold">•</span>
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <User className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{ordenTrabajo.responsable.nombre}</span>
                  </div>
                </>
              )}
            </div>

            {/* Diagnóstico o Trabajo Realizado snippet */}
            {(ordenTrabajo.diagnostico || ordenTrabajo.trabajoRealizado) && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {ordenTrabajo.diagnostico || ordenTrabajo.trabajoRealizado}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Fechas & Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          {ordenTrabajo.fechaInicio && (
            <div className="hidden sm:flex flex-col items-end text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 text-[10px]">
                <Calendar className="size-3 text-muted-foreground/70" />
                <span>Inicio:</span>
              </span>
              <span className="font-medium text-foreground text-[11px]">
                {new Date(ordenTrabajo.fechaInicio).toLocaleDateString()}
              </span>
            </div>
          )}

          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onQuickView(ordenTrabajo)}
              className="h-7 px-2 text-xs font-semibold gap-1 text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20"
            >
              <Eye className="size-3.5" />
              <span>Ver Tareas</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(ordenTrabajo)}
              className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
              title="Editar orden"
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(ordenTrabajo.id)}
              className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              title="Eliminar orden"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mini Progress bar on card bottom */}
      {totalAct > 0 && (
        <div className="w-full bg-muted/60 h-1 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              progressPercent === 100 ? "bg-emerald-500" : "bg-sky-500",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}
