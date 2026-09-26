import { Calendar, FileCode2, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatDate } from "@/shared/lib/format-date"

import type { TipoSolicitudVehicular } from "../api/tipo-solicitud.service"

type TipoSolicitudCardViewProps = {
  tiposSolicitud: TipoSolicitudVehicular[]
  onEdit: (tipo: TipoSolicitudVehicular) => void
  onDelete: (tipo: TipoSolicitudVehicular) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function TipoSolicitudCardView({
  tiposSolicitud,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: TipoSolicitudCardViewProps) {
  if (isLoading && tiposSolicitud.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 rounded-xl border border-border/60">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mb-3" />
            <div className="flex justify-between items-center pt-2 border-t border-border/40">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (tiposSolicitud.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
        {emptyIcon}
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          {emptyTitle || "No hay tipos de solicitud registrados"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          {emptyDescription || "Registra tipos de solicitud vehicular para clasificar las órdenes y viajes."}
        </p>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiposSolicitud.map((tipo) => {
        const rawDate = tipo.auditoria?.createdAt || tipo.createdAt

        return (
          <Card
            key={tipo.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/70 hover:bg-card/95 hover:border-border transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer p-3.5"
            onClick={() => onEdit(tipo)}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <FileCode2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-muted/70 border-border/60"
                    >
                      {tipo.codigo}
                    </Badge>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(tipo)}
                    className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Editar tipo"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(tipo)}
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Eliminar tipo"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {tipo.nombre}
              </h4>

              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                {tipo.descripcion || (
                  <span className="italic text-muted-foreground/60">
                    Sin descripción detallada
                  </span>
                )}
              </p>

              {/* Requirement tags & anticipation */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-1.5 py-0 bg-muted/70 text-foreground border-border/70"
                >
                  {tipo.diasAnticipacion === 0
                    ? "Inmediato (0 d)"
                    : `${tipo.diasAnticipacion} ${tipo.diasAnticipacion === 1 ? "día" : "días"} anticipación`}
                </Badge>
                {tipo.requiereRespaldo && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    Respaldo
                  </Badge>
                )}
                {tipo.requiereJustificacion && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium px-1.5 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                  >
                    Justificación
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3 text-muted-foreground/70" />
                <span>{rawDate ? formatDate(rawDate) : "-"}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
