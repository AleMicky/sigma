import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  Box,
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  Copy,
  Eye,
  History,
  ListTodo,
  Paperclip,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { ordenTrabajoQueries } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.queries"
import type { OrdenTrabajo } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.service"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../../lib/solicitud.utils"

type SolicitudAprobacionListItemProps = {
  solicitud: SolicitudMantenimiento
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onViewTrazabilidad?: (solicitud: SolicitudMantenimiento) => void
  onWorkflowEvaluar?: (solicitud: SolicitudMantenimiento) => void
  onCreateOT?: (solicitud: SolicitudMantenimiento) => void
  showControlActivo?: boolean
  onViewControlActivo?: (solicitud: SolicitudMantenimiento) => void
  onViewOT?: (solicitud: SolicitudMantenimiento, ot?: OrdenTrabajo | null) => void
}

function getInitials(name?: string | null): string {
  if (!name) return "US"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function SolicitudAprobacionListItem({
  solicitud,
  onQuickView,
  onViewTrazabilidad,
  onWorkflowEvaluar,
  onCreateOT,
  showControlActivo,
  onViewControlActivo,
  onViewOT,
}: SolicitudAprobacionListItemProps) {
  const [copied, setCopied] = useState(false)

  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isSolicitado = !solicitud.estado || estadoNorm === "solicitado"
  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4

  const prioridadStyle = getPrioridadBadgeStyles(
    solicitud.prioridad?.nivel ?? 1,
  )
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  // Flow step verification for Encargado
  const controlesQuery = useQuery({
    ...controlActivoQueries.list({ size: 100 }),
    enabled: Boolean(showControlActivo),
  })

  const ordenesQuery = useQuery({
    ...ordenTrabajoQueries.list({ size: 100 }),
    enabled: Boolean(showControlActivo),
  })

  const hasControlActivo =
    !showControlActivo ||
    Boolean(
      controlesQuery.data?.content?.some(
        (c) => c.solicitudMantenimientoId === solicitud.id,
      ),
    )

  const hasOrdenTrabajo =
    !showControlActivo ||
    Boolean(
      ordenesQuery.data?.content?.some(
        (ot) => ot.solicitudMantenimientoId === solicitud.id,
      ),
    )

  const matchingOT = ordenesQuery.data?.content?.find(
    (ot) => ot.solicitudMantenimientoId === solicitud.id,
  )

  const isValidado = estadoNorm === "validado"
  const isTrabajoRealizado = estadoNorm === "trabajo_realizado"

  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(matchingOT?.id ?? ""),
    enabled: Boolean(matchingOT?.id && showControlActivo),
  })

  const actividades = actividadesQuery.data?.content ?? []
  const totalActividades = actividades.length
  const completadasCount = actividades.filter((a) => a.realizado).length

  const hasDevolucion = Boolean(
    controlesQuery.data?.content?.some(
      (c) =>
        c.solicitudMantenimientoId === solicitud.id &&
        c.tipo === "DEVOLUCION",
    ),
  )

  function copyNumero(e: React.MouseEvent) {
    e.stopPropagation()
    if (!solicitud.numero) return
    navigator.clipboard.writeText(solicitud.numero)
    setCopied(true)
    toast.success(`Folio "${solicitud.numero}" copiado`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-2.5 sm:py-2.5 sm:px-3.5 transition-all duration-200 cursor-pointer border-l-4 hover:bg-muted/40 select-none",
        isCritica
          ? "border-l-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]"
          : "border-l-amber-500 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]",
      )}
    >
      {/* Left / Main info */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Top Badges Line */}
        <div className="flex flex-wrap items-center gap-1.5">
          {solicitud.numero ? (
            <div
              onClick={copyNumero}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-foreground border border-border/80 hover:border-primary/50 transition-colors cursor-pointer shadow-2xs"
              title="Copiar folio"
            >
              <span>{solicitud.numero}</span>
              {copied ? (
                <Check className="size-2.5 text-emerald-500" />
              ) : (
                <Copy className="size-2.5 opacity-60" />
              )}
            </div>
          ) : null}

          {/* Estado Badge */}
          {isSolicitado ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
              </span>
              <span>Por Aprobar</span>
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                getEstadoBadgeStyles(solicitud.estado),
              )}
            >
              {solicitud.estado}
            </span>
          )}

          {/* Prioridad */}
          {solicitud.prioridad ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border shrink-0",
                prioridadStyle,
              )}
            >
              {isCritica && (
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
              <span>{solicitud.prioridad.nombre}</span>
            </span>
          ) : null}

          {/* Tipo Mantenimiento */}
          {solicitud.tipoMantenimiento ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0",
                getTipoMantenimientoBadgeClass(
                  solicitud.tipoMantenimiento.nombre,
                  false,
                ),
              )}
            >
              <Wrench className="size-2.5" />
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          ) : null}

          {/* Tipo de Falla / Síntomas (si existe) */}
          {solicitud.tipoFallas ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-[200px]">
              <AlertTriangle className="size-2.5 shrink-0" />
              <span className="truncate">{solicitud.tipoFallas}</span>
            </span>
          ) : null}
        </div>

        {/* Title and Short Description */}
        <div className="space-y-0.5 min-w-0">
          <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {solicitud.titulo}
          </h3>
          {solicitud.descripcion && (
            <p className="text-[11.5px] text-muted-foreground line-clamp-1">
              {solicitud.descripcion}
            </p>
          )}
        </div>

        {/* Details Line */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground">
          {solicitud.activo && (
            <div className="flex items-center gap-1.5 truncate max-w-[260px]">
              <Box className="size-3 text-primary shrink-0 opacity-80" />
              <span className="font-mono font-bold text-primary text-[11px]">
                {solicitud.activo.codigo}
              </span>
              <span className="truncate text-foreground font-medium">
                {solicitud.activo.nombre}
              </span>
            </div>
          )}

          {solicitud.solicitante && (
            <div className="flex items-center gap-1.5 truncate">
              <div className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[8.5px] shrink-0 border border-primary/20">
                {getInitials(solicitud.solicitante.nombre)}
              </div>
              <span className="truncate">
                Solicitante: <strong className="text-foreground font-medium">{solicitud.solicitante.nombre}</strong>
              </span>
            </div>
          )}

          {solicitud.fechaSolicitud && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3 opacity-70" />
              <span>{formatDateTime(solicitud.fechaSolicitud)}</span>
            </div>
          )}

          {solicitud.fechaEstimadaOt && (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium shrink-0">
              <Clock className="size-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong></span>
            </div>
          )}

          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/15 text-[10.5px]">
              <Paperclip className="size-2.5" />
              <span>{adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right / Icon Actions Section */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 shrink-0 self-end md:self-center pt-1 md:pt-0"
      >
        {/* 1. Control de Activo (Entrega / Devolución) */}
        {showControlActivo && (
          isTrabajoRealizado ? (
            hasDevolucion ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewControlActivo?.(solicitud)
                }}
                className="size-7.5 rounded-lg shadow-2xs cursor-pointer transition-all bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                title="Devolución de Activo registrada (Ver acta)"
              >
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </Button>
            ) : (
              <Link
                to="/mantenimientos/controles-activos/nuevo"
                search={{ solicitudId: solicitud.id, tipo: "DEVOLUCION" }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-7.5 rounded-lg shadow-2xs cursor-pointer transition-all bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25 ring-1 ring-amber-500/30"
                  title="Paso requerido: Registrar acta de devolución de activo"
                >
                  <ClipboardCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
                </Button>
              </Link>
            )
          ) : hasControlActivo ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onViewControlActivo?.(solicitud)
              }}
              className="size-7.5 rounded-lg shadow-2xs cursor-pointer transition-all bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
              title="Control de Activo registrado (Ver acta)"
            >
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            </Button>
          ) : (
            <Link
              to="/mantenimientos/controles-activos/nuevo"
              search={{ solicitudId: solicitud.id }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-7.5 rounded-lg shadow-2xs cursor-pointer transition-all bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40 hover:bg-sky-500/25 ring-1 ring-sky-500/30"
                title="Paso 1: Registrar acta de entrega/control de activo (Requerido)"
              >
                <ClipboardCheck className="size-3.5 text-sky-600 dark:text-sky-400" />
              </Button>
            </Link>
          )
        )}

        {/* 2. Crear / Gestionar Orden de Trabajo */}
        {onCreateOT && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={!hasControlActivo}
            onClick={(e) => {
              e.stopPropagation()
              if (!hasControlActivo) {
                toast.warning(
                  "Paso 1 requerido: Primero debes registrar el Control de Activo.",
                )
                return
              }
              if (hasOrdenTrabajo) {
                onViewOT?.(solicitud, matchingOT)
              } else {
                onCreateOT(solicitud)
              }
            }}
            className={cn(
              "size-7.5 rounded-lg shadow-2xs transition-all",
              !hasControlActivo
                ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border/60"
                : hasOrdenTrabajo
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50 cursor-pointer"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-xs cursor-pointer ring-1 ring-indigo-500/30",
            )}
            title={
              !hasControlActivo
                ? "Paso 2 bloqueado: Primero registra el Control de Activo"
                : hasOrdenTrabajo
                  ? `Orden de Trabajo (${completadasCount}/${totalActividades} tareas)`
                  : "Paso 2: Crear Orden de Trabajo"
            }
          >
            {hasOrdenTrabajo ? (
              isValidado || estadoNorm === "en_mantenimiento" ? (
                <ListTodo className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Check className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              )
            ) : (
              <Wrench
                className={cn(
                  "size-3.5",
                  hasControlActivo && !hasOrdenTrabajo
                    ? "text-white"
                    : "text-indigo-600 dark:text-indigo-400",
                )}
              />
            )}
          </Button>
        )}

        {/* 3. Trazabilidad / Historial de Workflow */}
        {onViewTrazabilidad && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onViewTrazabilidad(solicitud)
            }}
            className="size-7.5 rounded-lg shadow-2xs hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-500/40 cursor-pointer"
            title="Ver Trazabilidad y Línea de Tiempo del Workflow"
          >
            <History className="size-3.5 text-muted-foreground hover:text-sky-600" />
          </Button>
        )}

        {/* 4. Formulario / Evaluar Workflow (Abre directamente las decisiones de flujo) */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            if (onWorkflowEvaluar) {
              onWorkflowEvaluar(solicitud)
            } else {
              onQuickView(solicitud)
            }
          }}
          className="size-7.5 rounded-lg shadow-2xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 cursor-pointer"
          title="Evaluar / Decisiones de Workflow"
        >
          <ShieldCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
        </Button>

        {/* 5. Ver Expediente Completo */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => onQuickView(solicitud)}
          className="size-7.5 rounded-lg shadow-2xs bg-primary/5 hover:bg-primary/15 text-primary border-primary/25 cursor-pointer"
          title="Ver Expediente Completo"
        >
          <Eye className="size-3.5 text-primary" />
        </Button>
      </div>
    </li>
  )
}
