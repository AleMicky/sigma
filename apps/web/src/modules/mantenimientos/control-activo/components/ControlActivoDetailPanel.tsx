import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Layers,
  Loader2,
  MessageSquareQuote,
  Package,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import type { SolicitudMantenimiento } from "@/modules/mantenimientos/solicitud/types/solicitud.type"
import {
  getEstadoBadgeVariant,
  getPrioridadBadgeStyles,
} from "@/modules/mantenimientos/solicitud/lib/solicitud.utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import { controlActivoQueries } from "../api/control-activo.queries"
import {
  downloadControlActivoReportePdf,
  type ControlActivo,
  type ControlActivoDetalle,
} from "../api/control-activo.service"
import { formatEstadoLabel } from "./ControlActivoMasterPanel"

type ControlActivoDetailPanelProps = {
  solicitud: SolicitudMantenimiento | null
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const clean = name.replace(/\[.*?\]/g, "").trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ControlActivoDetailPanel({
  solicitud,
}: ControlActivoDetailPanelProps) {
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("accesorios")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Query all ControlActivo records for the selected Solicitud
  const controlesQuery = useQuery({
    ...controlActivoQueries.bySolicitud(solicitud?.id),
    enabled: Boolean(solicitud?.id),
  })

  const controlesList = (controlesQuery.data ?? []) as ControlActivo[]

  // Selected or active ControlActivo
  const currentControl = useMemo(() => {
    if (selectedControlId) {
      const found = controlesList.find((c) => c.id === selectedControlId)
      if (found) return found
    }
    return controlesList[0] ?? null
  }, [controlesList, selectedControlId])

  const controlId = currentControl?.id ?? ""

  // Query detailed accessories for the selected control
  const detallesQuery = useQuery({
    ...controlActivoQueries.detallesList({
      controlActivoId: controlId,
    }),
    enabled: Boolean(controlId),
  })

  // Lookup accessories catalog
  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
    enabled: Boolean(controlId),
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  const detalles: ControlActivoDetalle[] = useMemo(() => {
    if (detallesQuery.data?.content && detallesQuery.data.content.length > 0) {
      return detallesQuery.data.content
    }
    return currentControl?.detalles ?? []
  }, [detallesQuery.data, currentControl?.detalles])

  // Calculations for current selected control
  const totalAccesorios = detalles.length
  const conformesCount = detalles.filter((d) => d.conforme).length
  const observadosCount = totalAccesorios - conformesCount
  const progressPercent =
    totalAccesorios > 0
      ? Math.round((conformesCount / totalAccesorios) * 100)
      : currentControl?.conforme
        ? 100
        : 0

  async function handleDownloadPdf() {
    if (!currentControl?.id) return
    try {
      setIsGeneratingPdf(true)
      await downloadControlActivoReportePdf(
        currentControl.id,
        currentControl.tipo,
      )
      toast.success("Reporte PDF descargado exitosamente")
    } catch {
      toast.error("Error al generar el reporte PDF del control de activo")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // When NO Solicitud is selected
  if (!solicitud) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-3 border border-sky-500/20 shadow-xs">
          <ClipboardCheck className="size-7" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          Selecciona una Solicitud
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          Elige una solicitud del listado para consultar su reporte de actas de entrega, devolución y checklist de componentes.
        </p>
      </div>
    )
  }

  const estadoFormatted = formatEstadoLabel(solicitud.estado)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Unified Executive Header */}
      <div className="border-b bg-card/80 px-4 py-3 sm:px-6 shrink-0 space-y-2.5">
        {/* Row 1: Solicitud Folio, Badges & PDF Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Folio */}
            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-lg">
              <ClipboardCheck className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-xs font-bold font-mono text-sky-950 dark:text-sky-200">
                {solicitud.numero}
              </span>
            </div>

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

            {controlesList.length > 0 && (
              <Badge
                variant="outline"
                className="text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wide bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
              >
                {controlesList.length}{" "}
                {controlesList.length === 1 ? "Acta Registrada" : "Actas Registradas"}
              </Badge>
            )}
          </div>

          {/* Action buttons on top right (Read-only / PDF export) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentControl && (
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
                <span>PDF Acta</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Asset Title */}
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight flex items-center gap-2">
            <Package className="size-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              {solicitud.activo?.codigo
                ? `${solicitud.activo.codigo} — ${solicitud.activo.nombre}`
                : solicitud.titulo}
            </span>
          </h2>
        </div>

        {/* Row 3: Cohesive Metadata Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground/70 shrink-0" />
            <span>
              Solicitante:{" "}
              <strong className="text-foreground">
                {solicitud.solicitante?.nombreCompleto ||
                  solicitud.solicitante?.nombre ||
                  "No especificado"}
              </strong>
            </span>
          </div>

          {solicitud.fechaSolicitud && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span>
                Solicitado:{" "}
                <strong className="text-foreground font-mono">
                  {formatDate(solicitud.fechaSolicitud)}
                </strong>
              </span>
            </div>
          )}

          {currentControl && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-medium text-foreground">
                Conformidad: {conformesCount}/{totalAccesorios} ({progressPercent}%)
              </span>
              <div className="w-20">
                <Progress
                  value={progressPercent}
                  className="h-1.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Multiple Actas History Selector */}
        {controlesList.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 overflow-x-auto">
            <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="size-3 text-sky-600" />
              Actas del Activo ({controlesList.length}):
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {controlesList.map((ctrl) => {
                const isEntrega = ctrl.tipo === "ENTREGA"
                const isSelected = ctrl.id === currentControl?.id

                return (
                  <button
                    key={ctrl.id}
                    type="button"
                    onClick={() => setSelectedControlId(ctrl.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs border",
                      isSelected
                        ? isEntrega
                          ? "bg-sky-600 text-white border-sky-600 ring-1 ring-sky-600"
                          : "bg-emerald-600 text-white border-emerald-600 ring-1 ring-emerald-600"
                        : "bg-muted/70 text-foreground/80 hover:bg-muted hover:text-foreground border-border/60",
                    )}
                  >
                    {isEntrega ? (
                      <ArrowUpRight className={cn("size-3", isSelected ? "text-white" : "text-sky-600")} />
                    ) : (
                      <ArrowDownLeft className={cn("size-3", isSelected ? "text-white" : "text-emerald-600")} />
                    )}
                    <span>{isEntrega ? "Acta de Entrega" : "Acta de Devolución"}</span>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0 rounded-full font-medium",
                        isSelected
                          ? "bg-white/20 text-white"
                          : ctrl.conforme
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {ctrl.conforme ? "Conforme" : "Observado"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {controlesQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin text-sky-600" />
            <span>Cargando controles de activos...</span>
          </div>
        ) : !currentControl ? (
          /* Empty state when Solicitud has no actas */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-muted/5">
            <div className="rounded-2xl border border-dashed p-8 max-w-md bg-card/60 shadow-2xs space-y-2.5">
              <div className="size-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto border">
                <ClipboardCheck className="size-6 opacity-60" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Sin Actas de Control Registradas
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Esta solicitud no cuenta con actas de entrega ni devolución de accesorios registradas en el sistema.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Segmented Capsule Tabs & Content */
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {/* Segmented Capsule Tabs Navigation Bar */}
            <div className="border-b px-4 py-2 sm:px-6 bg-muted/20 shrink-0">
              <TabsList className="h-auto bg-muted/50 p-1 rounded-xl gap-1 inline-flex max-w-full overflow-hidden border border-border/50">
                <TabsTrigger
                  value="accesorios"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer select-none",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Layers className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Checklist Accesorios</span>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-1.5 py-0 text-[10px] font-bold rounded-full",
                      totalAccesorios > 0
                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {totalAccesorios}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="responsables"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <User className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Responsables y Firmas</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0 text-[10px] font-bold rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                    2
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="detalles"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Observaciones & Datos</span>
                  {currentControl.observacion && (
                    <span className="inline-flex items-center justify-center size-1.5 rounded-full bg-amber-500" />
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="solicitud"
                  className={cn(
                    "h-7 px-3 text-xs font-medium rounded-lg transition-all gap-1.5 cursor-pointer",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:font-semibold",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileCheck2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ficha Solicitud</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Accesorios & Checklist */}
            <TabsContent
              value="accesorios"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-3.5 pr-1 overscroll-contain max-w-5xl">
                {/* Summary Progress Card */}
                <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="size-4 text-sky-600" />
                      <span className="font-semibold text-foreground">
                        Conformidad de Accesorios del Acta
                      </span>
                    </div>
                    <span className="font-bold font-mono text-xs text-foreground">
                      {conformesCount}/{totalAccesorios} Conformes ({progressPercent}%)
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                      {conformesCount} Conformes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500 inline-block" />
                      {observadosCount} Con Observaciones o Discrepancias
                    </span>
                  </div>
                </div>

                {/* List of Accessories */}
                {detallesQuery.isLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-6 animate-spin text-sky-600" />
                    <span>Cargando accesorios del acta...</span>
                  </div>
                ) : detalles.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
                    <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      No se registraron accesorios individuales
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-0.5">
                      El acta fue validada de forma global para la unidad principal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                      <span>Listado de Accesorios y Estado</span>
                      <span>{detalles.length} elementos</span>
                    </div>

                    <div className="grid gap-2">
                      {detalles.map((det, idx) => {
                        const accesorioFull = accesorioMap.get(det.accesorioId)
                        const nombre =
                          det.accesorio?.nombre ||
                          accesorioFull?.nombre ||
                          `Accesorio #${idx + 1}`
                        const codigo =
                          det.accesorio?.codigo || accesorioFull?.codigo || "—"

                        return (
                          <div
                            key={det.id || idx}
                            className={cn(
                              "rounded-xl border p-3 bg-card/80 transition-all text-xs space-y-2",
                              det.conforme
                                ? "border-border/70 hover:border-border"
                                : "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={cn(
                                    "size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                    det.conforme
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                                  )}
                                >
                                  <Package className="size-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-foreground text-xs">
                                      {nombre}
                                    </span>
                                    {codigo !== "—" && (
                                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded border">
                                        {codigo}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Esperado:{" "}
                                    <strong className="text-foreground font-mono">
                                      {det.cantidadEsperada}
                                    </strong>{" "}
                                    | Encontrado:{" "}
                                    <strong className="text-foreground font-mono">
                                      {det.cantidadEncontrada}
                                    </strong>
                                  </p>
                                </div>
                              </div>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9.5px] px-2 py-0.5 font-bold uppercase tracking-wide shrink-0",
                                  det.conforme
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                                )}
                              >
                                {det.conforme ? "Conforme" : "Observación"}
                              </Badge>
                            </div>

                            {det.observacion && (
                              <div className="flex items-start gap-1.5 text-[11px] bg-muted/40 p-2 rounded-lg border border-border/50 text-foreground/90">
                                <MessageSquareQuote className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                  {det.observacion}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Responsables y Firmas */}
            <TabsContent
              value="responsables"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1 overscroll-contain max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Entregado Por Card */}
                  <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ArrowUpRight className="size-3.5 text-sky-600" />
                        Entrega Realizada Por
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9.5px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 font-semibold"
                      >
                        Emisor
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {getInitials(currentControl.entregadoPor?.nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {currentControl.entregadoPor?.nombre || "Usuario no asignado"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          ID: {currentControl.entregadoPorId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/50 flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>Fecha: {formatDateTime(currentControl.fecha)}</span>
                    </div>
                  </div>

                  {/* Recibido Por Card */}
                  <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ArrowDownLeft className="size-3.5 text-emerald-600" />
                        Recibido Conforme Por
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9.5px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 font-semibold"
                      >
                        Receptor
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {getInitials(currentControl.recibidoPor?.nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {currentControl.recibidoPor?.nombre || "Usuario no asignado"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          ID: {currentControl.recibidoPorId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/50 flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      <span>Fecha: {formatDateTime(currentControl.fecha)}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Callout */}
                <div className="rounded-xl border bg-card/60 p-4 shadow-2xs flex items-start gap-3">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      currentControl.conforme
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {currentControl.conforme ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 text-xs space-y-1">
                    <p className="font-bold text-foreground">
                      {currentControl.conforme
                        ? "Verificación y Aceptación Conforme"
                        : "Acta Registrada con Observaciones y Novedades"}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentControl.conforme
                        ? "El receptor confirma haber recibido el activo y sus componentes en las condiciones descritas y sin novedades que afecten su operatividad."
                        : "Se detectaron discrepancias, daños o faltantes en los accesorios o el estado general del activo al momento del registro del acta."}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Observaciones & Datos */}
            <TabsContent
              value="detalles"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1 overscroll-contain max-w-5xl">
                {/* General Observations Card */}
                <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <MessageSquareQuote className="size-4 text-sky-600" />
                    <span>Observaciones Generales del Acta</span>
                  </div>
                  {currentControl.observacion ? (
                    <p className="text-xs text-foreground/90 bg-muted/40 p-3 rounded-lg border leading-relaxed whitespace-pre-wrap">
                      {currentControl.observacion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-dashed">
                      Sin observaciones adicionales registradas.
                    </p>
                  )}
                </div>

                {/* Audit Info */}
                <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <FileText className="size-4 text-sky-600" />
                    <span>Información de Auditoría</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div>
                      <span>Creado: </span>
                      <strong className="text-foreground font-mono">
                        {formatDateTime(currentControl.createdAt)}
                      </strong>
                    </div>
                    <div>
                      <span>Última modificación: </span>
                      <strong className="text-foreground font-mono">
                        {formatDateTime(currentControl.updatedAt)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Ficha Solicitud */}
            <TabsContent
              value="solicitud"
              className="flex min-h-0 flex-1 flex-col overflow-hidden m-0 p-3.5 sm:p-5"
            >
              <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1 overscroll-contain max-w-5xl">
                {/* Basic Solicitud Details */}
                <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck2 className="size-3.5 text-emerald-600" />
                      Datos Generales de la Solicitud
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-600">
                      {solicitud.numero}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px]">Título:</span>
                      <p className="font-semibold text-foreground mt-0.5">{solicitud.titulo}</p>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px]">Activo:</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {solicitud.activo?.codigo} - {solicitud.activo?.nombre}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px]">Solicitante:</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {solicitud.solicitante?.nombreCompleto || solicitud.solicitante?.nombre || "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px]">Fecha Solicitud:</span>
                      <p className="font-semibold text-foreground font-mono mt-0.5">
                        {formatDate(solicitud.fechaSolicitud)}
                      </p>
                    </div>
                  </div>

                  {solicitud.descripcion && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground text-[11px]">Descripción / Motivo:</span>
                      <p className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-lg border mt-1 leading-relaxed">
                        {solicitud.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
