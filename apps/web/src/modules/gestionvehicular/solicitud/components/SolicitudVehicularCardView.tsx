import {
  Clock,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  Users,
} from "lucide-react"

import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatDate } from "@/shared/lib/format-date"

import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

type SolicitudVehicularCardViewProps = {
  data: SolicitudVehicular[]
  isLoading?: boolean
  hasFilters?: boolean
  onResetFilters?: () => void
  onCreate?: () => void
  onView: (solicitud: SolicitudVehicular) => void
  onEdit: (solicitud: SolicitudVehicular) => void
  onDelete: (solicitud: SolicitudVehicular) => void
}

function getInitials(name?: string): string {
  if (!name) return "SV"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

export function SolicitudVehicularCardView({
  data,
  isLoading = false,
  hasFilters = false,
  onResetFilters,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: SolicitudVehicularCardViewProps) {
  if (isLoading && data.length === 0) {
    return (
      <div className="p-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 rounded-xl border border-border/60">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-3" />
            <div className="flex justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/60 shadow-2xs">
          {hasFilters ? (
            <SearchX className="size-6 text-muted-foreground" />
          ) : (
            <FileText className="size-6 text-primary" />
          )}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          {hasFilters
            ? "Sin resultados para tu búsqueda"
            : "No hay solicitudes de vehículos registradas."}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          {hasFilters
            ? "No se encontraron coincidencias con los filtros seleccionados. Intenta cambiar de término o limpiarlos."
            : "Comienza registrando la primera solicitud vehicular para programar el traslado y salida de la flota."}
        </p>
        {hasFilters ? (
          <Button
            onClick={onResetFilters}
            variant="outline"
            size="sm"
            className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/70 cursor-pointer shadow-2xs"
          >
            Limpiar búsqueda
          </Button>
        ) : (
          <Button
            onClick={onCreate}
            size="sm"
            className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            Nueva Solicitud
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="p-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((solicitud) => {
        const solicitante = solicitud.solicitante
        const tipo = solicitud.tipoSolicitudVehicular
        const adjuntosCount = solicitud.adjuntos?.length ?? 0

        return (
          <Card
            key={solicitud.id}
            onClick={() => onView(solicitud)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/70 hover:bg-card/95 hover:border-border transition-all duration-200 shadow-2xs hover:shadow-xs p-3.5 cursor-pointer"
          >
            <div>
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs font-semibold px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
                  >
                    {solicitud.numero}
                  </Badge>
                  <WorkflowStatusBadge
                    status={solicitud.estado || "PENDIENTE"}
                    size="sm"
                  />
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                          title="Opciones"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => onView(solicitud)}
                        className="cursor-pointer gap-2 text-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>Ver detalle</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(solicitud)}
                        className="cursor-pointer gap-2 text-xs"
                      >
                        <Pencil className="size-3.5" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(solicitud)}
                        className="cursor-pointer gap-2 text-xs"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Solicitante */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="size-6 shrink-0 border border-border/70">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[9px]">
                    {getInitials(solicitante?.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground truncate">
                    {solicitante?.nombreCompleto || "Sin solicitante"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {solicitante?.area || solicitante?.cargo || ""}
                  </span>
                </div>
              </div>

              {/* Motivo */}
              <h4
                className="text-xs font-semibold text-foreground line-clamp-1 mb-1"
                title={solicitud.motivo}
              >
                {solicitud.motivo}
              </h4>

              {/* Destino */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 truncate">
                <MapPin className="size-3 text-primary shrink-0" />
                <span className="truncate">{solicitud.destino}</span>
              </div>

              {/* Badges de info */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tipo?.nombre && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 bg-muted/40 text-foreground border-border/60"
                  >
                    {tipo.nombre}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 gap-1 text-muted-foreground border-border/60"
                >
                  <Users className="size-2.5" />
                  {solicitud.cantidadPasajeros ?? 1} pas.
                </Badge>
                {adjuntosCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 gap-1 text-muted-foreground border-border/60"
                  >
                    <Paperclip className="size-2.5" />
                    {adjuntosCount}
                  </Badge>
                )}
              </div>
            </div>

            {/* Footer de la tarjeta con fecha */}
            <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                <span>Salida: {formatDate(solicitud.fechaSalida)}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
