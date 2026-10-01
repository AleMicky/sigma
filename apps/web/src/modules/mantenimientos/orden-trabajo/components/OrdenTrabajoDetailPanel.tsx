import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquareQuote,
  Paperclip,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

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
} from "../api/orden-trabajo.service"
import { formatEstadoLabel } from "./OrdenTrabajoMasterPanel"

type OrdenTrabajoDetailPanelProps = {
  solicitud: SolicitudMantenimiento | null
}

export function OrdenTrabajoDetailPanel({
  solicitud,
}: OrdenTrabajoDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("actividades")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [previewImage, setPreviewImage] = useState<{
    open: boolean
    url: string
    title: string
  }>({ open: false, url: "", title: "" })

  // Query OT for the selected solicitud
  const otsQuery = useQuery({
    ...ordenTrabajoQueries.list({
      solicitudMantenimientoId: solicitud?.id,
      size: 1,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: Boolean(solicitud?.id),
  })

  const currentOT = otsQuery.data?.content?.[0] ?? null
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Unified Executive Header */}
      <div className="border-b bg-card/80 px-4 py-3 sm:px-6 shrink-0 space-y-2.5">
        {/* Row 1: Folios, Badges & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* OT Folio */}
            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-lg">
              <Wrench className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-xs font-bold font-mono text-sky-950 dark:text-sky-200">
                {otData?.numero ? otData.numero : "Sin OT"}
              </span>
            </div>

            {/* Solicitud Folio */}
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/50 border px-2 py-0.5 rounded-md">
              Sol: {solicitud.numero}
            </span>

            {/* Status Badges */}
            <Badge
              variant={getEstadoBadgeVariant(solicitud.estado)}
              className="text-[10px] px-2 py-0.5 font-semibold"
            >
              {estadoFormatted}
            </Badge>

            {solicitud.prioridad && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9.5px] px-1.5 py-0.5 font-semibold uppercase tracking-wider",
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
                  "text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wide",
                  progressPercent === 100
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : progressPercent > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {progressPercent === 100
                  ? "Completada"
                  : progressPercent > 0
                    ? `En Ejecución (${progressPercent}%)`
                    : "Pendiente"}
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
                className="h-7.5 gap-1.5 text-xs font-medium bg-background hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="size-3.5 animate-spin text-sky-600" />
                ) : (
                  <Download className="size-3.5 text-sky-600" />
                )}
                <span>PDF</span>
              </Button>
            </div>
          )}
        </div>

        {/* Row 2: Title */}
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            {solicitud.titulo}
          </h2>
        </div>

        {/* Row 3: Cohesive Metadata Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Wrench className="size-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold text-foreground">
              {solicitud.activo?.codigo} - {solicitud.activo?.nombre}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground/70 shrink-0" />
            <span>
              Resp: <strong className="text-foreground">{otData?.responsable?.nombre || "No asignado"}</strong>
            </span>
          </div>

          {otData?.fechaInicio && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span>
                Inicio: <strong className="text-foreground">{otData.fechaInicio.slice(0, 16).replace("T", " ")}</strong>
              </span>
            </div>
          )}

          {totalActividades > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-medium text-foreground">
                Checklist: {completadasCount}/{totalActividades} ({progressPercent}%)
              </span>
              <div className="w-20">
                <Progress
                  value={progressPercent}
                  className="h-1.5"
                  indicatorClassName={progressPercent === 100 ? "bg-emerald-600" : "bg-sky-600"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {otsQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2.5 text-xs text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-sky-600" />
            <span>Cargando reporte...</span>
          </div>
        ) : !otData ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3 border border-border">
              <AlertCircle className="size-7 opacity-60" />
            </div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              Sin Orden de Trabajo
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mt-1 leading-relaxed">
              Esta solicitud aún no cuenta con una orden de trabajo asociada.
            </p>
          </div>
        ) : (
          /* Tabs & Content */
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {/* Segmented Capsule Tabs Navigation */}
            <div className="border-b px-4 py-2 sm:px-6 bg-muted/20 shrink-0">
              <TabsList className="h-8.5 bg-muted/50 p-0.5 rounded-xl gap-1 inline-flex max-w-full overflow-x-auto border border-border/50">
                <TabsTrigger
                  value="actividades"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Actividades</span>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-1.5 py-0 text-[10px] font-bold rounded-full",
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
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Paperclip className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Adjuntos</span>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-1.5 py-0 text-[10px] font-bold rounded-full",
                      adjuntos.length > 0
                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {adjuntos.length}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="diagnostico"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Diagnóstico y Trabajo</span>
                </TabsTrigger>

                <TabsTrigger
                  value="solicitud"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileCheck2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ficha Solicitud</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Actividades */}
            <TabsContent
              value="actividades"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1 overscroll-contain max-w-5xl">
                {actividadesQuery.isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-sky-600" />
                    Cargando actividades...
                  </div>
                ) : actividades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-2xl border-dashed bg-muted/5">
                    <CheckCircle2 className="size-8 opacity-40 mb-2 text-sky-600" />
                    <p className="text-xs font-semibold text-foreground">
                      No hay actividades registradas
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5">
                      Esta orden de trabajo no contiene tareas de mantenimiento asignadas.
                    </p>
                  </div>
                ) : (
                  actividades.map((act) => (
                    <ActivityReportItem
                      key={act.id}
                      actividad={act}
                      onPreviewImage={(url, title) =>
                        setPreviewImage({ open: true, url, title })
                      }
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Adjuntos */}
            <TabsContent
              value="adjuntos"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1 overscroll-contain max-w-5xl">
                {adjuntosQuery.isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-sky-600" />
                    Cargando archivos...
                  </div>
                ) : adjuntos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-2xl border-dashed bg-muted/5">
                    <Paperclip className="size-8 opacity-40 mb-2 text-sky-600" />
                    <p className="text-xs font-semibold text-foreground">
                      Sin archivos adjuntos
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5">
                      No se han adjuntado documentos a esta orden de trabajo.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {adjuntos.map((adj) => (
                      <div
                        key={adj.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:border-sky-300 transition-all text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate text-xs">
                              {adj.nombreArchivo}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {adj.descripcion || "Documento adjunto"}
                            </p>
                          </div>
                        </div>

                        <a
                          href={adj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-1 rounded-md transition-colors shrink-0"
                          title="Ver o descargar"
                        >
                          <span>Ver</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Diagnostico y Trabajos */}
            <TabsContent
              value="diagnostico"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 sm:p-5 space-y-3 overscroll-contain max-w-5xl"
            >
              <div className="rounded-xl border bg-card p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <div className="size-6 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
                    <Wrench className="size-3.5" />
                  </div>
                  <span>Diagnóstico Técnico</span>
                </div>
                <p className="text-xs text-foreground/85 bg-muted/30 p-3 rounded-lg border leading-relaxed whitespace-pre-wrap">
                  {otData.diagnostico || "No se ha registrado diagnóstico técnico aún."}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span>Trabajo Realizado</span>
                </div>
                <p className="text-xs text-foreground/85 bg-muted/30 p-3 rounded-lg border leading-relaxed whitespace-pre-wrap">
                  {otData.trabajoRealizado || "No se ha registrado el resumen de trabajo realizado."}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <MessageSquareQuote className="size-3.5" />
                  </div>
                  <span>Observaciones y Recomendaciones</span>
                </div>
                <p className="text-xs text-foreground/85 bg-muted/30 p-3 rounded-lg border leading-relaxed whitespace-pre-wrap">
                  {otData.observacion || "Sin observaciones adicionales."}
                </p>
              </div>
            </TabsContent>

            {/* TAB 4: Detalle Solicitud */}
            <TabsContent
              value="solicitud"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 sm:p-5 space-y-3 overscroll-contain max-w-5xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="border rounded-xl p-3 bg-card space-y-0.5 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Título de la Solicitud
                  </span>
                  <p className="font-semibold text-foreground">{solicitud.titulo}</p>
                </div>
                <div className="border rounded-xl p-3 bg-card space-y-0.5 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Activo Vinculado
                  </span>
                  <p className="font-semibold text-foreground">
                    {solicitud.activo?.codigo} - {solicitud.activo?.nombre}
                  </p>
                </div>
                <div className="border rounded-xl p-3 bg-card space-y-0.5 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Solicitante
                  </span>
                  <p className="font-semibold text-foreground">
                    {solicitud.solicitante?.nombreCompleto ||
                      solicitud.solicitante?.nombre ||
                      "No especificado"}
                  </p>
                </div>
                <div className="border rounded-xl p-3 bg-card space-y-0.5 shadow-2xs">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Tipo de Mantenimiento
                  </span>
                  <p className="font-semibold text-foreground">
                    {solicitud.tipoMantenimiento?.nombre || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="border rounded-xl p-3 bg-card space-y-1 text-xs shadow-2xs">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Descripción del Requerimiento / Falla
                </span>
                <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap bg-muted/20 p-2.5 rounded-lg border">
                  {solicitud.descripcion || "Sin descripción proporcionada."}
                </p>
              </div>

              {solicitud.tipoFallas && (
                <div className="border rounded-xl p-3 bg-card space-y-0.5 text-xs shadow-2xs">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Tipos de Falla Reportados
                  </span>
                  <p className="font-semibold text-foreground">{solicitud.tipoFallas}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Full Image Preview Modal */}
      <Dialog
        open={previewImage.open}
        onOpenChange={(open) =>
          setPreviewImage((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-3xl p-4 bg-background border shadow-2xl rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-semibold truncate">
              {previewImage.title || "Evidencia Fotográfica"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-xl bg-black/5">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ActivityReportItem({
  actividad,
  onPreviewImage,
}: {
  actividad: OrdenTrabajoActividad
  onPreviewImage: (url: string, title: string) => void
}) {
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
        "rounded-xl border p-3 transition-all text-xs space-y-2 shadow-2xs",
        actividad.realizado
          ? "bg-emerald-50/25 dark:bg-emerald-950/10 border-emerald-500/30 border-l-3 border-l-emerald-500"
          : "bg-card border-border/80 border-l-3 border-l-muted-foreground/40",
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5 shrink-0">
          {actividad.realizado ? (
            <div className="size-4.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          ) : (
            <div className="size-4.5 rounded-full bg-muted text-muted-foreground/60 flex items-center justify-center">
              <Circle className="size-3.5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-semibold text-foreground text-xs leading-snug",
                actividad.realizado && "text-foreground",
              )}
            >
              {actividad.descripcion}
            </span>
            {actividad.actividadMantenimiento && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                {actividad.actividadMantenimiento.codigo}
              </Badge>
            )}
          </div>

          {hasDistinctObservation && (
            <p className="text-[10.5px] text-muted-foreground mt-0.5 italic bg-muted/40 px-2 py-0.5 rounded border border-border/40 inline-block">
              Obs: {actividad.observacion}
            </p>
          )}

          {actividad.fechaRealizacion && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <Clock className="size-3" />
              <span>
                Realizado: {actividad.fechaRealizacion.slice(0, 16).replace("T", " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Evidencias thumbnails strip */}
      {evidencias.length > 0 && (
        <div className="flex items-center gap-2 pt-1.5 border-t border-border/40 overflow-x-auto">
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
            <ImageIcon className="size-3 text-sky-600" />
            Evidencias ({evidencias.length}):
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {evidencias.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() =>
                  onPreviewImage(
                    ev.url,
                    `${actividad.descripcion} - ${ev.nombreArchivo}`,
                  )
                }
                className="block size-10 rounded-lg overflow-hidden border border-border/80 shadow-2xs hover:ring-2 hover:ring-sky-500 transition-all bg-muted shrink-0 cursor-pointer"
                title="Ver imagen"
              >
                <img
                  src={ev.url}
                  alt={ev.nombreArchivo}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
