import {
  Building2,
  Calendar,
  Clock,
  Download,
  FileCheck,
  FileIcon,
  FileText,
  MapPin,
  Paperclip,
  Tag,
  User,
  Users,
} from "lucide-react"

import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"
import { formatDate } from "@/shared/lib/format-date"

import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

type SolicitudVehicularDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudVehicular | null
  onEdit?: (solicitud: SolicitudVehicular) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

export function SolicitudVehicularDetailDialog({
  open,
  onOpenChange,
  solicitud,
  onEdit,
}: SolicitudVehicularDetailDialogProps) {
  if (!solicitud) return null

  const solicitante = solicitud.solicitante
  const tipo = solicitud.tipoSolicitudVehicular
  const adjuntos = solicitud.adjuntos ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        {/* ENCABEZADO MODAL */}
        <div className="flex flex-col gap-1 p-5 pb-4 bg-muted/20 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/25"
              >
                {solicitud.numero}
              </Badge>
              <WorkflowStatusBadge status={solicitud.estado || "PENDIENTE"} size="md" />
            </div>

            {solicitud.auditoria?.createdAt && (
              <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(solicitud.auditoria.createdAt)}
              </span>
            )}
          </div>

          <DialogHeader className="text-left mt-2">
            <DialogTitle className="text-lg font-bold text-foreground">
              {solicitud.motivo}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detalle completo del itinerario y requerimientos del servicio vehicular.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* CUERPO MODAL */}
        <div className="flex flex-col gap-5 p-5 text-xs">
          {/* 1. SECCIÓN: SOLICITANTE & TIPO */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Tarjeta Solicitante */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs">
              <Avatar className="size-9 shrink-0 border border-border/70">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(solicitante?.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Solicitante
                </span>
                <span className="font-semibold text-foreground truncate mt-0.5">
                  {solicitante?.nombreCompleto || "No especificado"}
                </span>
                <div className="flex flex-col text-[11px] text-muted-foreground mt-0.5 space-y-0.5">
                  {solicitante?.cargo && (
                    <span className="truncate flex items-center gap-1">
                      <User className="size-3" />
                      {solicitante.cargo}
                    </span>
                  )}
                  {solicitante?.area && (
                    <span className="truncate flex items-center gap-1">
                      <Building2 className="size-3" />
                      {solicitante.area}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta Tipo de Solicitud */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <Tag className="size-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de Solicitud
                </span>
                <span className="font-semibold text-foreground truncate mt-0.5">
                  {tipo?.nombre || "Tipo no asignado"}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {tipo?.diasAnticipacion !== undefined && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {tipo.diasAnticipacion === 0
                        ? "Inmediato"
                        : `${tipo.diasAnticipacion}d anticipación`}
                    </Badge>
                  )}
                  {tipo?.requiereRespaldo && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      Respaldo
                    </Badge>
                  )}
                  {tipo?.requiereJustificacion && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      Justificación
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN: ITINERARIO Y PROGRAMACIÓN */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Itinerario y Datos de Viaje
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Destino */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Destino
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5">
                  {solicitud.destino}
                </span>
              </div>

              {/* Fecha Salida */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  Salida
                </span>
                <span className="text-xs font-medium text-foreground mt-0.5">
                  {formatDate(solicitud.fechaSalida)}
                </span>
              </div>

              {/* Fecha Retorno */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  Retorno Estimado
                </span>
                <span className="text-xs font-medium text-foreground mt-0.5">
                  {formatDate(solicitud.fechaRetornoEstimada)}
                </span>
              </div>
            </div>

            <Separator className="my-0.5" />

            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Users className="size-3.5" />
              </div>
              <span className="text-xs text-muted-foreground">
                Pasajeros solicitados:{" "}
                <strong className="text-foreground font-semibold">
                  {solicitud.cantidadPasajeros}{" "}
                  {solicitud.cantidadPasajeros === 1 ? "persona" : "personas"}
                </strong>
              </span>
            </div>
          </div>

          {/* 3. JUSTIFICACIÓN Y OBSERVACIONES */}
          {(solicitud.justificacion || solicitud.observacion) && (
            <div className="flex flex-col gap-3">
              {solicitud.justificacion && (
                <div className="rounded-xl border border-border/60 p-3 bg-card/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <FileCheck className="size-3 text-purple-500" />
                    Justificación
                  </span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {solicitud.justificacion}
                  </p>
                </div>
              )}

              {solicitud.observacion && (
                <div className="rounded-xl border border-border/60 p-3 bg-card/60 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <FileText className="size-3 text-muted-foreground" />
                    Observaciones adicionales
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {solicitud.observacion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. ADJUNTOS / DOCUMENTOS DE RESPALDO */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-primary" />
                Archivos Adjuntos y Respaldos ({adjuntos.length})
              </h4>
            </div>

            {adjuntos.length === 0 ? (
              <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-border/70 bg-muted/10 text-muted-foreground text-xs">
                No se han adjuntado archivos a esta solicitud.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {adjuntos.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 bg-card/70 hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileIcon className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-xs font-medium text-foreground truncate"
                          title={adj.nombreOriginal || adj.nombreArchivo}
                        >
                          {adj.nombreOriginal || adj.nombreArchivo}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatFileSize(adj.size)}
                        </span>
                      </div>
                    </div>

                    {adj.url && (
                      <a
                        href={adj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                        title="Abrir o descargar archivo"
                      >
                        <Download className="size-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PIE DEL MODAL */}
        <div className="flex items-center justify-between p-4 bg-muted/20 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-lg"
          >
            Cerrar
          </Button>

          {onEdit && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEdit(solicitud)
              }}
              className="text-xs rounded-lg gap-1.5 shadow-2xs"
            >
              Editar Solicitud
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
