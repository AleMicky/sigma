import { useState, type MouseEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  Flame,
  Hash,
  History,
  Image as ImageIcon,
  Loader2,
  Package,
  Paperclip,
  Pencil,
  ShieldCheck,
  Tag,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"
import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { solicitudQueries } from "../api/solicitud.queries"
import { downloadSolicitudReportePdf } from "../api/solicitud.service"
import type { SolicitudAdjunto, SolicitudMantenimiento } from "../types/solicitud.type"

export type SolicitudDetailModalProps = {
  solicitud?: SolicitudMantenimiento | null
  solicitudId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (solicitud: SolicitudMantenimiento) => void
  onTraceability?: (solicitud: SolicitudMantenimiento) => void
  onControlActivo?: (solicitud: SolicitudMantenimiento) => void
  onGestionarOrdenTrabajo?: (solicitud: SolicitudMantenimiento) => void
}

function getInitials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SolicitudDetailModal({
  solicitud,
  solicitudId,
  open,
  onOpenChange,
  onEdit,
  onTraceability,
  onControlActivo,
  onGestionarOrdenTrabajo,
}: SolicitudDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("general")
  const [copied, setCopied] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const targetId = solicitud?.id || solicitudId || ""

  const detailQuery = useQuery({
    ...solicitudQueries.detail(targetId),
    enabled: Boolean(targetId && open),
  })

  const currentSolicitud = detailQuery.data ?? solicitud ?? null
  const isLoading = Boolean(targetId && !currentSolicitud && detailQuery.isLoading)

  const estadoNorm = (currentSolicitud?.estado ?? "").trim().toLowerCase()
  const isBorrador = estadoNorm === "borrador"
  const prioridadNivel = currentSolicitud?.prioridad?.nivel ?? 1
  const isCritical = prioridadNivel >= 4

  const solicitanteNombre =
    currentSolicitud?.solicitante?.nombreCompleto ||
    currentSolicitud?.solicitante?.nombre ||
    ""

  const responsableNombre =
    currentSolicitud?.responsable?.nombreCompleto ||
    currentSolicitud?.responsable?.nombre ||
    ""

  const supervisorNombre =
    currentSolicitud?.supervisor?.nombreCompleto ||
    currentSolicitud?.supervisor?.nombre ||
    ""

  const aprobadorNombre =
    currentSolicitud?.aprobador?.nombreCompleto ||
    currentSolicitud?.aprobador?.nombre ||
    ""

  const adjuntos = currentSolicitud?.adjuntos ?? []

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)
    } catch {
      return null
    }
  }

  const copyFolio = (e: MouseEvent) => {
    e.stopPropagation()
    if (!currentSolicitud?.numero) return
    navigator.clipboard.writeText(currentSolicitud.numero)
    setCopied(true)
    toast.success("Folio copiado", { duration: 1200 })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async (e?: MouseEvent) => {
    e?.stopPropagation()
    if (!currentSolicitud?.id) return
    try {
      setIsGeneratingPdf(true)
      await downloadSolicitudReportePdf(currentSolicitud.id, currentSolicitud.numero)
      toast.success("Reporte generado correctamente")
    } catch (error) {
      console.error("Error al generar reporte PDF:", error)
      toast.error("Error al generar el reporte PDF")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Cargando detalles de la solicitud...</p>
          </div>
        ) : !currentSolicitud ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-1.5">
            <p className="text-sm font-semibold">No se pudo cargar la información</p>
            <p className="text-xs text-muted-foreground">
              La solicitud no está disponible o no existe.
            </p>
          </div>
        ) : (
          <>
            {/* Header Limpio y Estructurado */}
            <DialogHeader className="px-5 sm:px-6 pt-4 pb-3 border-b shrink-0 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Badges de Identificación */}
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <div
                    onClick={copyFolio}
                    className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border shadow-2xs hover:border-primary/50 hover:bg-muted/30 cursor-pointer active:scale-95 transition-all"
                    title="Haga clic para copiar folio"
                  >
                    <Hash className="size-3 text-muted-foreground" />
                    <span>{currentSolicitud.numero}</span>
                    {copied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3 opacity-40 hover:opacity-100" />
                    )}
                  </div>

                  {currentSolicitud.estado && (
                    <WorkflowStatusBadge
                      status={currentSolicitud.estado}
                      size="sm"
                    />
                  )}

                  {currentSolicitud.prioridad?.nombre && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border shadow-2xs",
                        isCritical
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          : "bg-background text-muted-foreground border-border/80",
                      )}
                    >
                      {isCritical ? (
                        <Flame className="size-3 text-rose-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-3 opacity-60 shrink-0" />
                      )}
                      <span>{currentSolicitud.prioridad.nombre}</span>
                    </span>
                  )}

                  {currentSolicitud.tipoMantenimiento?.nombre && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs font-medium text-foreground/85 border border-border shadow-2xs">
                      <Tag className="size-3 opacity-60 shrink-0" />
                      <span>{currentSolicitud.tipoMantenimiento.nombre}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isGeneratingPdf}
                    onClick={handleDownloadPdf}
                    className="h-7 text-xs gap-1.5 px-2.5 font-medium cursor-pointer shadow-2xs hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30"
                    title="Descargar Reporte PDF"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="size-3 animate-spin text-rose-500" />
                    ) : (
                      <FileText className="size-3 text-rose-500" />
                    )}
                    <span>PDF</span>
                  </Button>

                  {isBorrador && onEdit && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        onOpenChange(false)
                        onEdit(currentSolicitud)
                      }}
                      className="h-7 text-xs gap-1.5 px-3 font-semibold cursor-pointer shadow-2xs"
                    >
                      <Pencil className="size-3" />
                      <span>Editar</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Título de la Solicitud */}
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight break-words">
                {currentSolicitud.titulo}
              </DialogTitle>
            </DialogHeader>

            {/* Pestañas de Navegación */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <div className="px-5 sm:px-6 pt-2 pb-1.5 border-b shrink-0 bg-background">
                <TabsList className="h-8 bg-muted/60 p-0.5 rounded-lg">
                  <TabsTrigger
                    value="general"
                    className="text-xs px-3.5 h-7 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs font-medium"
                  >
                    <FileText className="size-3.5 text-primary" />
                    <span>Detalles</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="adjuntos"
                    className="text-xs px-3.5 h-7 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs font-medium"
                  >
                    <Paperclip className="size-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Adjuntos</span>
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0 text-[10px] font-bold text-muted-foreground border border-border">
                      {adjuntos.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* PESTAÑA 1: DETALLES GENERALES (Diseño limpio, sin cajas pesadas) */}
              <TabsContent
                value="general"
                className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 m-0 text-xs"
              >
                {/* 1. SECCIÓN PRINCIPAL: SOLICITANTE, TÉCNICO Y ACTIVO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Solicitante */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 mt-0.5">
                      {solicitanteNombre ? getInitials(solicitanteNombre) : <User className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Solicitante
                      </span>
                      <p className="text-sm font-bold text-foreground leading-snug break-words">
                        {solicitanteNombre || "No especificado"}
                      </p>
                      {currentSolicitud.solicitante?.cargo && (
                        <p className="text-[11px] text-muted-foreground font-medium break-words">
                          {currentSolicitud.solicitante.cargo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Técnico Responsable */}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full font-bold text-xs border mt-0.5",
                      responsableNombre
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {responsableNombre ? getInitials(responsableNombre) : <UserCheck className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Técnico Responsable
                      </span>
                      <p className={cn(
                        "text-sm font-bold leading-snug break-words",
                        responsableNombre ? "text-foreground" : "text-muted-foreground font-normal italic"
                      )}>
                        {responsableNombre || "Sin asignar"}
                      </p>
                      {currentSolicitud.responsable?.cargo && (
                        <p className="text-[11px] text-muted-foreground font-medium break-words">
                          {currentSolicitud.responsable.cargo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activo / Equipo Vinculado */}
                  <div className="sm:col-span-2 flex items-start gap-3 pt-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground border border-border/80 mt-0.5">
                      <Package className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Activo / Equipo Vinculado
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {currentSolicitud.activo?.codigo && (
                          <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground border border-border">
                            {currentSolicitud.activo.codigo}
                          </span>
                        )}
                        <span className="text-sm font-bold text-foreground break-words">
                          {currentSolicitud.activo?.nombre || "Sin activo vinculado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* 2. METADATOS (Fecha Solicitud, Diagnóstico/Falla, Supervisor, Aprobador) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {/* Fecha de Solicitud */}
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span>Fecha de Solicitud</span>
                    </span>
                    <p className="text-xs font-semibold text-foreground pl-4.5">
                      {formatDate(currentSolicitud.fechaSolicitud) || "—"}
                    </p>
                  </div>

                  {/* Tipo de Falla / Diagnóstico */}
                  {currentSolicitud.tipoFallas ? (
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="size-3 text-amber-500" />
                        <span>Tipo de Falla / Diagnóstico</span>
                      </span>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 break-words pl-4.5">
                        {currentSolicitud.tipoFallas}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="size-3 text-muted-foreground" />
                        <span>Tipo de Falla</span>
                      </span>
                      <p className="text-xs text-muted-foreground font-normal pl-4.5">
                        No especificada
                      </p>
                    </div>
                  )}

                  {/* Supervisor */}
                  {supervisorNombre && (
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-3 text-muted-foreground" />
                        <span>Supervisor</span>
                      </span>
                      <p className="text-xs font-semibold text-foreground break-words pl-4.5">
                        {supervisorNombre}
                      </p>
                    </div>
                  )}

                  {/* Aprobador */}
                  {aprobadorNombre && (
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span>Aprobado Por</span>
                      </span>
                      <p className="text-xs font-semibold text-foreground break-words pl-4.5">
                        {aprobadorNombre}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. FECHAS DE CICLO DE MANTENIMIENTO (Si existen) */}
                {(currentSolicitud.fechaInicioMantenimiento || currentSolicitud.fechaFinMantenimiento || currentSolicitud.fechaCierre) && (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5" /> Inicio
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block">
                          {formatDate(currentSolicitud.fechaInicioMantenimiento) || "Pendiente"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5" /> Fin Estimado
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block">
                          {formatDate(currentSolicitud.fechaFinMantenimiento) || "En curso"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="size-2.5" /> Cierre
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block">
                          {formatDate(currentSolicitud.fechaCierre) || "No cerrado"}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-border/60" />

                {/* 4. DESCRIPCIÓN DEL REQUERIMIENTO (Texto directo sin caja) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Descripción del Requerimiento
                  </span>
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed break-words font-normal">
                    {currentSolicitud.descripcion || "Sin descripción especificada."}
                  </p>
                </div>
              </TabsContent>

              {/* PESTAÑA 2: ARCHIVOS Y ADJUNTOS */}
              <TabsContent
                value="adjuntos"
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-2.5 m-0"
              >
                {adjuntos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground gap-2">
                    <Paperclip className="size-8 opacity-40" />
                    <p className="text-xs font-semibold text-foreground">Sin archivos adjuntos</p>
                    <p className="text-[11px]">Esta solicitud no incluye evidencias fotográficas ni documentos.</p>
                  </div>
                ) : (
                  <div className="divide-y rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                    {adjuntos.map((adj: SolicitudAdjunto) => {
                      const isImage = adj.tipoContenido?.startsWith("image/")
                      const sizeInKb = adj.size ? (adj.size / 1024).toFixed(0) : null

                      return (
                        <div
                          key={adj.id}
                          className="flex items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                              {isImage ? (
                                <ImageIcon className="size-4 shrink-0" />
                              ) : (
                                <FileText className="size-4 shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground break-words" title={adj.nombreArchivo}>
                                {adj.nombreArchivo}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {sizeInKb ? `${sizeInKb} KB` : ""}
                                {adj.descripcion ? ` · ${adj.descripcion}` : ""}
                              </p>
                            </div>
                          </div>

                          {adj.url && (
                            <a
                              href={adj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs hover:border-primary/50"
                              title="Ver / Descargar archivo"
                            >
                              <Eye className="size-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer Compacto con Botones de Acción */}
            <div className="flex items-center justify-between gap-2 px-5 sm:px-6 py-3 border-t bg-muted/20 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {onTraceability && currentSolicitud.processInstanceId && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      onTraceability(currentSolicitud)
                    }}
                    className="h-7.5 gap-1.5 px-3 text-xs font-medium cursor-pointer shadow-2xs hover:bg-muted"
                  >
                    <History className="size-3 text-primary" />
                    <span>Trazabilidad</span>
                  </Button>
                )}

                {onControlActivo && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      onControlActivo(currentSolicitud)
                    }}
                    className="h-7.5 gap-1.5 px-3 text-xs font-medium hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer shadow-2xs"
                  >
                    <ClipboardCheck className="size-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Control Activo</span>
                  </Button>
                )}

                {onGestionarOrdenTrabajo && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      onGestionarOrdenTrabajo(currentSolicitud)
                    }}
                    className="h-7.5 gap-1.5 px-3 text-xs font-medium hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer shadow-2xs"
                  >
                    <Wrench className="size-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Orden de Trabajo</span>
                  </Button>
                )}

                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadPdf}
                  className="h-7.5 gap-1.5 px-3 text-xs font-medium hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 cursor-pointer shadow-2xs"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="size-3.5 animate-spin text-rose-600 dark:text-rose-400" />
                  ) : (
                    <FileText className="size-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>Reporte PDF</span>
                </Button>
              </div>

              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-7.5 px-4 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}




