import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Loader2,
  Maximize2,
  MessageSquare,
  Paperclip,
  UserCheck,
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
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import { WorkflowPanel } from "@/modules/workflow"
import { solicitudQueries } from "../../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  SolicitudMantenimientoAdjunto,
  WorkflowAction,
  WorkflowField,
} from "../../api/solicitud.service"
import {
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../../lib/solicitud.utils"

type SolicitudQuickViewSheetProps = {
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
    return <ImageIcon className="size-4 text-sky-500 shrink-0" />
  }
  return <FileText className="size-4 text-muted-foreground shrink-0" />
}

export function SolicitudQuickViewSheet({
  solicitud: initialSolicitud,
  open,
  onOpenChange,
  onWorkflowAction,
}: SolicitudQuickViewSheetProps) {
  const [copied, setCopied] = useState(false)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    url: string
    name: string
  } | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const solicitudId = initialSolicitud?.id ?? ""

  // Detalle completo y adjuntos
  const detailQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  const adjuntosQuery = useQuery({
    ...solicitudQueries.adjuntos(solicitudId, { size: 100 }),
    enabled: open && Boolean(solicitudId),
  })

  const solicitud = detailQuery.data ?? initialSolicitud

  const actionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitud?.processInstanceId),
    enabled: open && Boolean(solicitud?.processInstanceId && onWorkflowAction),
  })

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

  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl flex flex-col p-0 gap-0 border-l bg-background shadow-2xl overflow-hidden"
      >
        {/* ======================= HERO COMPACT HEADER ======================= */}
        <SheetHeader className="p-5 pb-4 border-b bg-muted/10 shrink-0 space-y-3">
          {/* Top badges & Folio */}
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex flex-wrap items-center gap-1.5">
              {solicitud.numero && (
                <button
                  type="button"
                  onClick={copyNumero}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all cursor-pointer shadow-2xs"
                  title="Copiar folio"
                >
                  <span>{solicitud.numero}</span>
                  {copied ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3 opacity-60" />
                  )}
                </button>
              )}

              {solicitud.prioridad && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold shrink-0 shadow-2xs",
                    prioridadStyle,
                  )}
                >
                  {solicitud.prioridad.nombre}
                </span>
              )}

              {solicitud.tipoMantenimiento && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 shadow-2xs",
                    getTipoMantenimientoBadgeClass(
                      solicitud.tipoMantenimiento.nombre,
                      false,
                    ),
                  )}
                >
                  <Wrench className="size-3" />
                  <span>{solicitud.tipoMantenimiento.nombre}</span>
                </span>
              )}
            </div>

            {solicitud.fechaSolicitud && (
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                {formatDate(solicitud.fechaSolicitud)}
              </span>
            )}
          </div>

          {/* Title & Fault Info */}
          <div className="space-y-1.5 text-left">
            <SheetTitle className="text-lg sm:text-xl font-heading font-bold text-foreground leading-snug tracking-tight">
              {solicitud.titulo}
            </SheetTitle>
            {solicitud.tipoFallas ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                <span>Falla: <strong>{solicitud.tipoFallas}</strong></span>
              </div>
            ) : null}
          </div>
        </SheetHeader>

        {/* ======================= SCROLLABLE CLEAN BODY ======================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Action Bar (Si hay acciones de workflow) */}
          {onWorkflowAction && (
            <div className="rounded-xl overflow-hidden border border-border/80 shadow-2xs">
              <WorkflowPanel
                processInstanceId={solicitud.processInstanceId}
                status={solicitud.estado}
                taskName={actionsQuery.data?.taskName}
                actions={actionsQuery.data?.actions}
                fields={actionsQuery.data?.fields}
                isLoading={actionsQuery.isLoading}
                responsable={solicitud.responsable}
                observacion={
                  solicitud.observacionValidacion ||
                  solicitud.observacionAprobacion ||
                  solicitud.observacionCierre
                }
                onActionSelect={(action, tName, flds) =>
                  onWorkflowAction(solicitud, action, tName, flds)
                }
              />
            </div>
          )}

          {/* 1. INFORMACIÓN PRINCIPAL (Diseño limpio en lista de filas) */}
          <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Box className="size-3.5 text-primary" />
                <span>Información General</span>
              </span>
            </div>

            <div className="divide-y divide-border/40 text-xs">
              {/* Activo */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-muted-foreground font-medium shrink-0">Activo Fijo:</span>
                {solicitud.activo ? (
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {solicitud.activo.codigo}
                    </span>
                    <span className="font-semibold text-foreground">
                      {solicitud.activo.nombre}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No asignado</span>
                )}
              </div>

              {/* Solicitante */}
              <div className="p-3.5 flex items-center justify-between gap-2">
                <span className="text-muted-foreground font-medium">Solicitante:</span>
                <span className="font-semibold text-foreground text-right">
                  {solicitud.solicitante?.nombre || "No especificado"}
                </span>
              </div>

              {/* Fecha y Hora */}
              {solicitud.fechaSolicitud && (
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium">Fecha y Hora:</span>
                  <span className="font-medium text-foreground text-right">
                    {formatDateTime(solicitud.fechaSolicitud)}
                  </span>
                </div>
              )}

              {/* Fecha estimada OT */}
              {solicitud.fechaEstimadaOt && (
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Fecha Estimada OT:</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-300 text-right">
                    {formatDate(solicitud.fechaEstimadaOt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. DESCRIPCIÓN DETALLADA */}
          <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                <span>Descripción</span>
              </span>
            </div>
            <div className="p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-normal">
              {solicitud.descripcion || "Sin descripción proporcionada."}
            </div>
          </div>

          {/* 3. INTERVINIENTES EN EL FLUJO (Si existen) */}
          {(solicitud.aprobadoPor ||
            solicitud.responsable ||
            solicitud.supervisor ||
            solicitud.recibidoPor) && (
              <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-primary" />
                    <span>Intervinientes en el Flujo</span>
                  </span>
                </div>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {solicitud.aprobadoPor && (
                    <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Aprobador</p>
                      <p className="font-semibold text-xs text-foreground truncate mt-0.5">
                        {solicitud.aprobadoPor.nombre}
                      </p>
                      {solicitud.fechaAprobacion && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(solicitud.fechaAprobacion)}
                        </p>
                      )}
                    </div>
                  )}

                  {solicitud.responsable && (
                    <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">Responsable OT</p>
                      <p className="font-semibold text-xs text-foreground truncate mt-0.5">
                        {solicitud.responsable.nombre}
                      </p>
                      {solicitud.fechaAsignacion && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(solicitud.fechaAsignacion)}
                        </p>
                      )}
                    </div>
                  )}

                  {solicitud.supervisor && (
                    <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Supervisor</p>
                      <p className="font-semibold text-xs text-foreground truncate mt-0.5">
                        {solicitud.supervisor.nombre}
                      </p>
                    </div>
                  )}

                  {solicitud.recibidoPor && (
                    <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Recibido Por</p>
                      <p className="font-semibold text-xs text-foreground truncate mt-0.5">
                        {solicitud.recibidoPor.nombre}
                      </p>
                      {solicitud.fechaFinalizacion && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(solicitud.fechaFinalizacion)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 4. OBSERVACIONES REGISTRADAS */}
          {(solicitud.observacionAprobacion ||
            solicitud.observacionValidacion ||
            solicitud.observacionCierre) && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" />
                    <span>Observaciones del Ciclo</span>
                  </span>
                </div>
                <div className="p-3.5 space-y-2 text-xs divide-y divide-amber-500/15">
                  {solicitud.observacionAprobacion && (
                    <div className="pt-1.5 first:pt-0">
                      <span className="font-semibold text-foreground/80">Aprobación:</span>{" "}
                      <span className="italic text-foreground">"{solicitud.observacionAprobacion}"</span>
                    </div>
                  )}
                  {solicitud.observacionValidacion && (
                    <div className="pt-1.5 first:pt-0">
                      <span className="font-semibold text-foreground/80">Supervisión:</span>{" "}
                      <span className="italic text-foreground">"{solicitud.observacionValidacion}"</span>
                    </div>
                  )}
                  {solicitud.observacionCierre && (
                    <div className="pt-1.5 first:pt-0">
                      <span className="font-semibold text-foreground/80">Cierre:</span>{" "}
                      <span className="italic text-foreground">"{solicitud.observacionCierre}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 5. ARCHIVOS ADJUNTOS */}
          <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-primary" />
                <span>Archivos Adjuntos ({adjuntos.length})</span>
              </span>
              {isLoadingAdjuntos && (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="p-4">
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
                          className="group relative aspect-square rounded-xl border border-border bg-muted/20 overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all"
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
                              <Maximize2 className="size-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document List */}
                  {docAdjuntos.length > 0 && (
                    <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
                      {docAdjuntos.map((adj: SolicitudMantenimientoAdjunto) => (
                        <div
                          key={adj.id}
                          className="flex items-center justify-between gap-3 p-2.5 hover:bg-muted/30 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getFileIcon(adj.tipoContenido, adj.nombreArchivo)}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate text-xs">
                                {adj.nombreArchivo}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatFileSize(adj.size)}
                                {adj.descripcion ? ` • ${adj.descripcion}` : ""}
                              </p>
                            </div>
                          </div>

                          {adj.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadFile(adj)}
                              disabled={downloadingId === adj.id}
                              className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                              title="Descargar archivo"
                            >
                              {downloadingId === adj.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Download className="size-3.5" />
                              )}
                              <span>Descargar</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= AUDIT FOOTER ======================= */}
        <div className="p-3.5 border-t bg-muted/20 shrink-0">
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
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
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
