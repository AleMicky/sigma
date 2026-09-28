import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Edit2,
  Eye,
  FileText,
  Hash,
  ListChecks,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import type { SolicitudVehicular } from "@/modules/gestionvehicular/solicitud/api/solicitud-vehicular.service"
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

import { useDeleteControlActivoVehicular } from "../api/control-activo.mutations"
import { controlActivoVehicularQueries } from "../api/control-activo.queries"
import type {
  ControlActivoVehicular,
  ControlActivoVehicularDetalle,
  TipoControlActivo,
} from "../api/control-activo.service"

export type ControlActivoVehicularHistorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudVehicular | null
  readOnly?: boolean
  allowedTipo?: "ENTREGA" | "DEVOLUCION" | "ALL"
}

type TipoFilter = "ALL" | "ENTREGA" | "DEVOLUCION"

function ControlItemCard({
  control,
  onEdit,
  onDelete,
  readOnly = false,
  defaultExpanded = true,
  accesorioMap,
}: {
  control: ControlActivoVehicular
  onEdit?: (control: ControlActivoVehicular) => void
  onDelete?: (control: ControlActivoVehicular) => void
  readOnly?: boolean
  defaultExpanded?: boolean
  accesorioMap?: Map<string, Accesorio>
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const detallesQuery = useQuery({
    ...controlActivoVehicularQueries.detallesList({
      controlActivoId: control.id,
    }),
    enabled: expanded,
  })

  const detalles = useMemo(
    () => (detallesQuery.data?.content ?? []) as ControlActivoVehicularDetalle[],
    [detallesQuery.data?.content]
  )

  const isEntrega = control.tipo === "ENTREGA"
  const countOk = useMemo(
    () => detalles.filter((d) => d.conforme).length,
    [detalles]
  )
  const countInconforme = useMemo(
    () => detalles.filter((d) => !d.conforme).length,
    [detalles]
  )
  const totalAccesorios = detalles.length

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card shadow-2xs overflow-hidden transition-all",
        isEntrega
          ? "border-sky-500/20 dark:border-sky-500/30"
          : "border-emerald-500/20 dark:border-emerald-500/30"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-3.5 sm:p-4 border-b transition-colors",
          isEntrega
            ? "bg-sky-500/[0.03] border-sky-500/10"
            : "bg-emerald-500/[0.03] border-emerald-500/10"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 border shadow-2xs",
                isEntrega
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              )}
            >
              {isEntrega ? (
                <ArrowUpRight className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0 stroke-[2.5]" />
              ) : (
                <ArrowDownLeft className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              )}
              <span>{isEntrega ? "Acta de Salida / Entrega" : "Acta de Retorno / Devolución"}</span>
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 border shadow-2xs",
                control.conforme
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
              )}
            >
              {control.conforme ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{control.conforme ? "Conforme" : "Con Observaciones"}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-lg border border-border/70 shrink-0 shadow-2xs">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <span>{formatDate(control.fecha)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {!readOnly && (
              <>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => onEdit?.(control)}
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
      </div>

      {/* Observación general */}
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

      {/* Checklist de accesorios */}
      {expanded && (
        <div className="p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-0.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              <ListChecks className="size-3.5 text-primary" />
              <span>Accesorios verificados ({totalAccesorios})</span>
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
                    <th className="py-2 px-3 min-w-[160px]">Accesorio</th>
                    <th className="py-2 px-2 text-center w-20">Esperado</th>
                    <th className="py-2 px-2 text-center w-24">Encontrado</th>
                    <th className="py-2 px-2 text-center w-28">Estado</th>
                    <th className="py-2 px-3 min-w-[160px]">Nota / Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {detalles.map((det) => {
                    const hasMismatch =
                      det.cantidadEsperada !== det.cantidadEncontrada
                    const isOk = det.conforme && !hasMismatch
                    const diff = det.cantidadEncontrada - det.cantidadEsperada
                    const accInfo = accesorioMap?.get(det.accesorioId)
                    const codigo = det.accesorio?.codigo || accInfo?.codigo || "ACC"
                    const nombre = det.accesorio?.nombre || accInfo?.nombre || "Accesorio"

                    return (
                      <tr
                        key={det.id}
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          !isOk && "bg-amber-500/[0.03] dark:bg-amber-950/10"
                        )}
                      >
                        <td className="py-2 px-3 font-medium">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0">
                              {codigo}
                            </span>
                            <span className="font-semibold text-foreground text-xs truncate max-w-[200px]" title={nombre}>
                              {nombre}
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center text-muted-foreground font-mono font-semibold">
                          {det.cantidadEsperada}
                        </td>

                        <td className="py-2 px-2 text-center font-mono font-bold">
                          <div className="flex items-center justify-center gap-1">
                            <span className={hasMismatch ? "text-amber-600" : "text-foreground"}>
                              {det.cantidadEncontrada}
                            </span>
                            {hasMismatch && (
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1 rounded",
                                  diff > 0
                                    ? "bg-sky-500/10 text-sky-600"
                                    : "bg-rose-500/10 text-rose-600"
                                )}
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                              det.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            )}
                          >
                            {det.conforme ? (
                              <CheckCircle2 className="size-2.5 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="size-2.5 text-amber-600 shrink-0" />
                            )}
                            <span>{det.conforme ? "Conforme" : "Observado"}</span>
                          </span>
                        </td>

                        <td className="py-2 px-3 text-muted-foreground text-xs">
                          {det.observacion || "-"}
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

export function ControlActivoVehicularHistorialModal({
  open,
  onOpenChange,
  solicitud,
  readOnly = false,
  allowedTipo = "ALL",
}: ControlActivoVehicularHistorialModalProps) {
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("ALL")
  const [controlToDelete, setControlToDelete] =
    useState<ControlActivoVehicular | null>(null)

  const deleteMutation = useDeleteControlActivoVehicular()

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
    ...controlActivoVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: open && Boolean(solicitud?.id),
  })

  const allControles = (controlesQuery.data ?? []) as ControlActivoVehicular[]

  const entregasCount = useMemo(
    () => allControles.filter((c) => c.tipo === "ENTREGA").length,
    [allControles]
  )
  const devolucionesCount = useMemo(
    () => allControles.filter((c) => c.tipo === "DEVOLUCION").length,
    [allControles]
  )

  const estado = (solicitud?.estado || "").toUpperCase()
  const isPorSalir =
    estado === "APROBADO" ||
    estado === "APROBADA" ||
    estado === "ASIGNADO" ||
    estado === "BORRADOR" ||
    estado === "PENDIENTE"
  const isEnCurso =
    estado === "EN_CURSO" ||
    estado === "EN_VIAJE" ||
    estado === "EN_PROCESO"

  const effectiveReadOnly = readOnly || isEnCurso

  const effectiveAllowedTipo = isPorSalir ? "ENTREGA" : allowedTipo

  const filteredControles = useMemo(() => {
    if (tipoFilter === "ALL") return allControles
    return allControles.filter((c) => c.tipo === tipoFilter)
  }, [allControles, tipoFilter])

  const navigate = useNavigate()

  function handleOpenCreate(tipo: TipoControlActivo) {
    onOpenChange(false)
    navigate({
      to: "/gestion-vehicular/controles-activos/nuevo",
      search: {
        solicitudId: solicitud?.id,
        tipo: isPorSalir ? "ENTREGA" : tipo,
      },
    })
  }

  function handleOpenEdit(control: ControlActivoVehicular) {
    onOpenChange(false)
    navigate({
      to: "/gestion-vehicular/controles-activos/nuevo",
      search: {
        id: control.id,
        solicitudId: solicitud?.id,
        tipo: control.tipo,
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card",
            allControles.length === 0
              ? "max-w-md max-h-[88vh]"
              : "sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-full max-h-[90vh]"
          )}
        >
          {controlesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center p-14 gap-2.5 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">
                Cargando actas de control de activo vehicular...
              </p>
            </div>
          ) : allControles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                <ClipboardCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Sin Control de Activo Registrado
                </p>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  {isPorSalir
                    ? "Antes de iniciar el viaje, debe registrar el Acta de Entrega (Salida) del vehículo e inspección de accesorios."
                    : "No hay actas de Salida (Entrega) ni Retorno (Devolución) registradas para este viaje vehicular."}
                </p>
              </div>
              {solicitud?.id && !effectiveReadOnly && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleOpenCreate("ENTREGA")}
                    className="h-8 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Acta de Entrega (Salida)</span>
                  </Button>
                  {!isPorSalir && (effectiveAllowedTipo === "ALL" || effectiveAllowedTipo === "DEVOLUCION") && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpenCreate("DEVOLUCION")}
                      className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Acta de Retorno (Devolución)</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <DialogHeader className="px-5 sm:px-6 pt-4 pb-3.5 border-b bg-muted/20 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                      <ClipboardCheck className="size-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <DialogTitle className="text-base font-bold truncate">
                        Controles de Activos del Vehículo
                      </DialogTitle>
                      {solicitud?.numero && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border shadow-2xs">
                          <Hash className="size-3 text-muted-foreground" />
                          <span>{solicitud.numero}</span>
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-semibold">
                        ({allControles.length})
                      </span>
                      {effectiveReadOnly && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border/70">
                          <Eye className="size-3 text-primary" />
                          <span>Solo Consulta</span>
                        </span>
                      )}
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
                          controlesQuery.isFetching && "animate-spin text-primary"
                        )}
                      />
                    </Button>

                    {!effectiveReadOnly && (
                      <>
                        {(effectiveAllowedTipo === "ALL" || effectiveAllowedTipo === "ENTREGA") &&
                          entregasCount === 0 && (
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => handleOpenCreate("ENTREGA")}
                              className="h-7.5 text-xs gap-1.5 px-3 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer shadow-2xs"
                            >
                              <Plus className="size-3" />
                              <span>Acta Salida</span>
                            </Button>
                          )}

                        {!isPorSalir && (effectiveAllowedTipo === "ALL" || effectiveAllowedTipo === "DEVOLUCION") &&
                          devolucionesCount === 0 && (
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => handleOpenCreate("DEVOLUCION")}
                              className="h-7.5 text-xs gap-1.5 px-3 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-2xs"
                            >
                              <Plus className="size-3" />
                              <span>Acta Retorno</span>
                            </Button>
                          )}
                      </>
                    )}
                  </div>
                </div>

                {/* Filtros */}
                {allControles.length > 1 && (
                  <div className="flex items-center gap-1 pt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setTipoFilter("ALL")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        tipoFilter === "ALL"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted"
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
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Salidas ({entregasCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoFilter("DEVOLUCION")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        tipoFilter === "DEVOLUCION"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Retornos ({devolucionesCount})
                    </button>
                  </div>
                )}
              </DialogHeader>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {filteredControles.map((control, idx) => (
                  <ControlItemCard
                    key={control.id}
                    control={control}
                    readOnly={effectiveReadOnly}
                    defaultExpanded={idx === 0}
                    accesorioMap={accesorioMap}
                    onEdit={handleOpenEdit}
                    onDelete={(c) => setControlToDelete(c)}
                  />
                ))}
              </div>

              {/* Footer */}
              <DialogFooter className="p-3 border-t border-border/60 bg-muted/10 flex sm:flex-row items-center justify-between gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {filteredControles.length}{" "}
                  {filteredControles.length === 1
                    ? "acta registrada"
                    : "actas registradas"}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs font-medium cursor-pointer"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <ConfirmDeleteDialog
        open={Boolean(controlToDelete)}
        onOpenChange={(open) => !open && setControlToDelete(null)}
        title="Eliminar Control de Activo Vehicular"
        description="¿Está seguro de eliminar esta acta de control de activo vehicular? Esta acción no se puede deshacer."
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!controlToDelete) return
          await deleteMutation.mutateAsync(controlToDelete.id)
          setControlToDelete(null)
          controlesQuery.refetch()
        }}
      />
    </>
  )
}
