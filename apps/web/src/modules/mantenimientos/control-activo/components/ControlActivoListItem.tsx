import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Package,
  Trash2,
  User,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import type { Accesorio } from "@/modules/activos/accesorio/api/accesorio.service"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { controlActivoQueries } from "../api/control-activo.queries"
import type { ControlActivo } from "../api/control-activo.service"

type ControlActivoListItemProps = {
  control: ControlActivo
  onDelete: (id: string) => void
}

export function ControlActivoListItem({
  control,
  onDelete,
}: ControlActivoListItemProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<boolean>(false)

  const allAccesoriosQuery = useQuery({
    ...accesorioQueries.list({ size: 1000 }),
    enabled: expanded,
  })

  const accesorioMap = useMemo(() => {
    const map = new Map<string, Accesorio>()
    for (const acc of allAccesoriosQuery.data?.content ?? []) {
      map.set(acc.id, acc)
    }
    return map
  }, [allAccesoriosQuery.data])

  const detallesQuery = useQuery({
    ...controlActivoQueries.detallesList({ controlActivoId: control.id }),
    enabled: expanded,
  })

  const detalles = detallesQuery.data?.content ?? []
  const isEntrega = control.tipo === "ENTREGA"

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 shadow-2xs overflow-hidden transition-all hover:border-primary/40">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 select-none"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Badge Icon */}
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-2xs border",
              isEntrega
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
            )}
          >
            {isEntrega ? "ENT" : "DEV"}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-xs sm:text-sm text-foreground">
                Acta de {isEntrega ? "Entrega de Activo" : "Devolución de Activo"}
              </span>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide",
                  control.conforme
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                )}
              >
                {control.conforme ? (
                  <CheckCircle2 className="size-3 mr-1 text-emerald-500 inline" />
                ) : (
                  <AlertTriangle className="size-3 mr-1 text-amber-500 inline" />
                )}
                {control.conforme ? "Conforme" : "Con Observaciones"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
              {control.activo && (
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <Box className="size-3 text-sky-500 shrink-0" />
                  <span className="font-semibold text-foreground truncate">
                    {control.activo.codigo}
                  </span>
                  <span className="truncate">({control.activo.nombre})</span>
                </div>
              )}

              {control.entregadoPor && (
                <>
                  <span className="text-muted-foreground/40 font-bold">•</span>
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <User className="size-3 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Entregó: <strong className="text-foreground">{control.entregadoPor.nombre}</strong></span>
                  </div>
                </>
              )}

              {control.recibidoPor && (
                <>
                  <span className="text-muted-foreground/40 font-bold">•</span>
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <User className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Recibió: <strong className="text-foreground">{control.recibidoPor.nombre}</strong></span>
                  </div>
                </>
              )}
            </div>

            {control.observacion && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                Obs: {control.observacion}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
            <Calendar className="size-3" />
            <span>{formatDate(control.fecha)}</span>
          </div>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              navigate({
                to: routes.mantenimientos.controlesActivos.nuevo,
                search: {
                  id: control.id,
                  solicitudId: control.solicitudMantenimientoId,
                  tipo: control.tipo,
                },
              })
            }}
            className="h-7 text-xs font-semibold gap-1 px-2 hover:bg-muted"
            title="Editar acta de control"
          >
            <Edit2 className="size-3 text-muted-foreground" />
            <span className="hidden sm:inline">Editar</span>
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-7 text-xs font-semibold gap-1 px-2"
          >
            <Package className="size-3.5 text-primary" />
            <span>{expanded ? "Ocultar" : "Accesorios"}</span>
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(control.id)
            }}
            className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title="Eliminar acta de control"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded Accessories Verification */}
      {expanded && (
        <div className="border-t bg-muted/30 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" />
              Accesorios Verificados en el Acta
            </h4>
          </div>

          {detallesQuery.isLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <span>Cargando verificación de accesorios...</span>
            </div>
          ) : detalles.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">
              No se detallaron accesorios específicos en este control.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {detalles.map((det) => {
                const accInfo = accesorioMap.get(det.accesorioId || det.accesorio?.id || "")
                const codigo = det.accesorio?.codigo || accInfo?.codigo || "ACC"
                const nombre = det.accesorio?.nombre || accInfo?.nombre || "Accesorio"

                return (
                  <div
                    key={det.id}
                    className="rounded-lg border bg-card p-2 text-xs shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1 py-0.2 rounded shrink-0">
                          {codigo}
                        </span>
                        <span className="font-semibold text-foreground truncate text-[11px]" title={nombre}>
                          {nombre}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1 py-0 font-bold shrink-0",
                          det.conforme
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                        )}
                      >
                        {det.conforme ? "OK" : "NO OK"}
                      </Badge>
                    </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-1">
                    <span>Esp: <strong className="text-foreground">{det.cantidadEsperada}</strong></span>
                    <span>Enc: <strong className="text-foreground">{det.cantidadEncontrada}</strong></span>
                  </div>

                  {det.observacion && (
                    <p className="text-[10px] text-muted-foreground italic bg-muted/40 p-1 rounded line-clamp-2">
                      Obs: {det.observacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
