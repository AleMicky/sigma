import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  MessageSquareQuote,
  Paperclip,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { openOrDownloadProtectedFile } from "@/shared/api"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"
import type { SolicitudMantenimiento } from "@/modules/mantenimientos/solicitud/types/solicitud.type"
import {
  getEstadoBadgeVariant,
  getPrioridadBadgeStyles,
} from "@/modules/mantenimientos/solicitud/lib/solicitud.utils"

import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
import {
  downloadOrdenTrabajoReportePdf,
  type OrdenTrabajoActividad,
  type OrdenTrabajoActividadEvidencia,
} from "../api/orden-trabajo.service"
import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import { formatEstadoLabel } from "./OrdenTrabajoMasterPanel"

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return ""
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function isImageFile(fileName?: string, mimeType?: string | null): boolean {
  if (mimeType) {
    return mimeType.startsWith("image/")
  }
  if (!fileName) return false
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "avif"].includes(ext)
}

function isPdfFile(fileName?: string, mimeType?: string | null): boolean {
  if (mimeType === "application/pdf") return true
  if (!fileName) return false
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return ext === "pdf"
}

type OrdenTrabajoDetailPanelProps = {
  solicitud: SolicitudMantenimiento | null
}

export function OrdenTrabajoDetailPanel({
  solicitud,
}: Readonly<OrdenTrabajoDetailPanelProps>) {
  const [activeTab, setActiveTab] = useState<string>("actividades")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [openingFileId, setOpeningFileId] = useState<string | null>(null)
  const [selectedOTId, setSelectedOTId] = useState<string | null>(null)
  const [previewEvidencia, setPreviewEvidencia] = useState<{
    open: boolean
    url: string
    title: string
    fileName: string
    mimeType?: string | null
    actividadDescripcion?: string
  }>({
    open: false,
    url: "",
    title: "",
    fileName: "",
  })

  // Query all OTs for the selected solicitud (support multiple OTs / history)
  const otsQuery = useQuery({
    ...ordenTrabajoQueries.list({
      solicitudMantenimientoId: solicitud?.id,
      size: 50,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: Boolean(solicitud?.id),
  })

  // Consulta individual de la solicitud para asegurar datos completos (adjuntos, etc.)
  const solicitudDetailQuery = useQuery({
    ...solicitudQueries.detail(solicitud?.id ?? ""),
    enabled: Boolean(solicitud?.id),
  })
  const currentSolicitud = solicitudDetailQuery.data ?? solicitud

  const otsList = otsQuery.data?.content ?? []
  const currentOT =
    otsList.find((ot) => ot.id === selectedOTId) ?? otsList[0] ?? null
  const otId = currentOT?.id ?? ""

  // Query detailed OT info
  const otDetailQuery = useQuery({
    ...ordenTrabajoQueries.detail(otId),
    enabled: Boolean(otId),
  })
  const otData = otDetailQuery.data ?? currentOT

  // Activities & Attachments Queries
  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(otId),
    enabled: Boolean(otId),
  })
  const actividades = actividadesQuery.data?.content ?? []

  const adjuntosQuery = useQuery({
    ...ordenTrabajoQueries.adjuntosList(otId),
    enabled: Boolean(otId),
  })
  const adjuntos = adjuntosQuery.data?.content ?? []

  // Combinación y unificación de adjuntos de la solicitud
  const solicitudAdjuntos = currentSolicitud?.adjuntos ?? []

  // Calculations
  const totalActividades = actividades.length
  const completadasCount = actividades.filter((a) => a.realizado).length
  const progressPercent =
    totalActividades > 0
      ? Math.round((completadasCount / totalActividades) * 100)
      : 0

  async function handleDownloadPdf() {
    if (!otData?.id) return
    try {
      setIsGeneratingPdf(true)
      await downloadOrdenTrabajoReportePdf(otData.id, otData.numero)
      toast.success("Reporte PDF descargado exitosamente")
    } catch {
      toast.error("Error al generar el reporte PDF")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Los archivos se sirven desde el API (`/api/v1/files/...`) y requieren autenticación.
  // Si son PDF o imágenes se abren en pestaña nueva; si son Excel, Word, ZIP, etc. se descargan con su nombre real.
  async function handleOpenFile(
    fileId: string,
    url: string,
    fileName: string,
    mimeType?: string | null,
  ) {
    try {
      setOpeningFileId(fileId)
      const action = await openOrDownloadProtectedFile(url, fileName, mimeType)
      if (action === "downloaded") {
        toast.success(`Descargando: ${fileName}`)
      }
    } catch {
      toast.error("No se pudo cargar o descargar el archivo")
    } finally {
      setOpeningFileId(null)
    }
  }

  // When NO Solicitud is selected
  if (!solicitud) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-3 border border-sky-500/20 shadow-xs">
          <Wrench className="size-7" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          Selecciona una Solicitud
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          Elige una solicitud del listado para consultar su reporte detallado, checklist y evidencias.
        </p>
      </div>
    )
  }

  const estadoFormatted = formatEstadoLabel(solicitud.estado)

  const getProgressBadgeVariant = (percent: number) => {
    if (percent === 100) {
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    }
    if (percent > 0) {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
    }
    return "bg-muted text-muted-foreground"
  }

  const getProgressBadgeLabel = (percent: number) => {
    if (percent === 100) return "Completada"
    if (percent > 0) return `En Ejecución (${percent}%)`
    return "Pendiente"
  }

  const renderActividadesContent = () => {
    if (actividadesQuery.isLoading) {
      return (
        <div className="p-8 text-center text-xs text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2 text-sky-600" />
          Cargando actividades...
        </div>
      )
    }

    if (actividades.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-2xl border-dashed bg-muted/5">
          <CheckCircle2 className="size-8 opacity-40 mb-2 text-sky-600" />
          <p className="text-xs font-semibold text-foreground">
            No hay actividades registradas
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5">
            Esta orden de trabajo no contiene tareas de mantenimiento asignadas.
          </p>
        </div>
      )
    }

    return actividades.map((act) => (
      <ActivityReportItem
        key={act.id}
        actividad={act}
        openingFileId={openingFileId}
        onOpenFile={handleOpenFile}
        onPreviewEvidencia={(ev, actDesc) =>
          setPreviewEvidencia({
            open: true,
            url: ev.url,
            title: ev.nombreArchivo,
            fileName: ev.nombreArchivo,
            mimeType: ev.tipoMime,
            actividadDescripcion: actDesc,
          })
        }
      />
    ))
  }

  const isAdjuntosLoading =
    adjuntosQuery.isLoading ||
    Boolean(solicitudDetailQuery.isLoading && !currentSolicitud)

  const renderAdjuntosContent = () => {
    if (isAdjuntosLoading) {
      return (
        <div className="p-6 text-center text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin mx-auto mb-1.5 text-sky-600" />
          Cargando archivos adjuntos...
        </div>
      )
    }

    if (adjuntos.length === 0 && solicitudAdjuntos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/5">
          <Paperclip className="size-6 opacity-40 mb-1.5 text-sky-600" />
          <p className="text-xs font-semibold text-foreground">
            Sin archivos adjuntos
          </p>
          <p className="text-[10.5px] text-muted-foreground max-w-sm mt-0.5">
            No se han adjuntado documentos a esta orden de trabajo ni a la solicitud.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {/* OT Attachments */}
        {adjuntos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Wrench className="size-3 text-sky-600" />
              <span>Adjuntos de la Orden de Trabajo ({adjuntos.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adjuntos.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-lg border bg-card hover:border-sky-300 transition-all text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      <FileText className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">
                        {adj.nombreArchivo}
                      </p>
                      <p className="text-[9.5px] text-muted-foreground truncate">
                        {adj.descripcion || "Documento técnico"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenFile(adj.id, adj.url, adj.nombreArchivo, adj.tipoMime)
                    }
                    disabled={!adj.url || openingFileId === adj.id}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Ver o descargar"
                  >
                    <span>Ver</span>
                    {openingFileId === adj.id ? (
                      <Loader2 className="size-2.5 animate-spin" />
                    ) : (
                      <ExternalLink className="size-2.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solicitud Initial Attachments */}
        {solicitudAdjuntos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Paperclip className="size-3 text-indigo-600" />
              <span>Adjuntos de la Solicitud Inicial ({solicitudAdjuntos.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {solicitudAdjuntos.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-lg border bg-card hover:border-indigo-300 transition-all text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <FileText className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">
                        {adj.nombreArchivo}
                      </p>
                      <p className="text-[9.5px] text-muted-foreground truncate">
                        {adj.descripcion || "Documento de solicitud"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenFile(adj.id, adj.url, adj.nombreArchivo, adj.tipoContenido)
                    }
                    disabled={!adj.url || openingFileId === adj.id}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Ver o descargar"
                  >
                    <span>Ver</span>
                    {openingFileId === adj.id ? (
                      <Loader2 className="size-2.5 animate-spin" />
                    ) : (
                      <ExternalLink className="size-2.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMainContent = () => {
    if (otsQuery.isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-sky-600" />
          <span>Cargando reporte...</span>
        </div>
      )
    }

    if (!otData) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center bg-muted/5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2.5 border border-border">
            <AlertCircle className="size-6 opacity-60" />
          </div>
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Sin Orden de Trabajo
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mt-0.5 leading-relaxed">
            Esta solicitud aún no cuenta con una orden de trabajo asociada.
          </p>
        </div>
      )
    }

    return (
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* Segmented Capsule Tabs Navigation */}
        <div className="border-b px-3 sm:px-5 py-1.5 bg-muted/15 shrink-0">
          <TabsList className="h-7 bg-muted/60 p-0.5 rounded-lg gap-0.5 inline-flex max-w-full overflow-hidden border border-border/50">
            <TabsTrigger
              value="actividades"
              className={cn(
                "h-6 px-2.5 text-[11px] font-medium rounded-md transition-all gap-1 cursor-pointer select-none",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Actividades</span>
              <span
                className={cn(
                  "inline-flex items-center justify-center px-1.5 py-0 text-[9px] font-bold rounded-full",
                  actividades.length > 0
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {actividades.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="adjuntos"
              className={cn(
                "h-6 px-2.5 text-[11px] font-medium rounded-md transition-all gap-1 cursor-pointer",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              <Paperclip className="size-3 text-sky-600 dark:text-sky-400" />
              <span>Adjuntos</span>
              <span
                className={cn(
                  "inline-flex items-center justify-center px-1.5 py-0 text-[9px] font-bold rounded-full",
                  adjuntos.length + solicitudAdjuntos.length > 0
                    ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {adjuntos.length + solicitudAdjuntos.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="diagnostico"
              className={cn(
                "h-6 px-2.5 text-[11px] font-medium rounded-md transition-all gap-1 cursor-pointer",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              <FileText className="size-3 text-amber-600 dark:text-amber-400" />
              <span>Diagnóstico y Trabajo</span>
            </TabsTrigger>

            <TabsTrigger
              value="solicitud"
              className={cn(
                "h-6 px-2.5 text-[11px] font-medium rounded-md transition-all gap-1 cursor-pointer",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              <FileCheck2 className="size-3 text-indigo-600 dark:text-indigo-400" />
              <span>Ficha Solicitud</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Actividades */}
        <TabsContent
          value="actividades"
          className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3 sm:p-4"
        >
          <div className="min-h-0 flex-1 overflow-y-auto space-y-1.5 pr-1 overscroll-contain max-w-5xl">
            {renderActividadesContent()}
          </div>
        </TabsContent>

        {/* TAB 2: Adjuntos */}
        <TabsContent
          value="adjuntos"
          className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3 sm:p-4"
        >
          <div className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-1 overscroll-contain max-w-5xl">
            {renderAdjuntosContent()}
          </div>
        </TabsContent>

        {/* TAB 3: Diagnostico y Trabajos */}
        <TabsContent
          value="diagnostico"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain max-w-5xl"
        >
          <div className="rounded-lg border bg-card p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
              <div className="size-5 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <Wrench className="size-3" />
              </div>
              <span>Diagnóstico Técnico</span>
            </div>
            <p className="text-xs text-foreground/85 bg-muted/20 p-2.5 rounded-md border leading-relaxed whitespace-pre-wrap">
              {otData.diagnostico || "No se ha registrado diagnóstico técnico aún."}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
              <div className="size-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-3" />
              </div>
              <span>Trabajo Realizado</span>
            </div>
            <p className="text-xs text-foreground/85 bg-muted/20 p-2.5 rounded-md border leading-relaxed whitespace-pre-wrap">
              {otData.trabajoRealizado || "No se ha registrado el resumen de trabajo realizado."}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
              <div className="size-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <MessageSquareQuote className="size-3" />
              </div>
              <span>Observaciones y Recomendaciones</span>
            </div>
            <p className="text-xs text-foreground/85 bg-muted/20 p-2.5 rounded-md border leading-relaxed whitespace-pre-wrap">
              {otData.observacion || "Sin observaciones adicionales."}
            </p>
          </div>
        </TabsContent>

        {/* TAB 4: Detalle Solicitud */}
        <TabsContent
          value="solicitud"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain max-w-5xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="border rounded-lg p-2.5 bg-card space-y-0.5 shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                Título de la Solicitud
              </span>
              <p className="font-semibold text-foreground">{solicitud.titulo}</p>
            </div>
            <div className="border rounded-lg p-2.5 bg-card space-y-0.5 shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                Activo Vinculado
              </span>
              <p className="font-semibold text-foreground">
                {solicitud.activo?.codigo} - {solicitud.activo?.nombre}
              </p>
            </div>
            <div className="border rounded-lg p-2.5 bg-card space-y-0.5 shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                Solicitante
              </span>
              <p className="font-semibold text-foreground">
                {solicitud.solicitante?.nombreCompleto ||
                  solicitud.solicitante?.nombre ||
                  "No especificado"}
              </p>
            </div>
            <div className="border rounded-lg p-2.5 bg-card space-y-0.5 shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                Tipo de Mantenimiento
              </span>
              <p className="font-semibold text-foreground">
                {solicitud.tipoMantenimiento?.nombre || "No especificado"}
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-2.5 bg-card space-y-1 text-xs shadow-2xs">
            <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
              Descripción del Requerimiento / Falla
            </span>
            <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap bg-muted/20 p-2 rounded-md border">
              {solicitud.descripcion || "Sin descripción proporcionada."}
            </p>
          </div>

          {solicitud.tipoFallas && (Array.isArray(solicitud.tipoFallas) ? solicitud.tipoFallas.length > 0 : Boolean(solicitud.tipoFallas)) && (
            <div className="border rounded-lg p-2.5 bg-card space-y-1 text-xs shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                Tipos de Falla Reportados
              </span>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {Array.isArray(solicitud.tipoFallas) ? (
                  solicitud.tipoFallas.map((falla) => (
                    <span
                      key={falla}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground"
                    >
                      {falla}
                    </span>
                  ))
                ) : (
                  <p className="font-semibold text-foreground">{solicitud.tipoFallas}</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Unified Executive Compact Header */}
      <div className="border-b bg-card/75 px-4 py-2.5 sm:px-5 shrink-0 space-y-2">
        {/* Row 1: Folios, Badges & Action Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* OT Folio */}
            <div className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-md">
              <Wrench className="size-3 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-[11px] font-bold font-mono text-sky-950 dark:text-sky-200">
                {otData?.numero ? otData.numero : "Sin OT"}
              </span>
            </div>

            {/* Solicitud Folio */}
            <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 border px-1.5 py-0.5 rounded-md">
              Sol: {solicitud.numero}
            </span>

            {/* Status Badges */}
            <Badge
              variant={getEstadoBadgeVariant(solicitud.estado)}
              className="text-[9.5px] px-1.5 py-0.5 font-semibold"
            >
              {estadoFormatted}
            </Badge>

            {solicitud.prioridad && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wider",
                  getPrioridadBadgeStyles(solicitud.prioridad.nivel),
                )}
              >
                {solicitud.prioridad.nombre}
              </Badge>
            )}

            {otData && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide",
                  getProgressBadgeVariant(progressPercent),
                )}
              >
                {getProgressBadgeLabel(progressPercent)}
              </Badge>
            )}
          </div>

          {/* Action buttons on the right */}
          {otData && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="h-7 px-2.5 gap-1 text-[11px] font-medium bg-background hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="size-3 animate-spin text-sky-600" />
                ) : (
                  <Download className="size-3 text-sky-600" />
                )}
                <span>Reporte PDF</span>
              </Button>
            </div>
          )}
        </div>

        {/* Row 2: Title and Checklist Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {solicitud.titulo}
          </h2>

          {totalActividades > 0 && (
            <div className="flex items-center gap-2 shrink-0 bg-muted/40 border border-border/50 px-2 py-0.5 rounded-md">
              <span className="text-[10.5px] font-medium text-foreground">
                Checklist: <strong className="font-semibold">{completadasCount}/{totalActividades}</strong> ({progressPercent}%)
              </span>
              <div className="w-16">
                <Progress
                  value={progressPercent}
                  className="h-1.5"
                  indicatorClassName={progressPercent === 100 ? "bg-emerald-600" : "bg-sky-600"}
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Cohesive Metadata Strip */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Wrench className="size-3 text-sky-600 shrink-0" />
            <span className="font-semibold text-foreground">
              {solicitud.activo?.codigo} - {solicitud.activo?.nombre}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <User className="size-3 text-muted-foreground/70 shrink-0" />
            <span>
              Resp: <strong className="text-foreground">{otData?.responsable?.nombre || "No asignado"}</strong>
            </span>
          </div>

          {otData?.fechaInicio && (
            <div className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
              <span>
                Inicio: <strong className="text-foreground">{otData.fechaInicio.slice(0, 16).replace("T", " ")}</strong>
              </span>
            </div>
          )}

          {/* Multiple OTs History Selector (if > 1) */}
          {otsList.length > 1 && (
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layers className="size-2.5 text-sky-600" />
                OTs:
              </span>
              <div className="flex items-center gap-1 flex-nowrap">
                {otsList.map((ot, idx) => {
                  const isSelected = ot.id === otId
                  return (
                    <button
                      key={ot.id}
                      type="button"
                      onClick={() => setSelectedOTId(ot.id)}
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer shadow-2xs",
                        isSelected
                          ? "bg-sky-600 text-white"
                          : "bg-muted/70 text-foreground/80 hover:bg-muted border border-border/60",
                      )}
                    >
                      <span>{ot.numero}</span>
                      {idx === 0 && (
                        <span
                          className={cn(
                            "text-[8px] px-1 py-0 rounded font-sans font-medium",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                          )}
                        >
                          Actual
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {renderMainContent()}
      </div>

      {/* Modal de Previsualización de Evidencia (Fotografías) */}
      <Dialog
        open={previewEvidencia.open}
        onOpenChange={(open) =>
          setPreviewEvidencia((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-4xl p-3 sm:p-4 bg-background border shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="pb-2 border-b flex flex-row items-center justify-between gap-2.5 space-y-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 uppercase tracking-wide">
                  Fotografía
                </span>
                <DialogTitle className="text-xs sm:text-sm font-bold truncate text-foreground">
                  {previewEvidencia.fileName || previewEvidencia.title || "Evidencia"}
                </DialogTitle>
              </div>
              {previewEvidencia.actividadDescripcion && (
                <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                  Tarea: {previewEvidencia.actividadDescripcion}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleOpenFile(
                    previewEvidencia.url,
                    previewEvidencia.url,
                    previewEvidencia.fileName || "evidencia",
                    previewEvidencia.mimeType,
                  )
                }
                className="h-7 text-[11px] gap-1 cursor-pointer"
              >
                <ExternalLink className="size-3" />
                <span>Abrir imagen original</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center min-h-[220px] max-h-[70vh] overflow-hidden rounded-xl bg-muted/20 p-2 sm:p-3">
            <AuthenticatedImage
              src={previewEvidencia.url}
              alt={previewEvidencia.fileName}
              className="max-h-[66vh] w-auto max-w-full object-contain rounded-lg shadow-xs"
              fallbackClassName="h-64 w-full rounded-lg"
              fallback={
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center">
                  <ImageIcon className="size-8 opacity-30 text-sky-600" />
                  <p className="text-xs font-semibold text-foreground">
                    No se pudo cargar la imagen
                  </p>
                  <p className="text-[10.5px] text-muted-foreground max-w-xs">
                    Puedes intentar abrirla directamente en una pestaña nueva.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleOpenFile(
                        previewEvidencia.url,
                        previewEvidencia.url,
                        previewEvidencia.fileName,
                        previewEvidencia.mimeType,
                      )
                    }
                    className="mt-1.5 text-xs gap-1"
                  >
                    <ExternalLink className="size-3" />
                    <span>Abrir imagen original</span>
                  </Button>
                </div>
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ActivityReportItemProps = {
  actividad: OrdenTrabajoActividad
  openingFileId: string | null
  onOpenFile: (
    fileId: string,
    url: string,
    fileName: string,
    mimeType?: string | null,
  ) => void
  onPreviewEvidencia: (
    evidencia: OrdenTrabajoActividadEvidencia,
    actividadDesc: string,
  ) => void
}

function ActivityReportItem({
  actividad,
  openingFileId,
  onOpenFile,
  onPreviewEvidencia,
}: Readonly<ActivityReportItemProps>) {
  const evidenciasQuery = useQuery(
    ordenTrabajoQueries.evidenciasList(actividad.id, { size: 50 }),
  )
  const evidencias = evidenciasQuery.data?.content ?? []

  const hasDistinctObservation =
    Boolean(actividad.observacion) &&
    actividad.observacion?.trim().toLowerCase() !==
      actividad.descripcion?.trim().toLowerCase()

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 sm:p-3 transition-all text-xs space-y-2 shadow-2xs",
        actividad.realizado
          ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/25 border-l-3 border-l-emerald-500"
          : "bg-card border-border/70 border-l-3 border-l-muted-foreground/30",
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        <div className="mt-0.5 shrink-0">
          {actividad.realizado ? (
            <div className="size-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-3" />
            </div>
          ) : (
            <div className="size-4 rounded-full bg-muted text-muted-foreground/50 flex items-center justify-center">
              <Circle className="size-3" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "font-semibold text-foreground text-xs leading-snug",
                actividad.realizado && "text-foreground",
              )}
            >
              {actividad.descripcion}
            </span>
            {actividad.actividadMantenimiento && (
              <Badge variant="outline" className="text-[8.5px] px-1 py-0 font-mono">
                {actividad.actividadMantenimiento.codigo}
              </Badge>
            )}
            {evidencias.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-500/15 border border-sky-500/25 px-1.5 py-0.2 rounded">
                <Camera className="size-2.5" /> {evidencias.length}{" "}
                {evidencias.length === 1 ? "evidencia" : "evidencias"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/50 bg-muted/40 px-1.5 py-0.2 rounded">
                <Camera className="size-2.5 opacity-40" /> Sin evidencias
              </span>
            )}
          </div>

          {hasDistinctObservation && (
            <p className="text-[10px] text-muted-foreground mt-1 italic bg-muted/40 px-1.5 py-0.5 rounded border border-border/40 inline-block">
              Obs: {actividad.observacion}
            </p>
          )}

          {actividad.fechaRealizacion && (
            <div className="flex items-center gap-1 text-[9.5px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <Clock className="size-2.5" />
              <span>
                Realizado: {actividad.fechaRealizacion.slice(0, 16).replace("T", " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Galería / Listado de Evidencias */}
      {evidencias.length > 0 && (
        <div className="pt-1.5 border-t border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Camera className="size-2.5 text-sky-600 dark:text-sky-400" />
              <span>Evidencias ({evidencias.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {evidencias.map((ev) => (
              <EvidenciaCard
                key={ev.id}
                evidencia={ev}
                actividadDescripcion={actividad.descripcion}
                isOpening={openingFileId === ev.id}
                onOpenFile={onOpenFile}
                onPreviewEvidencia={onPreviewEvidencia}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type EvidenciaCardProps = {
  evidencia: OrdenTrabajoActividadEvidencia
  actividadDescripcion: string
  isOpening: boolean
  onOpenFile: (
    fileId: string,
    url: string,
    fileName: string,
    mimeType?: string | null,
  ) => void
  onPreviewEvidencia: (
    evidencia: OrdenTrabajoActividadEvidencia,
    actividadDesc: string,
  ) => void
}

function EvidenciaCard({
  evidencia,
  actividadDescripcion,
  isOpening,
  onOpenFile,
  onPreviewEvidencia,
}: Readonly<EvidenciaCardProps>) {
  const isImg = isImageFile(evidencia.nombreArchivo, evidencia.tipoMime)
  const isPdf = isPdfFile(evidencia.nombreArchivo, evidencia.tipoMime)

  const handleAction = () => {
    if (isImg) {
      onPreviewEvidencia(evidencia, actividadDescripcion)
    } else {
      onOpenFile(
        evidencia.id,
        evidencia.url,
        evidencia.nombreArchivo,
        evidencia.tipoMime,
      )
    }
  }

  const getSubtext = () => {
    if (evidencia.tamanio) return formatFileSize(evidencia.tamanio)
    if (isImg) return "Fotografía"
    if (isPdf) return "Documento PDF"
    return "Archivo adjunto"
  }

  return (
    <div className="group flex items-center gap-2 p-1.5 rounded-lg border bg-card/70 hover:bg-card hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-2xs transition-all text-xs">
      {/* Thumbnail / Icon preview button */}
      <button
        type="button"
        onClick={handleAction}
        className="relative size-9 shrink-0 rounded-md overflow-hidden border border-border/70 bg-muted hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center shadow-2xs"
        title={isImg ? "Ver fotografía ampliada" : isPdf ? "Abrir documento PDF" : "Descargar archivo"}
      >
        {isImg ? (
          <AuthenticatedImage
            src={evidencia.url}
            alt={evidencia.nombreArchivo}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback={
              <div className="flex items-center justify-center size-full bg-sky-500/10 text-sky-600">
                <ImageIcon className="size-3.5" />
              </div>
            }
          />
        ) : (
          <div
            className={cn(
              "size-full flex flex-col items-center justify-center p-0.5 font-semibold",
              isPdf
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            )}
          >
            <FileText className="size-3.5" />
            <span className="text-[7.5px] font-mono uppercase mt-0.5 font-bold">
              {isPdf ? "PDF" : "DOC"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Eye className="size-3" />
        </div>
      </button>

      {/* Detalle y Nombre de Archivo */}
      <div className="min-w-0 flex-1 leading-tight">
        <button
          type="button"
          onClick={handleAction}
          className="font-medium text-[11px] text-foreground truncate block w-full text-left hover:text-sky-600 transition-colors cursor-pointer"
          title={evidencia.nombreArchivo}
        >
          {evidencia.nombreArchivo}
        </button>
        <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
          {getSubtext()}
        </p>
      </div>

      {/* Acciones directas */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() =>
            onOpenFile(
              evidencia.id,
              evidencia.url,
              evidencia.nombreArchivo,
              evidencia.tipoMime,
            )
          }
          disabled={!evidencia.url || isOpening}
          className="size-6 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer disabled:opacity-50"
          title={isPdf || isImg ? "Abrir en nueva pestaña" : "Descargar"}
        >
          {isOpening ? (
            <Loader2 className="size-3 animate-spin text-sky-600" />
          ) : (
            <ExternalLink className="size-3" />
          )}
        </button>
      </div>
    </div>
  )
}
