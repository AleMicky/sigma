import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Calendar,
  Check,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  History,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

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
import { SolicitudTrazabilidadModal } from "./SolicitudTrazabilidadModal"
import { WorkflowPanel } from "./WorkflowPanel"

type SolicitudDetalleModalProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
    return <FileText className="size-3.5 text-rose-500 shrink-0" />
  }
  if (
    ["xlsx", "xls", "csv"].includes(ext) ||
    tipoContenido?.includes("sheet") ||
    tipoContenido?.includes("excel")
  ) {
    return <FileSpreadsheet className="size-3.5 text-emerald-500 shrink-0" />
  }
  if (["json", "xml", "html"].includes(ext)) {
    return <FileCode className="size-3.5 text-amber-500 shrink-0" />
  }
  if (isImageFile(tipoContenido, nombreArchivo)) {
    return <ImageIcon className="size-3.5 text-blue-500 shrink-0" />
  }
  return <FileText className="size-3.5 text-muted-foreground shrink-0" />
}

export function SolicitudDetalleModal({
  solicitud: initialSolicitud,
  open,
  onOpenChange,
  onWorkflowAction,
}: SolicitudDetalleModalProps) {
  const [copied, setCopied] = useState(false)
  const [showTrazabilidad, setShowTrazabilidad] = useState(false)
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Header Compact Bar */}
          <DialogHeader className="pb-2.5 border-b space-y-1.5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {solicitud.numero ? (
                  <div
                    onClick={copyNumero}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
                    title="Copiar folio"
                  >
                    <span>{solicitud.numero}</span>
                    {copied ? (
                      <Check className="size-2.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-2.5 opacity-70" />
                    )}
                  </div>
                ) : null}

                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold capitalize",
                    estadoStyle,
                  )}
                >
                  {solicitud.estado}
                </span>

                {solicitud.prioridad ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border shrink-0",
                      prioridadStyle,
                    )}
                  >
                    {solicitud.prioridad.nombre}
                  </span>
                ) : null}

                {solicitud.tipoMantenimiento ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0",
                      getTipoMantenimientoBadgeClass(
                        solicitud.tipoMantenimiento.nombre,
                        false,
                      ),
                    )}
                  >
                    <Wrench className="size-2.5" />
                    <span>{solicitud.tipoMantenimiento.nombre}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botón Control de Activo */}
                <Link
                  to="/mantenimientos/controles-activos/nuevo"
                  search={{ solicitudId: solicitud.id }}
                  onClick={() => onOpenChange(false)}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2.5 text-[11px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/20 hover:border-sky-500/50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                  >
                    <ClipboardCheck className="size-3 text-sky-600 dark:text-sky-400" />
                    <span>Control de Activo</span>
                  </Button>
                </Link>

                {/* Botón de Trazabilidad */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTrazabilidad(true)}
                  className="h-7 gap-1 px-2.5 text-[11px] font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40 rounded-lg shrink-0"
                >
                  <History className="size-3 text-primary" />
                  <span>Historial</span>
                </Button>
              </div>
            </div>

            <DialogTitle className="text-base font-heading font-bold text-foreground leading-snug pt-0.5">
              {solicitud.titulo}
            </DialogTitle>

            {solicitud.tipoFallas ? (
              <DialogDescription className="text-xs text-foreground/80 font-medium">
                <strong className="text-muted-foreground font-semibold">Falla:</strong>{" "}
                {solicitud.tipoFallas}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          {/* WorkflowPanel - Action Bar */}
          {onWorkflowAction && (
            <WorkflowPanel
              solicitud={solicitud}
              onActionSelect={onWorkflowAction}
              className="p-3 sm:p-3.5 space-y-2.5 rounded-xl"
            />
          )}

          {/* Compact Info Strip (Activo + Solicitante + Fecha) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl border border-border/70 bg-muted/20 text-xs">
            {/* Activo */}
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <Box className="size-3 text-primary" />
                <span>Activo Fijo</span>
              </div>
              {solicitud.activo ? (
                <p className="truncate font-medium text-foreground text-[11.5px]">
                  <strong className="font-mono text-primary font-bold">{solicitud.activo.codigo}</strong> — {solicitud.activo.nombre}
                </p>
              ) : (
                <p className="text-muted-foreground text-[11px] italic">No asignado</p>
              )}
            </div>

            {/* Solicitante */}
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <User className="size-3 text-primary" />
                <span>Solicitante</span>
              </div>
              <p className="truncate font-medium text-foreground text-[11.5px]">
                {solicitud.solicitante?.nombre || "No especificado"}
              </p>
            </div>

            {/* Fecha */}
            <div className="space-y-0.5 min-w-0 sm:border-l sm:pl-2.5 sm:border-border/50">
              <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <Calendar className="size-3 text-primary" />
                <span>Fecha Solicitud</span>
              </div>
              <p className="font-medium text-foreground text-[11.5px]">
                {solicitud.fechaSolicitud ? formatDate(solicitud.fechaSolicitud) : "—"}
              </p>
            </div>

            {/* Fecha Estimada OT */}
            {solicitud.fechaEstimadaOt && (
              <div className="space-y-0.5 min-w-0 sm:border-l sm:pl-2.5 sm:border-border/50">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Calendar className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Fecha Est. OT</span>
                </div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-[11.5px]">
                  {formatDate(solicitud.fechaEstimadaOt)}
                </p>
              </div>
            )}
          </div>

          {/* Problem Description */}
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1 text-xs">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <FileText className="size-3 text-primary" />
              <span>Descripción del Problema</span>
            </h4>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {solicitud.descripcion || "Sin descripción proporcionada."}
            </p>
          </div>

          {/* Attachments Section - Compact */}
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Paperclip className="size-3 text-primary" />
                <span>Archivos Adjuntos ({adjuntos.length})</span>
              </h4>
              {isLoadingAdjuntos && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>

            {isLoadingAdjuntos ? (
              <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Cargando archivos...</span>
              </div>
            ) : adjuntos.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                Sin archivos adjuntos.
              </p>
            ) : (
              <div className="space-y-2">
                {/* Photo Thumbnails */}
                {imageAdjuntos.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {imageAdjuntos.map((img) => (
                      <div
                        key={img.id}
                        onClick={() =>
                          setSelectedPreviewImage({
                            url: img.url,
                            name: img.nombreArchivo,
                          })
                        }
                        className="group relative aspect-square rounded-lg border border-border bg-muted/30 overflow-hidden cursor-pointer hover:border-primary transition-all shadow-2xs"
                        title={img.nombreArchivo}
                      >
                        <AuthenticatedImage
                          src={img.url}
                          alt={img.nombreArchivo}
                          className="size-full object-cover group-hover:scale-105 transition-transform"
                          fallback={
                            <div className="size-full flex flex-col items-center justify-center p-1 text-center bg-muted">
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-1 rounded bg-black/60 text-white shadow-xs">
                            <Eye className="size-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document List */}
                {docAdjuntos.length > 0 && (
                  <ul className="space-y-1 divide-y divide-border/40">
                    {docAdjuntos.map((adj: SolicitudMantenimientoAdjunto) => (
                      <li
                        key={adj.id}
                        className="flex items-center justify-between gap-2 pt-1 first:pt-0 text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getFileIcon(adj.tipoContenido, adj.nombreArchivo)}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-[11.5px]">
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
                            className="h-6.5 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
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

          {/* Audit Info - Compact Strip */}
          <div className="rounded-lg border border-border/70 bg-muted/10 px-2.5 py-1.5">
            <AuditInfo data={solicitud} compact className="text-[9.5px]" />
          </div>

          <DialogFooter className="pt-2 border-t sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7.5 text-xs font-semibold px-3"
            >
              Cerrar Expediente
            </Button>
          </DialogFooter>

          {/* Preview Lightbox */}
          {selectedPreviewImage && (
            <div
              onClick={() => setSelectedPreviewImage(null)}
              className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
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
                      <ExternalLink className="size-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewImage(null)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
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
        </DialogContent>
      </Dialog>

      {/* Modal Independiente de Trazabilidad */}
      <SolicitudTrazabilidadModal
        solicitud={solicitud}
        open={showTrazabilidad}
        onOpenChange={setShowTrazabilidad}
      />
    </>
  )
}
