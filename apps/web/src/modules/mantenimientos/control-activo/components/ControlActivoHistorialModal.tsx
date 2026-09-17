import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Edit2,
  FileText,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { useDeleteControlActivo } from "../api/control-activo.mutations"
import { controlActivoQueries } from "../api/control-activo.queries"
import type { ControlActivo, ControlActivoDetalle } from "../api/control-activo.service"

export type ControlActivoHistorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId?: string | null
  solicitudNumero?: string | null
  readOnly?: boolean
  allowedTipo?: "ENTREGA" | "DEVOLUCION" | "ALL"
}

type TipoFilter = "ALL" | "ENTREGA" | "DEVOLUCION"

function ControlItemCard({
  control,
  onCloseModal,
  onDelete,
  readOnly = false,
  defaultExpanded = false,
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

  const detallesQuery = useQuery({
    ...controlActivoQueries.detallesList({ controlActivoId: control.id, size: 100 }),
    enabled: expanded,
  })

  const detalles = (detallesQuery.data?.content ?? []) as ControlActivoDetalle[]
  const isEntrega = control.tipo === "ENTREGA"

  const countOk = useMemo(
    () => detalles.filter((d) => d.conforme).length,
    [detalles],
  )
  const countInconforme = useMemo(
    () => detalles.filter((d) => !d.conforme).length,
    [detalles],
  )

  return (
    <div className="rounded-xl border bg-card shadow-2xs overflow-hidden transition-all">
      {/* Fila Principal de la Tarjeta */}
      <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 bg-card">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Badge Tipo */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 border",
              isEntrega
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
            )}
          >
            {isEntrega ? (
              <ArrowUpRight className="size-3.5 text-sky-600 dark:text-sky-400" />
            ) : (
              <ArrowDownLeft className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{isEntrega ? "Acta Entrega" : "Acta Devolución"}</span>
          </span>

          {/* Badge Conformidad */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border shrink-0",
              control.conforme
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
            )}
          >
            {control.conforme ? (
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
            )}
            <span>{control.conforme ? "Conforme" : "Con Observaciones"}</span>
          </span>

          {/* Fecha y Personas */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium shrink-0">
              <Calendar className="size-3 text-muted-foreground" />
              {formatDate(control.fecha)}
            </span>

            {control.entregadoPor && (
              <>
                <span className="text-muted-foreground/40 font-bold">•</span>
                <span className="truncate">
                  Entrega: <strong className="text-foreground font-medium">{control.entregadoPor.nombre}</strong>
                </span>
              </>
            )}

            {control.recibidoPor && (
              <>
                <span className="text-muted-foreground/40 font-bold">•</span>
                <span className="truncate">
                  Recibe: <strong className="text-foreground font-medium">{control.recibidoPor.nombre}</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center pt-1 md:pt-0 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-end">
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
                className="h-7 text-xs gap-1 px-2.5 font-medium cursor-pointer"
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
            variant="ghost"
            onClick={() => setExpanded((prev) => !prev)}
            className="h-7 text-xs gap-1 px-2.5 font-semibold cursor-pointer hover:bg-muted"
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

      {/* Observación General si existe */}
      {control.observacion && (
        <div className="px-3.5 py-2 text-xs bg-amber-500/[0.04] dark:bg-amber-950/15 border-t border-amber-500/15 flex items-start gap-2">
          <FileText className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-foreground mr-1.5">Observación general:</span>
            <span className="text-foreground/90 whitespace-pre-wrap">{control.observacion}</span>
          </div>
        </div>
      )}

      {/* Tabla compacta de accesorios */}
      {expanded && (
        <div className="border-t bg-muted/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              Accesorios Verificados en el Acta
            </span>
            {!detallesQuery.isLoading && detalles.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {countOk} Conformes
                </span>
                {countInconforme > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    {countInconforme} Con Observaciones
                  </span>
                )}
              </div>
            )}
          </div>

          {detallesQuery.isLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-1.5">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando accesorios...</span>
            </div>
          ) : detalles.length === 0 ? (
            <div className="text-center py-3 text-xs text-muted-foreground italic">
              Sin accesorios especificados en esta acta.
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b select-none">
                  <tr>
                    <th className="px-3 py-1.5 min-w-[180px]">Accesorio</th>
                    <th className="px-2 py-1.5 text-center w-20">Esperado</th>
                    <th className="px-2 py-1.5 text-center w-24">Encontrado</th>
                    <th className="px-2 py-1.5 text-center w-28">Estado</th>
                    <th className="px-3 py-1.5">Nota / Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {detalles.map((det) => {
                    const hasMismatch = det.cantidadEsperada !== det.cantidadEncontrada
                    const isOk = det.conforme && !hasMismatch
                    const accInfo = accesorioMap?.get(det.accesorioId || det.accesorio?.id || "")
                    const codigo = det.accesorio?.codigo || accInfo?.codigo || "ACC"
                    const nombre = det.accesorio?.nombre || accInfo?.nombre || "Accesorio"

                    return (
                      <tr
                        key={det.id}
                        className={cn(
                          "transition-colors",
                          !isOk && "bg-amber-500/[0.04] dark:bg-amber-950/10",
                        )}
                      >
                        {/* Código y Nombre */}
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                              {codigo}
                            </span>
                            <span
                              className="font-semibold text-foreground text-xs truncate max-w-[260px] sm:max-w-[340px]"
                              title={nombre}
                            >
                              {nombre}
                            </span>
                          </div>
                        </td>

                        {/* Cantidad Esperada */}
                        <td className="px-2 py-2 text-center text-muted-foreground font-mono font-semibold">
                          {det.cantidadEsperada}
                        </td>

                        {/* Cantidad Encontrada */}
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-mono font-bold",
                            hasMismatch ? "text-amber-600 dark:text-amber-400" : "text-foreground",
                          )}
                        >
                          {det.cantidadEncontrada}
                        </td>

                        {/* Estado Conformidad */}
                        <td className="px-2 py-2 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border",
                              det.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
                            )}
                          >
                            {det.conforme ? (
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>{det.conforme ? "Conforme" : "Observado"}</span>
                          </span>
                        </td>

                        {/* Observación / Nota */}
                        <td className="px-3 py-2 text-muted-foreground text-xs">
                          {det.observacion || <span className="text-muted-foreground/40 italic">-</span>}
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
  const deleteMutation = useDeleteControlActivo()

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
    ...controlActivoQueries.list({
      solicitudMantenimientoId: solicitudId ?? undefined,
      size: 50,
      sortBy: "fecha",
      direction: "DESC",
    }),
    enabled: open && Boolean(solicitudId),
  })

  const allControles = (controlesQuery.data?.content ?? []) as ControlActivo[]

  const entregasCount = useMemo(
    () => allControles.filter((c) => c.tipo === "ENTREGA").length,
    [allControles],
  )
  const devolucionesCount = useMemo(
    () => allControles.filter((c) => c.tipo === "DEVOLUCION").length,
    [allControles],
  )

  const filteredControles = useMemo(() => {
    if (tipoFilter === "ALL") return allControles
    return allControles.filter((c) => c.tipo === tipoFilter)
  }, [allControles, tipoFilter])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl",
            allControles.length === 0
              ? "max-w-md max-h-[88vh]"
              : "sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-full max-h-[90vh]",
          )}
        >
          {controlesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-2.5 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-sky-600" />
              <p className="text-xs font-semibold">Cargando controles de activo...</p>
            </div>
          ) : allControles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-2.5">
              <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <ClipboardCheck className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  Sin Control de Activo
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Esta solicitud no tiene un control de activo asociado aún.
                </p>
              </div>
              {solicitudId && !readOnly && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    const targetTipo =
                      allowedTipo === "DEVOLUCION" ? "DEVOLUCION" : "ENTREGA"
                    navigate({
                      to: routes.mantenimientos.controlesActivos.nuevo,
                      search: { solicitudId, tipo: targetTipo },
                    })
                  }}
                  className="h-7.5 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer mt-1 shadow-xs"
                >
                  <Plus className="size-3" />
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
              {/* Cabecera Compacta */}
              <DialogHeader className="p-3.5 sm:p-4 border-b bg-muted/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <DialogTitle className="text-sm sm:text-base font-bold truncate font-heading">
                      Controles de Activo
                    </DialogTitle>
                    {solicitudNumero && (
                      <span className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border">
                        {solicitudNumero}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-semibold">
                      ({allControles.length})
                    </span>
                  </div>

                  {solicitudId && !readOnly && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(allowedTipo === "ALL" || allowedTipo === "DEVOLUCION") && (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            onOpenChange(false)
                            navigate({
                              to: routes.mantenimientos.controlesActivos.nuevo,
                              search: { solicitudId, tipo: "DEVOLUCION" },
                            })
                          }}
                          className="h-7 text-xs gap-1 px-2 font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <ArrowDownLeft className="size-3" />
                          <span>Acta Devolución</span>
                        </Button>
                      )}

                      {(allowedTipo === "ALL" || allowedTipo === "ENTREGA") && (
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => {
                            onOpenChange(false)
                            navigate({
                              to: routes.mantenimientos.controlesActivos.nuevo,
                              search: { solicitudId, tipo: "ENTREGA" },
                            })
                          }}
                          className="h-7 text-xs gap-1 px-2 font-medium cursor-pointer shadow-2xs"
                        >
                          <Plus className="size-3" />
                          <span>Acta Entrega</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Filtros en Pills Compactos */}
                {allControles.length > 1 && (
                  <div className="flex items-center gap-1 pt-2 mt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setTipoFilter("ALL")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                        tipoFilter === "ALL"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Todas ({allControles.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoFilter("ENTREGA")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                        tipoFilter === "ENTREGA"
                          ? "bg-sky-600 text-white font-semibold"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Entregas ({entregasCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoFilter("DEVOLUCION")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                        tipoFilter === "DEVOLUCION"
                          ? "bg-emerald-600 text-white font-semibold"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Devoluciones ({devolucionesCount})
                    </button>
                  </div>
                )}
              </DialogHeader>

              {/* Listado Compacto */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                {filteredControles.map((control, idx) => (
                  <ControlItemCard
                    key={control.id}
                    control={control}
                    readOnly={readOnly}
                    defaultExpanded={idx === 0}
                    accesorioMap={accesorioMap}
                    onCloseModal={() => onOpenChange(false)}
                    onDelete={(c) => setControlToDelete(c)}
                  />
                ))}
              </div>
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

