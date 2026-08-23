import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Pencil,
  SendHorizontal,
  User,
  UserCheck,
  Wrench,
  X,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { fetchAuthenticatedBlob } from "@/shared/api"
import { formatDateTime } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  SolicitudMantenimientoAdjunto,
} from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"

type SolicitudQuickViewSheetProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onEnviar?: (solicitud: SolicitudMantenimiento) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function isImageFile(tipoContenido?: string, nombreArchivo?: string): boolean {
  if (tipoContenido?.startsWith("image/")) return true
  const ext = (nombreArchivo ?? "").toLowerCase().split(".").pop() ?? ""
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)
}

function getFileIcon(tipoContenido?: string, nombreArchivo?: string) {
  const ext = (nombreArchivo ?? "").toLowerCase().split(".").pop() ?? ""
  if (["pdf"].includes(ext) || tipoContenido?.includes("pdf")) {
    return <FileText className="size-4 text-rose-500 shrink-0" />
  }
  if (
    ["xlsx", "xls", "csv"].includes(ext) ||
    tipoContenido?.includes("sheet") ||
    tipoContenido?.includes("excel")
  ) {
    return <FileSpreadsheet className="size-4 text-emerald-500 shrink-0" />
  }
  if (["json", "xml", "html"].includes(ext)) {
    return <FileCode className="size-4 text-amber-500 shrink-0" />
  }
  if (isImageFile(tipoContenido, nombreArchivo)) {
    return <ImageIcon className="size-4 text-blue-500 shrink-0" />
  }
  return <FileText className="size-4 text-muted-foreground shrink-0" />
}

export function SolicitudQuickViewSheet({
  solicitud: initialSolicitud,
  open,
  onOpenChange,
  onEdit,
  onEnviar,
}: SolicitudQuickViewSheetProps) {
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    url: string
    name: string
  } | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const solicitudId = initialSolicitud?.id ?? ""

  // Fetch full detail and specific attachments list to ensure they are always present
  const detailQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  const adjuntosQuery = useQuery({
    ...solicitudQueries.adjuntos(solicitudId, { size: 100 }),
    enabled: open && Boolean(solicitudId),
  })

  const solicitud = detailQuery.data ?? initialSolicitud

  const adjuntos = useMemo(() => {
    if (adjuntosQuery.data?.content && adjuntosQuery.data.content.length > 0) {
      return adjuntosQuery.data.content
    }
    if (detailQuery.data?.adjuntos && detailQuery.data.adjuntos.length > 0) {
      return detailQuery.data.adjuntos
    }
    return initialSolicitud?.adjuntos ?? []
  }, [adjuntosQuery.data, detailQuery.data, initialSolicitud])

  const imageAdjuntos = useMemo(
    () => adjuntos.filter((a) => isImageFile(a.tipoContenido, a.nombreArchivo)),
    [adjuntos],
  )
  const docAdjuntos = useMemo(
    () => adjuntos.filter((a) => !isImageFile(a.tipoContenido, a.nombreArchivo)),
    [adjuntos],
  )

  const isLoadingAdjuntos =
    (adjuntosQuery.isLoading || detailQuery.isLoading) && adjuntos.length === 0

  async function handleDownloadFile(adj: SolicitudMantenimientoAdjunto) {
    if (!adj.url) return
    try {
      setDownloadingId(adj.id)
      const blob = await fetchAuthenticatedBlob(adj.url)
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = adj.nombreArchivo || "archivo"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(adj.url, "_blank")
    } finally {
      setDownloadingId(null)
    }
  }

  if (!solicitud) return null

  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-4 sm:p-5 flex flex-col gap-0">
        {/* Header Compacto */}
        <SheetHeader className="pb-3 border-b space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {solicitud.numero ? (
                <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary border border-primary/20">
                  {solicitud.numero}
                </code>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                  estadoStyle,
                )}
              >
                {solicitud.estado}
              </span>
            </div>

            {solicitud.prioridad ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold shrink-0",
                  prioridadStyle,
                )}
              >
                Prioridad: {solicitud.prioridad.nombre}
              </span>
            ) : null}
          </div>

          <SheetTitle className="text-sm sm:text-base font-heading font-bold text-foreground text-left leading-tight">
            {solicitud.titulo}
          </SheetTitle>

          {solicitud.motivoMantenimiento ? (
            <SheetDescription className="text-xs text-foreground/80 font-medium text-left">
              <span className="text-muted-foreground font-semibold">Motivo:</span>{" "}
              {solicitud.motivoMantenimiento}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {/* Cuerpo Compacto con Scroll */}
        <div className="flex-1 space-y-3 py-3 text-xs overflow-y-auto pr-0.5">
          {solicitud.estado?.toLowerCase() === "solicitado" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-900 dark:text-amber-200">
              <UserCheck className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1 text-[11px] leading-tight">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Pendiente de Aprobación
                </p>
                <p className="text-amber-700/90 dark:text-amber-300/80 text-[10.5px]">
                  La solicitud está a la espera de revisión y aprobación por parte de los responsables correspondientes.
                </p>
              </div>
            </div>
          )}

          {/* Activo & Tipo Compact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                <Box className="size-3 text-primary" />
                <span>Activo</span>
              </div>
              {solicitud.activo ? (
                <div className="truncate">
                  <p className="font-semibold text-foreground truncate text-xs">
                    <span className="font-mono text-primary font-bold mr-1 text-[10.5px]">
                      {solicitud.activo.codigo}
                    </span>
                    {solicitud.activo.nombre}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px]">No asignado</p>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                <Wrench className="size-3 text-primary" />
                <span>Tipo Mantenimiento</span>
              </div>
              {solicitud.tipoMantenimiento ? (
                <div className="truncate">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate mt-0.5",
                      getTipoMantenimientoBadgeClass(
                        solicitud.tipoMantenimiento.nombre,
                        false,
                      ),
                    )}
                  >
                    {solicitud.tipoMantenimiento.nombre}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px]">No especificado</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción del Problema
            </h4>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-xs">
              {solicitud.descripcion}
            </p>
          </div>

          {/* Archivos Adjuntos con Galería y Documentos */}
          <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Paperclip className="size-3 text-primary" />
                Archivos Adjuntos ({adjuntos.length})
              </h4>
              {isLoadingAdjuntos && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>

            {isLoadingAdjuntos ? (
              <div className="flex items-center gap-2 py-3 justify-center text-muted-foreground text-[11px]">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Cargando archivos adjuntos...</span>
              </div>
            ) : adjuntos.length === 0 ? (
              <p className="text-muted-foreground/60 italic text-[11px] py-1">
                Sin archivos adjuntos en esta solicitud.
              </p>
            ) : (
              <div className="space-y-2.5">
                {/* Image Previews Grid */}
                {imageAdjuntos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imageAdjuntos.map((img) => (
                      <div
                        key={img.id}
                        onClick={() =>
                          setSelectedPreviewImage({
                            url: img.url,
                            name: img.nombreArchivo,
                          })
                        }
                        className="group relative aspect-square rounded-lg border border-border/80 bg-muted/40 overflow-hidden cursor-pointer hover:border-primary/60 transition-all shadow-2xs"
                        title={img.nombreArchivo}
                      >
                        <AuthenticatedImage
                          src={img.url}
                          alt={img.nombreArchivo}
                          className="size-full object-cover group-hover:scale-105 transition-transform"
                          fallback={
                            <div className="size-full flex flex-col items-center justify-center p-1 text-center bg-muted">
                              <ImageIcon className="size-4 text-muted-foreground mb-1" />
                              <span className="text-[9px] text-muted-foreground truncate max-w-full px-1">
                                {img.nombreArchivo}
                              </span>
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <span className="p-1 rounded-md bg-black/60 text-white shadow-xs">
                            <Eye className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Files List */}
                {docAdjuntos.length > 0 && (
                  <ul className="space-y-1.5 divide-y divide-border/40">
                    {docAdjuntos.map((adj: SolicitudMantenimientoAdjunto) => (
                      <li
                        key={adj.id}
                        className="flex items-center justify-between gap-2 pt-1.5 first:pt-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getFileIcon(adj.tipoContenido, adj.nombreArchivo)}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[190px] sm:max-w-[240px] text-xs">
                              {adj.nombreArchivo}
                            </p>
                            <p className="text-[9.5px] text-muted-foreground">
                              {formatFileSize(adj.size)}
                              {adj.descripcion ? ` • ${adj.descripcion}` : ""}
                            </p>
                          </div>
                        </div>

                        {adj.url ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadFile(adj)}
                            disabled={downloadingId === adj.id}
                            className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                            title="Descargar archivo"
                          >
                            {downloadingId === adj.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Download className="size-3" />
                            )}
                            <span className="hidden sm:inline">Descargar</span>
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Ciclo de Vida Compacto */}
          <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Flujo de Estado
            </h4>

            <div className="space-y-2 divide-y divide-border/40 text-[11px]">
              {/* Solicitado */}
              <div className="flex items-start gap-2 pt-1.5 first:pt-0">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  <User className="size-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Solicitado</p>
                    {solicitud.fechaSolicitud ? (
                      <span className="text-[9.5px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaSolicitud)}
                      </span>
                    ) : null}
                  </div>
                  {solicitud.solicitante ? (
                    <p className="text-[10.5px] text-muted-foreground">
                      Por: {solicitud.solicitante.nombre}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Aprobación */}
              {solicitud.aprobadoPor || solicitud.fechaAprobacion ? (
                <div className="flex items-start gap-2 pt-1.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5">
                    <UserCheck className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">Aprobado</p>
                      {solicitud.fechaAprobacion ? (
                        <span className="text-[9.5px] text-muted-foreground">
                          {formatDateTime(solicitud.fechaAprobacion)}
                        </span>
                      ) : null}
                    </div>
                    {solicitud.aprobadoPor ? (
                      <p className="text-[10.5px] text-muted-foreground">
                        Aprobador: {solicitud.aprobadoPor.nombre}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Ejecución */}
              {solicitud.responsable || solicitud.fechaInicioMantenimiento ? (
                <div className="flex items-start gap-2 pt-1.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                    <Clock className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">En Ejecución</p>
                      {solicitud.fechaInicioMantenimiento ? (
                        <span className="text-[9.5px] text-muted-foreground">
                          {formatDateTime(solicitud.fechaInicioMantenimiento)}
                        </span>
                      ) : null}
                    </div>
                    {solicitud.responsable ? (
                      <p className="text-[10.5px] text-muted-foreground">
                        Responsable: {solicitud.responsable.nombre}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Finalización */}
              {solicitud.fechaFinalizacion || solicitud.recibidoPor ? (
                <div className="flex items-start gap-2 pt-1.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <CheckCircle2 className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">Finalizado</p>
                      {solicitud.fechaFinalizacion ? (
                        <span className="text-[9.5px] text-muted-foreground">
                          {formatDateTime(solicitud.fechaFinalizacion)}
                        </span>
                      ) : null}
                    </div>
                    {solicitud.recibidoPor ? (
                      <p className="text-[10.5px] text-muted-foreground">
                        Recibido por: {solicitud.recibidoPor.nombre}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Información de Auditoría */}
          <div className="rounded-xl border border-border/70 bg-muted/10 p-2.5">
            <AuditInfo data={solicitud} compact className="text-[10px]" />
          </div>
        </div>

        {/* Modal de Vista Previa de Imagen */}
        {selectedPreviewImage && (
          <div
            onClick={() => setSelectedPreviewImage(null)}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl max-h-[85vh] bg-background rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-semibold text-foreground truncate max-w-[300px]">
                  {selectedPreviewImage.name || "Vista Previa"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={selectedPreviewImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewImage(null)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
                <AuthenticatedImage
                  src={selectedPreviewImage.url}
                  alt={selectedPreviewImage.name || "Vista previa"}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t flex items-center justify-end gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Cerrar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              onOpenChange(false)
              onEdit(solicitud)
            }}
            className="gap-1.5 text-xs h-8 font-semibold shadow-2xs"
          >
            <Pencil className="size-3.5" />
            <span>Editar Solicitud</span>
          </Button>
          {solicitud.estado?.toLowerCase() === "borrador" && onEnviar ? (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEnviar(solicitud)
              }}
              className="gap-1.5 text-xs h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
            >
              <SendHorizontal className="size-3.5" />
              <span>Enviar Solicitud</span>
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
