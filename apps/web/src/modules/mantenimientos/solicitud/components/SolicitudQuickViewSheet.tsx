import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  User,
  Wrench,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { fetchAuthenticatedBlob } from "@/shared/api"
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
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  SolicitudMantenimientoAdjunto,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"
import { WorkflowPanel } from "./WorkflowPanel"

type SolicitudQuickViewSheetProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (solicitud: SolicitudMantenimiento) => void
  onEnviar?: (solicitud: SolicitudMantenimiento) => void
  onWorkflowAction?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
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
  onEdit: _onEdit,
  onEnviar: _onEnviar,
  onWorkflowAction,
}: SolicitudQuickViewSheetProps) {
  const [copied, setCopied] = useState(false)
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

  function copyNumero(e: React.MouseEvent) {
    e.stopPropagation()
    if (!solicitud?.numero) return
    navigator.clipboard.writeText(solicitud.numero)
    setCopied(true)
    toast.success(`Folio "${solicitud.numero}" copiado`)
    setTimeout(() => setCopied(false), 2000)
  }

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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Header Bar */}
        <SheetHeader className="pb-3 border-b space-y-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {solicitud.numero ? (
              <div
                onClick={copyNumero}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
                title="Copiar folio"
              >
                <span>{solicitud.numero}</span>
                {copied ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <Copy className="size-3 opacity-70" />
                )}
              </div>
            ) : null}

            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                estadoStyle,
              )}
            >
              {solicitud.estado}
            </span>

            {solicitud.prioridad ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold shrink-0",
                  prioridadStyle,
                )}
              >
                {solicitud.prioridad.nombre}
              </span>
            ) : null}

            {solicitud.tipoMantenimiento ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border shrink-0",
                  getTipoMantenimientoBadgeClass(
                    solicitud.tipoMantenimiento.nombre,
                    false,
                  ),
                )}
              >
                <Wrench className="size-3" />
                <span>{solicitud.tipoMantenimiento.nombre}</span>
              </span>
            ) : null}
          </div>

          <SheetTitle className="text-base sm:text-lg font-heading font-bold text-foreground text-left leading-snug">
            {solicitud.titulo}
          </SheetTitle>

          {solicitud.motivoMantenimiento ? (
            <SheetDescription className="text-xs text-foreground/80 font-medium text-left">
              <strong className="text-muted-foreground font-semibold">Motivo:</strong>{" "}
              {solicitud.motivoMantenimiento}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {/* WorkflowPanel - Action Bar */}
        {onWorkflowAction && (
          <WorkflowPanel
            solicitud={solicitud}
            onActionSelect={onWorkflowAction}
          />
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Activo Info */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              <Box className="size-3.5 text-primary" />
              <span>Activo Fijo Relacionado</span>
            </div>
            {solicitud.activo ? (
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {solicitud.activo.codigo}
                </code>
                <span className="font-semibold text-xs text-foreground truncate">
                  {solicitud.activo.nombre}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No asignado</p>
            )}
          </div>

          {/* Solicitante Info */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              <User className="size-3.5 text-primary" />
              <span>Datos de Solicitud</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Solicitante:</span>
              <span className="font-medium text-foreground">
                {solicitud.solicitante?.nombre || "No especificado"}
              </span>
            </div>
            {solicitud.fechaSolicitud && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium text-foreground">
                  {formatDate(solicitud.fechaSolicitud)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Problem Description */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            <span>Descripción Detallada del Problema</span>
          </h4>
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {solicitud.descripcion || "Sin descripción proporcionada."}
          </p>
        </div>

        {/* Attachments Section */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="size-3.5 text-primary" />
              <span>Archivos Adjuntos ({adjuntos.length})</span>
            </h4>
            {isLoadingAdjuntos && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          {isLoadingAdjuntos ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando archivos...</span>
            </div>
          ) : adjuntos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">
              Sin archivos adjuntos.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Photo Thumbnails */}
              {imageAdjuntos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {imageAdjuntos.map((img) => (
                    <div
                      key={img.id}
                      onClick={() =>
                        setSelectedPreviewImage({
                          url: img.url,
                          name: img.nombreArchivo,
                        })
                      }
                      className="group relative aspect-square rounded-xl border border-border bg-muted/30 overflow-hidden cursor-pointer hover:border-primary transition-all shadow-2xs"
                      title={img.nombreArchivo}
                    >
                      <AuthenticatedImage
                        src={img.url}
                        alt={img.nombreArchivo}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                        fallback={
                          <div className="size-full flex flex-col items-center justify-center p-2 text-center bg-muted">
                            <ImageIcon className="size-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground truncate max-w-full">
                              {img.nombreArchivo}
                            </span>
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-1 rounded-md bg-black/60 text-white shadow-xs">
                          <Eye className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Document List */}
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
                          <p className="font-medium text-foreground truncate text-xs">
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
                          className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                          title="Descargar archivo"
                        >
                          {downloadingId === adj.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Download className="size-3" />
                          )}
                          <span>Descargar</span>
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Lifecycle Flow */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            <span>Trazabilidad de Estados</span>
          </h4>

          <div className="space-y-2 divide-y divide-border/40 text-xs">
            {/* Solicitado */}
            <div className="flex items-start gap-2.5 pt-1.5 first:pt-0">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5 font-bold text-[10px]">
                1
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Solicitado</p>
                  {solicitud.fechaSolicitud && (
                    <span className="text-[9.5px] text-muted-foreground">
                      {formatDateTime(solicitud.fechaSolicitud)}
                    </span>
                  )}
                </div>
                {solicitud.solicitante && (
                  <p className="text-[10.5px] text-muted-foreground">
                    Por: {solicitud.solicitante.nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Aprobado */}
            {(solicitud.aprobadoPor || solicitud.fechaAprobacion) && (
              <div className="flex items-start gap-2.5 pt-1.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold text-[10px]">
                  2
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Aprobado</p>
                    {solicitud.fechaAprobacion && (
                      <span className="text-[9.5px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaAprobacion)}
                      </span>
                    )}
                  </div>
                  {solicitud.aprobadoPor && (
                    <p className="text-[10.5px] text-muted-foreground">
                      Aprobador: {solicitud.aprobadoPor.nombre}
                    </p>
                  )}
                  {solicitud.observacionAprobacion && (
                    <p className="text-[10.5px] text-muted-foreground/90 italic bg-muted/40 p-1.5 rounded-md mt-1">
                      "{solicitud.observacionAprobacion}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Asignado / En Ejecución */}
            {(solicitud.responsable || solicitud.fechaInicioMantenimiento) && (
              <div className="flex items-start gap-2.5 pt-1.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 mt-0.5 font-bold text-[10px]">
                  3
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Asignación y Ejecución
                    </p>
                    {solicitud.fechaInicioMantenimiento && (
                      <span className="text-[9.5px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaInicioMantenimiento)}
                      </span>
                    )}
                  </div>
                  {solicitud.responsable && (
                    <p className="text-[10.5px] text-muted-foreground">
                      Responsable: <strong>{solicitud.responsable.nombre}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cierre */}
            {(solicitud.fechaFinalizacion || solicitud.recibidoPor) && (
              <div className="flex items-start gap-2.5 pt-1.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold text-[10px]">
                  4
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Finalizado y Cerrado
                    </p>
                    {solicitud.fechaFinalizacion && (
                      <span className="text-[9.5px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaFinalizacion)}
                      </span>
                    )}
                  </div>
                  {solicitud.recibidoPor && (
                    <p className="text-[10.5px] text-muted-foreground">
                      Recibido por: {solicitud.recibidoPor.nombre}
                    </p>
                  )}
                  {solicitud.observacionCierre && (
                    <p className="text-[10.5px] text-muted-foreground/90 italic bg-muted/40 p-1.5 rounded-md mt-1">
                      "{solicitud.observacionCierre}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Info */}
        <div className="rounded-xl border border-border/70 bg-muted/15 p-2.5 shrink-0">
          <AuditInfo data={solicitud} compact className="text-[10px]" />
        </div>

        {/* Preview Lightbox */}
        {selectedPreviewImage && (
          <div
            onClick={() => setSelectedPreviewImage(null)}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl max-h-[85vh] bg-background rounded-2xl overflow-hidden shadow-2xl p-2.5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-foreground truncate max-w-[280px]">
                  {selectedPreviewImage.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={selectedPreviewImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Abrir imagen"
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
                  alt={selectedPreviewImage.name}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
