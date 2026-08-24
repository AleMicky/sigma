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

export type SolicitudDetallePanelProps = {
  solicitud: SolicitudMantenimiento
  onActionSelect?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  className?: string
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

export function SolicitudDetallePanel({
  solicitud: initialSolicitud,
  onActionSelect,
  className,
}: SolicitudDetallePanelProps) {
  const [copied, setCopied] = useState(false)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    url: string
    name: string
  } | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const solicitudId = initialSolicitud.id

  // Fetch full details and attachments
  const detailQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: Boolean(solicitudId),
  })

  const adjuntosQuery = useQuery({
    ...solicitudQueries.adjuntos(solicitudId, { size: 100 }),
    enabled: Boolean(solicitudId),
  })

  const solicitud = detailQuery.data ?? initialSolicitud

  const adjuntos = useMemo(() => {
    if (adjuntosQuery.data?.content && adjuntosQuery.data.content.length > 0) {
      return adjuntosQuery.data.content
    }
    if (detailQuery.data?.adjuntos && detailQuery.data.adjuntos.length > 0) {
      return detailQuery.data.adjuntos
    }
    return initialSolicitud.adjuntos ?? []
  }, [adjuntosQuery.data, detailQuery.data, initialSolicitud.adjuntos])

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
    if (!solicitud.numero) return
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

  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-y-auto space-y-4 p-4 sm:p-5 bg-background/50",
        className,
      )}
    >
      {/* Header Bar */}
      <div className="space-y-1.5 pb-3 border-b border-border/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Folio Chip */}
          {solicitud.numero ? (
            <div
              onClick={copyNumero}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary border border-primary/25 hover:bg-primary/15 transition-colors cursor-pointer"
              title="Copiar correlativo"
            >
              <span>{solicitud.numero}</span>
              {copied ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 opacity-70" />
              )}
            </div>
          ) : null}

          {/* Estado Badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              estadoStyle,
            )}
          >
            {solicitud.estado}
          </span>

          {/* Prioridad Badge */}
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

          {/* Tipo Mantenimiento Badge */}
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

        <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground tracking-tight pt-0.5">
          {solicitud.titulo}
        </h2>

        {solicitud.tipoFallas ? (
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Falla:</strong>{" "}
            {solicitud.tipoFallas}
          </p>
        ) : null}
      </div>

      {/* Workflow Action Bar */}
      {onActionSelect && (
        <WorkflowPanel
          solicitud={solicitud}
          onActionSelect={onActionSelect}
        />
      )}

      {/* Cards Grid: Activo, Solicitante & Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Activo Info Card */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Box className="size-3.5 text-primary" />
            <span>Activo Fijo Relacionado</span>
          </div>
          {solicitud.activo ? (
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {solicitud.activo.codigo}
              </code>
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                {solicitud.activo.nombre}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin activo asignado
            </p>
          )}
        </div>

        {/* Solicitante Info Card */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5">
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
              <span className="text-muted-foreground">Fecha Solicitud:</span>
              <span className="font-medium text-foreground">
                {formatDate(solicitud.fechaSolicitud)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Problem Description Card */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="size-3.5 text-primary" />
          <span>Descripción Detallada del Problema</span>
        </h4>
        <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {solicitud.descripcion || "Sin descripción proporcionada."}
        </p>
      </div>

      {/* Attachments & Photos Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Paperclip className="size-3.5 text-primary" />
            <span>Archivos y Evidencias Adjuntas ({adjuntos.length})</span>
          </h4>
          {isLoadingAdjuntos && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {isLoadingAdjuntos ? (
          <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Cargando archivos adjuntos...</span>
          </div>
        ) : adjuntos.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-1">
            Esta solicitud no cuenta con archivos adjuntos o evidencias fotográficas.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Photos Grid */}
            {imageAdjuntos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
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
                      <span className="p-1.5 rounded-lg bg-black/60 text-white shadow-xs">
                        <Eye className="size-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Document Files List */}
            {docAdjuntos.length > 0 && (
              <ul className="space-y-1.5 divide-y divide-border/40">
                {docAdjuntos.map((adj) => (
                  <li
                    key={adj.id}
                    className="flex items-center justify-between gap-3 pt-2 first:pt-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getFileIcon(adj.tipoContenido, adj.nombreArchivo)}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate text-xs">
                          {adj.nombreArchivo}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
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
                        className="h-7 px-2.5 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                        title="Descargar archivo"
                      >
                        {downloadingId === adj.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Download className="size-3.5" />
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

      {/* Lifecycle Progress Timeline */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary" />
          <span>Trazabilidad y Flujo de Aprobación</span>
        </h4>

        <div className="space-y-2.5 divide-y divide-border/40 text-xs">
          {/* Solicitud inicial */}
          <div className="flex items-start gap-3 pt-2 first:pt-0">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5 font-bold text-xs">
              1
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Solicitud Registrada</p>
                {solicitud.fechaSolicitud && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(solicitud.fechaSolicitud)}
                  </span>
                )}
              </div>
              {solicitud.solicitante && (
                <p className="text-[11px] text-muted-foreground">
                  Por: {solicitud.solicitante.nombre}
                </p>
              )}
            </div>
          </div>

          {/* Aprobación */}
          <div className="flex items-start gap-3 pt-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                solicitud.fechaAprobacion || solicitud.aprobadoPor
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              2
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">
                  Aprobación y Evaluación
                </p>
                {solicitud.fechaAprobacion && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(solicitud.fechaAprobacion)}
                  </span>
                )}
              </div>
              {solicitud.aprobadoPor && (
                <p className="text-[11px] text-muted-foreground">
                  Aprobador: {solicitud.aprobadoPor.nombre}
                </p>
              )}
              {solicitud.observacionAprobacion && (
                <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-1.5 rounded-md mt-1">
                  "{solicitud.observacionAprobacion}"
                </p>
              )}
            </div>
          </div>

          {/* Asignación y Ejecución */}
          <div className="flex items-start gap-3 pt-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                solicitud.responsable || solicitud.fechaInicioMantenimiento
                  ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              3
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">
                  Asignación y Mantenimiento
                </p>
                {solicitud.fechaInicioMantenimiento && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(solicitud.fechaInicioMantenimiento)}
                  </span>
                )}
              </div>
              {solicitud.responsable && (
                <p className="text-[11px] text-muted-foreground">
                  Responsable: <strong>{solicitud.responsable.nombre}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Validación y Cierre */}
          <div className="flex items-start gap-3 pt-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs",
                solicitud.fechaFinalizacion || solicitud.recibidoPor
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              4
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">
                  Validación y Cierre de Expediente
                </p>
                {solicitud.fechaFinalizacion && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(solicitud.fechaFinalizacion)}
                  </span>
                )}
              </div>
              {solicitud.recibidoPor && (
                <p className="text-[11px] text-muted-foreground">
                  Recibido por: {solicitud.recibidoPor.nombre}
                </p>
              )}
              {solicitud.observacionCierre && (
                <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-1.5 rounded-md mt-1">
                  "{solicitud.observacionCierre}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Info Card */}
      <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
        <AuditInfo data={solicitud} compact className="text-[10px]" />
      </div>

      {/* Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] bg-background rounded-2xl overflow-hidden shadow-2xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-foreground truncate max-w-[320px]">
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
    </div>
  )
}
