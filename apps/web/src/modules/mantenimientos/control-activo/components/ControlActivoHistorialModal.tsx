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
  ClipboardList,
  Edit2,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react"

import { routes } from "@/app/config/routes"
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
}

type TipoFilter = "ALL" | "ENTREGA" | "DEVOLUCION"

function ControlItemCard({
  control,
  onCloseModal,
  onDelete,
  readOnly = false,
  defaultExpanded = false,
}: {
  control: ControlActivo
  onCloseModal?: () => void
  onDelete?: (control: ControlActivo) => void
  readOnly?: boolean
  defaultExpanded?: boolean
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
    <div className="rounded-lg border bg-card shadow-2xs overflow-hidden transition-all">
      {/* Fila Principal Compacta */}
      <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Badge Tipo Compacto */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shrink-0 border",
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
            <span>{isEntrega ? "Entrega" : "Devolución"}</span>
          </span>

          {/* Badge Conformidad */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border shrink-0",
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
            <span>{control.conforme ? "Conforme" : "Con Obs."}</span>
          </span>

          {/* Fecha y Personas */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground min-w-0">
            <span className="inline-flex items-center gap-1 font-medium shrink-0">
              <Calendar className="size-3 text-muted-foreground" />
              {formatDate(control.fecha)}
            </span>

            {control.entregadoPor && (
              <span className="truncate">
                Entrega: <strong className="text-foreground">{control.entregadoPor.nombre}</strong>
              </span>
            )}

            {control.recibidoPor && (
              <span className="truncate">
                Recibe: <strong className="text-foreground">{control.recibidoPor.nombre}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
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
                className="h-7 text-xs gap-1 px-2 font-medium cursor-pointer"
              >
                <Edit2 className="size-3 text-muted-foreground" />
                <span>Editar</span>
              </Button>

              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={() => onDelete?.(control)}
                className="h-7 text-xs px-1.5 font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
            className="h-7 text-xs gap-1 px-2 font-medium cursor-pointer hover:bg-muted"
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

      {/* Observación si existe */}
      {control.observacion && (
        <div className="px-3 py-1.5 text-xs bg-amber-500/5 text-amber-900 dark:text-amber-200 border-t border-amber-500/15">
          <strong className="font-semibold">Obs: </strong>
          <span>{control.observacion}</span>
        </div>
      )}

      {/* Tabla compacta de accesorios */}
      {expanded && (
        <div className="border-t bg-muted/20 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              Accesorios Verificados
            </span>
            {!detallesQuery.isLoading && detalles.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {countOk} OK
                </span>
                {countInconforme > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    {countInconforme} No OK
                  </span>
                )}
              </div>
            )}
          </div>

          {detallesQuery.isLoading ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground gap-1.5">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando...</span>
            </div>
          ) : detalles.length === 0 ? (
            <div className="text-center py-2 text-xs text-muted-foreground italic">
              Sin accesorios especificados.
            </div>
          ) : (
            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b">
                  <tr>
                    <th className="px-2.5 py-1.5">Código / Nombre</th>
                    <th className="px-2 py-1.5 text-center">Esperado</th>
                    <th className="px-2 py-1.5 text-center">Encontrado</th>
                    <th className="px-2 py-1.5 text-center">Estado</th>
                    <th className="px-2.5 py-1.5">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {detalles.map((det) => {
                    const hasMismatch = det.cantidadEsperada !== det.cantidadEncontrada
                    const isOk = det.conforme && !hasMismatch

                    return (
                      <tr
                        key={det.id}
                        className={cn(
                          "transition-colors",
                          !isOk && "bg-rose-500/5 dark:bg-rose-950/10",
                        )}
                      >
                        <td className="px-2.5 py-1.5 font-medium">
                          <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded mr-1.5">
                            {det.accesorio?.codigo ?? "ACC"}
                          </span>
                          <span>{det.accesorio?.nombre ?? "Accesorio"}</span>
                        </td>
                        <td className="px-2 py-1.5 text-center text-muted-foreground font-mono">
                          {det.cantidadEsperada}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-1.5 text-center font-mono font-bold",
                            hasMismatch ? "text-rose-600 dark:text-rose-400" : "text-foreground",
                          )}
                        >
                          {det.cantidadEncontrada}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={cn(
                              "inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold",
                              det.conforme
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
                            )}
                          >
                            {det.conforme ? "OK" : "NO OK"}
                          </span>
                        </td>
                        <td className="px-2.5 py-1.5 text-muted-foreground text-[11px] truncate max-w-[150px]">
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

export function ControlActivoHistorialModal({
  open,
  onOpenChange,
  solicitudId,
  solicitudNumero,
  readOnly = false,
}: ControlActivoHistorialModalProps) {
  const navigate = useNavigate()
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("ALL")
  const [controlToDelete, setControlToDelete] = useState<ControlActivo | null>(null)
  const deleteMutation = useDeleteControlActivo()

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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border shadow-lg">
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
                {!controlesQuery.isLoading && (
                  <span className="text-xs text-muted-foreground font-semibold">
                    ({allControles.length})
                  </span>
                )}
              </div>

              {solicitudId && !readOnly && (
                <div className="flex items-center gap-1.5 shrink-0">
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
                    <span>Devolución</span>
                  </Button>

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
                    <span>Entrega</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Filtros en Pills Compactos */}
            {!controlesQuery.isLoading && allControles.length > 1 && (
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
            {controlesQuery.isLoading ? (
              <div className="flex items-center justify-center py-10 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Cargando actas...</span>
              </div>
            ) : allControles.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <ClipboardList className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="font-semibold text-foreground">No hay actas registradas</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  {readOnly
                    ? "Esta solicitud no tiene actas registradas."
                    : "Genera la primera acta de entrega para controlar el activo y sus accesorios."}
                </p>
                {solicitudId && !readOnly && (
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
                    className="h-7 text-xs mt-1"
                  >
                    <Plus className="size-3" />
                    <span>Registrar Acta de Entrega</span>
                  </Button>
                )}
              </div>
            ) : (
              filteredControles.map((control, idx) => (
                <ControlItemCard
                  key={control.id}
                  control={control}
                  readOnly={readOnly}
                  defaultExpanded={idx === 0}
                  onCloseModal={() => onOpenChange(false)}
                  onDelete={(c) => setControlToDelete(c)}
                />
              ))
            )}
          </div>
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

