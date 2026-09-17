import { useMemo, useState, type MouseEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Edit2,
  FileText,
  Hash,
  ListChecks,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import { useDeleteControlActivo } from "../api/control-activo.mutations"
import { controlActivoQueries } from "../api/control-activo.queries"
import {
  downloadControlActivoReportePdf,
  type ControlActivo,
  type ControlActivoDetalle,
} from "../api/control-activo.service"

export type ControlActivoHistorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId?: string | null
  solicitudNumero?: string | null
  readOnly?: boolean
  allowedTipo?: "ENTREGA" | "DEVOLUCION" | "ALL"
}

type TipoFilter = "ALL" | "ENTREGA" | "DEVOLUCION"

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const clean = name.replace(/\[.*?\]/g, "").trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function ControlItemCard({
  control,
  onCloseModal,
  onDelete,
  readOnly = false,
  defaultExpanded = true,
  accesorioMap,
}: {
  control: ControlActivo
  onCloseModal?: () => void
  onDelete?: (control: ControlActivo) => void
  readOnly?: boolean
  defaultExpanded?: boolean
  accesorioMap?: Map<string, Accesorio>
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true)
      await downloadControlActivoReportePdf(control.id, control.tipo)
      toast.success("Reporte PDF generado exitosamente")
    } catch {
      toast.error("Error al generar el reporte PDF del control de activo")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const detallesQuery = useQuery({
    ...controlActivoQueries.detallesList({ controlActivoId: control.id, size: 100 }),
    enabled: expanded,
  })

  const detalles = useMemo(
    () => (detallesQuery.data?.content ?? []) as ControlActivoDetalle[],
    [detallesQuery.data?.content],
  )
  const isEntrega = control.tipo === "ENTREGA"

  const countOk = useMemo(
    () => detalles.filter((d) => d.conforme).length,
    [detalles],
  )
  const countInconforme = useMemo(
    () => detalles.filter((d) => !d.conforme).length,
    [detalles],
  )
  const totalAccesorios = detalles.length

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card shadow-2xs overflow-hidden transition-all",
        isEntrega
          ? "border-sky-500/20 dark:border-sky-500/30"
          : "border-emerald-500/20 dark:border-emerald-500/30",
      )}
    >
      {/* Cabecera de la Tarjeta del Acta */}
      <div
        className={cn(
          "p-3.5 sm:p-4 border-b transition-colors",
          isEntrega
            ? "bg-sky-500/[0.03] border-sky-500/10"
            : "bg-emerald-500/[0.03] border-emerald-500/10",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Badges y Metadatos Principales */}
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            {/* Tipo de Acta */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 border shadow-2xs",
                isEntrega
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
              )}
            >
              {isEntrega ? (
                <ArrowUpRight className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0 stroke-[2.5]" />
              ) : (
                <ArrowDownLeft className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              )}
              <span>{isEntrega ? "Acta de Entrega" : "Acta de Devolución"}</span>
            </span>

            {/* Conformidad */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 border shadow-2xs",
                control.conforme
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
              )}
            >
              {control.conforme ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{control.conforme ? "Conforme" : "Con Observaciones"}</span>
            </span>

            {/* Fecha */}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-lg border border-border/70 shrink-0 shadow-2xs">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <span>{formatDate(control.fecha)}</span>
            </span>
          </div>

          {/* Acciones de la Tarjeta */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {/* Botón Descargar PDF */}
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="h-7 text-xs gap-1.5 px-2.5 font-medium bg-background hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer shadow-2xs text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:border-rose-300"
              title="Descargar Acta en PDF"
            >
              {isExportingPdf ? (
                <Loader2 className="size-3 animate-spin text-rose-600" />
              ) : (
                <FileText className="size-3 text-rose-600 dark:text-rose-400" />
              )}
              <span>PDF</span>
            </Button>

            {!readOnly && (
              <>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    onCloseModal?.()
                    navigate({
                      to: routes.mantenimientos.controlesActivos.nuevo,
                      search: {
                        solicitudId: control.solicitudMantenimientoId,
                        id: control.id,
                        tipo: control.tipo,
                      },
                    })
                  }}
                  className="h-7 text-xs gap-1.5 px-2.5 font-medium bg-background hover:bg-muted cursor-pointer shadow-2xs"
                  title="Editar acta"
                >
                  <Edit2 className="size-3 text-muted-foreground" />
                  <span>Editar</span>
                </Button>

                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => onDelete?.(control)}
                  className="h-7 text-xs px-2 font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Eliminar acta"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </>
            )}

            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setExpanded((prev) => !prev)}
              className="h-7 text-xs gap-1.5 px-2.5 font-medium bg-background hover:bg-muted cursor-pointer shadow-2xs"
            >
              <Package className="size-3 text-primary" />
              <span>{expanded ? "Ocultar" : "Accesorios"}</span>
              {expanded ? (
                <ChevronDown className="size-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Participantes (Entrega / Recepción) con Avatares */}
        {(control.entregadoPor || control.recibidoPor) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-border/40 text-xs">
            {control.entregadoPor && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-[10px] border border-border">
                  {getInitials(control.entregadoPor.nombre)}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-none mb-0.5">
                    Entregado por:
                  </span>
                  <span className="font-semibold text-foreground text-xs truncate block" title={control.entregadoPor.nombre}>
                    {control.entregadoPor.nombre}
                  </span>
                </div>
              </div>
            )}

            {control.recibidoPor && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px] border border-sky-500/20">
                  {getInitials(control.recibidoPor.nombre)}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block leading-none mb-0.5">
                    Recibido por:
                  </span>
                  <span className="font-semibold text-foreground text-xs truncate block" title={control.recibidoPor.nombre}>
                    {control.recibidoPor.nombre}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Observación General destacada */}
      {control.observacion && (
        <div className="p-3 sm:px-4 sm:py-2.5 bg-amber-500/[0.04] dark:bg-amber-950/15 border-b border-amber-500/15 flex items-start gap-2.5 text-xs">
          <FileText className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-amber-800 dark:text-amber-300 mr-1.5">
              Observación general:
            </span>
            <span className="text-foreground/90 whitespace-pre-wrap">
              {control.observacion}
            </span>
          </div>
        </div>
      )}

      {/* Tabla de accesorios y checklist */}
      {expanded && (
        <div className="p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-0.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              <ListChecks className="size-3.5 text-primary" />
              <span>Accesorios verificados en el acta</span>
            </div>
            {!detallesQuery.isLoading && totalAccesorios > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  <span>{countOk} Conformes</span>
                </span>
                {countInconforme > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    <AlertCircle className="size-3" />
                    <span>{countInconforme} Con Observaciones</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {detallesQuery.isLoading ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando accesorios del acta...</span>
            </div>
          ) : detalles.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground italic">
              Sin accesorios especificados en esta acta.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-background/50">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/40 text-[10.5px] uppercase font-semibold text-muted-foreground select-none bg-muted/30">
                    <th className="py-2.5 px-3 min-w-[180px]">Accesorio</th>
                    <th className="py-2.5 px-2 text-center w-20">Esperado</th>
                    <th className="py-2.5 px-2 text-center w-24">Encontrado</th>
                    <th className="py-2.5 px-2 text-center w-28">Estado</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Nota / Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {detalles.map((det) => {
                    const hasMismatch = det.cantidadEsperada !== det.cantidadEncontrada
                    const isOk = det.conforme && !hasMismatch
                    const diff = det.cantidadEncontrada - det.cantidadEsperada
                    const accInfo = accesorioMap?.get(det.accesorioId || det.accesorio?.id || "")
                    const codigo = det.accesorio?.codigo || accInfo?.codigo || "ACC"
                    const nombre = det.accesorio?.nombre || accInfo?.nombre || "Accesorio"

                    return (
                      <tr
                        key={det.id}
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          !isOk && "bg-amber-500/[0.03] dark:bg-amber-950/10",
                        )}
                      >
                        {/* Código y Nombre */}
                        <td className="py-2.5 px-3 font-medium">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10.5px] font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0">
                              {codigo}
                            </span>
                            <span
                              className="font-semibold text-foreground text-xs truncate max-w-[240px] sm:max-w-[320px]"
                              title={nombre}
                            >
                              {nombre}
                            </span>
                          </div>
                        </td>

                        {/* Cantidad Esperada */}
                        <td className="py-2.5 px-2 text-center text-muted-foreground font-mono font-semibold">
                          {det.cantidadEsperada}
                        </td>

                        {/* Cantidad Encontrada + Badge Discrepancia */}
                        <td className="py-2.5 px-2 text-center font-mono">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className={cn(
                                "font-bold",
                                hasMismatch ? "text-amber-600 dark:text-amber-400" : "text-foreground",
                              )}
                            >
                              {det.cantidadEncontrada}
                            </span>
                            {hasMismatch && (
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1 rounded",
                                  diff > 0
                                    ? "bg-sky-500/10 text-sky-600"
                                    : "bg-rose-500/10 text-rose-600",
                                )}
                                title={diff > 0 ? `Excedente de +${diff}` : `Faltante de ${diff}`}
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Estado Conformidad */}
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold",
                              det.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                            )}
                          >
                            {det.conforme ? (
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            )}
                            <span>{det.conforme ? "Conforme" : "Observado"}</span>
                          </span>
                        </td>

                        {/* Observación / Nota */}
                        <td className="py-2.5 px-3 text-muted-foreground text-xs leading-relaxed">
                          {det.observacion || <span className="text-muted-foreground/30 italic font-mono">-</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ControlActivoHistorialModal({
  open,
  onOpenChange,
  solicitudId,
  solicitudNumero,
  readOnly = false,
  allowedTipo = "ALL",
}: ControlActivoHistorialModalProps) {
  const navigate = useNavigate()
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("ALL")
  const [controlToDelete, setControlToDelete] = useState<ControlActivo | null>(null)
  const [copiedFolio, setCopiedFolio] = useState(false)
  const deleteMutation = useDeleteControlActivo()

  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudId ?? ""),
    enabled: Boolean(solicitudId && open),
  })
  const estadoSolicitudNorm = (solicitudQuery.data?.estado ?? "").toUpperCase().trim()

  const isTrabajoRealizado =
    estadoSolicitudNorm === "TRABAJO_REALIZADO" ||
    estadoSolicitudNorm === "TRABAJO REALIZADO" ||
    estadoSolicitudNorm === "TRABAJO-REALIZADO"

  const isEffectiveReadOnly =
    readOnly ||
    estadoSolicitudNorm === "EN_REVISION" ||
    estadoSolicitudNorm === "FINALIZADO" ||
    estadoSolicitudNorm === "CANCELADO" ||
    estadoSolicitudNorm === "RECHAZADO"

  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
    enabled: open,
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  const controlesQuery = useQuery({
    ...controlActivoQueries.bySolicitud(solicitudId),
    enabled: open && Boolean(solicitudId),
  })

  const allControles = (controlesQuery.data ?? []) as ControlActivo[]

  const entregasCount = useMemo(
    () => allControles.filter((c) => c.tipo === "ENTREGA").length,
    [allControles],
  )
  const devolucionesCount = useMemo(
    () => allControles.filter((c) => c.tipo === "DEVOLUCION").length,
    [allControles],
  )

  const hasDevolucion = devolucionesCount > 0

  const filteredControles = useMemo(() => {
    if (tipoFilter === "ALL") return allControles
    return allControles.filter((c) => c.tipo === tipoFilter)
  }, [allControles, tipoFilter])

  const handleCopyFolio = (e: MouseEvent) => {
    e.stopPropagation()
    if (!solicitudNumero) return
    navigator.clipboard.writeText(solicitudNumero)
    setCopiedFolio(true)
    toast.success("Folio copiado al portapapeles", { duration: 1500 })
    setTimeout(() => setCopiedFolio(false), 2000)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card",
            allControles.length === 0
              ? "max-w-md max-h-[88vh]"
              : "sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-full max-h-[90vh]",
          )}
        >
          {controlesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center p-14 gap-2.5 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-sky-600" />
              <p className="text-xs font-semibold">Cargando actas de control de activo...</p>
            </div>
          ) : allControles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-500/20">
                <ClipboardCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Sin Control de Activo Registrado
                </p>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  {allowedTipo === "DEVOLUCION"
                    ? "Esta solicitud requiere registrar el Acta de Devolución para verificar el estado de los accesorios al finalizar el trabajo."
                    : "No hay actas de Entrega ni Devolución asociadas a esta solicitud de mantenimiento."}
                </p>
              </div>
              {solicitudId && !isEffectiveReadOnly && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    const targetTipo =
                      allowedTipo === "DEVOLUCION" ? "DEVOLUCION" : "ENTREGA"
                    navigate({
                      to: routes.mantenimientos.controlesActivos.nuevo,
                      search: {
                        solicitudId: solicitudId ?? undefined,
                        tipo: targetTipo,
                      },
                    })
                  }}
                  className="h-8 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer mt-1 shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>
                    {allowedTipo === "DEVOLUCION"
                      ? "Crear Acta de Devolución"
                      : "Crear Control de Activo"}
                  </span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Cabecera Principal Pulida */}
              <DialogHeader className="px-5 sm:px-6 pt-4 pb-3.5 border-b bg-muted/20 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
                      <ClipboardCheck className="size-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <DialogTitle className="text-base font-bold truncate">
                        Controles de Activo
                      </DialogTitle>

                      {solicitudNumero && (
                        <button
                          type="button"
                          onClick={handleCopyFolio}
                          className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border shadow-2xs hover:border-primary/50 hover:bg-muted/40 cursor-pointer active:scale-95 transition-all"
                          title="Haga clic para copiar folio"
                        >
                          <Hash className="size-3 text-muted-foreground" />
                          <span>{solicitudNumero}</span>
                          {copiedFolio ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3 opacity-40 hover:opacity-100" />
                          )}
                        </button>
                      )}

                      <span className="text-xs text-muted-foreground font-semibold">
                        ({allControles.length})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() => controlesQuery.refetch()}
                      disabled={controlesQuery.isFetching}
                      title="Actualizar listado de actas"
                      className="size-7 rounded-lg border-border/70 hover:bg-muted cursor-pointer"
                    >
                      <RefreshCw
                        className={cn(
                          "size-3.5 text-muted-foreground",
                          controlesQuery.isFetching && "animate-spin text-primary",
                        )}
                      />
                    </Button>

                    {solicitudId && !isEffectiveReadOnly && (
                      <>
                        {/* Solo mostrar botón de Devolución si aún no se ha creado una Devolución */}
                        {(allowedTipo === "ALL" || allowedTipo === "DEVOLUCION") && devolucionesCount === 0 && (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false)
                              navigate({
                                to: routes.mantenimientos.controlesActivos.nuevo,
                                search: {
                                  solicitudId: solicitudId ?? undefined,
                                  tipo: "DEVOLUCION",
                                },
                              })
                            }}
                            className="h-7.5 text-xs gap-1.5 px-3 font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
                          >
                            <ArrowDownLeft className="size-3 stroke-[2.5]" />
                            <span>Acta Devolución</span>
                          </Button>
                        )}

                        {/* Solo mostrar botón de Entrega si aún no se ha creado una Entrega */}
                        {(allowedTipo === "ALL" || allowedTipo === "ENTREGA") && entregasCount === 0 && (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => {
                              onOpenChange(false)
                              navigate({
                                to: routes.mantenimientos.controlesActivos.nuevo,
                                search: {
                                  solicitudId: solicitudId ?? undefined,
                                  tipo: "ENTREGA",
                                },
                              })
                            }}
                            className="h-7.5 text-xs gap-1.5 px-3 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer shadow-2xs"
                          >
                            <Plus className="size-3" />
                            <span>Acta Entrega</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Banner Contextual: Requisito de Devolución para Solicitudes en Trabajo Realizado */}
                {isTrabajoRealizado && !hasDevolucion && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-medium truncate">
                        <strong>Requisito Obligatorio:</strong> Registra el Acta de Devolución para cerrar la solicitud.
                      </span>
                    </div>
                    {!isEffectiveReadOnly && (
                      <Button
                        type="button"
                        size="xs"
                        onClick={() => {
                          onOpenChange(false)
                          navigate({
                            to: routes.mantenimientos.controlesActivos.nuevo,
                            search: {
                              solicitudId: solicitudId ?? undefined,
                              tipo: "DEVOLUCION",
                            },
                          })
                        }}
                        className="h-6.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer px-2.5 rounded-md"
                      >
                        Crear Devolución
                      </Button>
                    )}
                  </div>
                )}

                {/* Filtros en Pills Compactos */}
                {allControles.length > 1 && (
                  <div className="flex items-center gap-1 pt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setTipoFilter("ALL")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        tipoFilter === "ALL"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Todas ({allControles.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoFilter("ENTREGA")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        tipoFilter === "ENTREGA"
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Entregas ({entregasCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoFilter("DEVOLUCION")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        tipoFilter === "DEVOLUCION"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Devoluciones ({devolucionesCount})
                    </button>
                  </div>
                )}
              </DialogHeader>

              {/* Listado con scroll suave y espaciado */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {filteredControles.map((control, idx) => (
                  <ControlItemCard
                    key={control.id}
                    control={control}
                    readOnly={
                      isEffectiveReadOnly || (allowedTipo !== "ALL" && control.tipo !== allowedTipo)
                    }
                    defaultExpanded={idx === 0}
                    accesorioMap={accesorioMap}
                    onCloseModal={() => onOpenChange(false)}
                    onDelete={(c) => setControlToDelete(c)}
                  />
                ))}
              </div>

              {/* Footer Estructurado */}
              <DialogFooter className="p-3 border-t border-border/60 bg-muted/10 flex sm:flex-row items-center justify-between gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {filteredControles.length} {filteredControles.length === 1 ? "acta registrada" : "actas registradas"}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs px-4 cursor-pointer font-medium"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(controlToDelete)}
        onOpenChange={(isOpen) => !isOpen && setControlToDelete(null)}
        title="¿Eliminar acta de control?"
        description={`¿Estás seguro de que deseas eliminar el acta de ${controlToDelete?.tipo === "ENTREGA" ? "Entrega" : "Devolución"} del ${controlToDelete ? formatDate(controlToDelete.fecha) : ""}? Se eliminarán también los registros de verificación de accesorios.`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (controlToDelete) {
            await deleteMutation.mutateAsync(controlToDelete.id)
            setControlToDelete(null)
          }
        }}
      />
    </>
  )
}
