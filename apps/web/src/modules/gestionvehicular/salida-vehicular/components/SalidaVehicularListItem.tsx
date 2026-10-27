import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  Ban,
  Calendar,
  Car,
  ChevronRight,
  Eye,
  FileText,
  History,
  Quote,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { SalidaVehicularStatusBadge } from "./SalidaVehicularStatusBadge"
import { getSalidaNextActionConfig } from "./salida-action.utils"

export interface SalidaVehicularListItemProps {
  salida: SalidaVehicular
  onExecuteAction?: (salida: SalidaVehicular) => void
  onAddBitacora?: (salida: SalidaVehicular) => void
  onCancel?: (salida: SalidaVehicular) => void
  onTraceability?: (salida: SalidaVehicular) => void
  className?: string
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "S/F"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "CD"
  const clean = name.trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function SalidaVehicularListItem({
  salida,
  onExecuteAction,
  onAddBitacora,
  onCancel,
  onTraceability,
  className,
}: SalidaVehicularListItemProps) {
  const navigate = useNavigate()

  const estadoNorm = (salida.estado ?? "").trim().toUpperCase()
  const isFinalizado = estadoNorm.includes("FINALIZ") || estadoNorm.includes("COMPLET")
  const isCancelado = estadoNorm.includes("CANCEL") || estadoNorm.includes("ANULAD")
  const isInactive = isFinalizado || isCancelado

  const nextAction = getSalidaNextActionConfig(salida.estado, salida.destino)
  const ActionIcon = nextAction.icon

  const vehiculoTexto = salida.marca
    ? `${salida.marca} ${salida.modelo ?? ""}`.trim()
    : salida.activoDescripcion ?? "Vehículo Asignado"

  const placaTexto = salida.placa ?? salida.activoCodigo ?? "S/P"
  const bitacorasCount = salida.bitacoras?.length ?? 0

  const handleNavigateDetail = () => {
    void navigate({
      to: "/gestion-vehicular/salidas/$salidaId",
      params: { salidaId: salida.id },
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigateDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleNavigateDetail()
        }
      }}
      className={cn(
        "group relative rounded-xl border border-border/70 bg-card hover:bg-card/95 hover:border-primary/40 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200 space-y-3 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isFinalizado && "border-l-3.5 border-l-emerald-500",
        isCancelado && "border-l-3.5 border-l-rose-500 opacity-90",
        !isInactive && "border-l-3.5 border-l-primary",
        className
      )}
    >
      {/* 1. CABECERA: Folio, Estado, Fecha y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNavigateDetail()
            }}
            className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer shadow-2xs"
            title="Ir al detalle"
          >
            {salida.numero}
          </button>

          <SalidaVehicularStatusBadge status={salida.estado} />

          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-1">
            <Calendar className="size-3 text-muted-foreground/70" />
            <span>{formatDate(salida.createdAt)}</span>
          </span>

          {bitacorasCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[10.5px] font-medium border border-indigo-500/20 shadow-2xs"
              title={`${bitacorasCount} bitácoras registradas`}
            >
              <Activity className="size-2.5" />
              <span>{bitacorasCount} bitácora{bitacorasCount > 1 ? "s" : ""}</span>
            </span>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {onTraceability && salida.processInstanceId && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onTraceability(salida)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs cursor-pointer"
              title="Ver trazabilidad de Flowable BPMN"
            >
              <History className="size-3 text-blue-600 dark:text-blue-400" />
              <span className="hidden xs:inline-block">Trazabilidad</span>
            </Button>
          )}

          {!isInactive && onExecuteAction && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onExecuteAction(salida)
              }}
              className={cn(
                "group/btn relative h-6.5 gap-1.5 px-2.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]",
                nextAction.buttonClassName
              )}
              title={nextAction.title}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full animate-pulse shrink-0",
                  nextAction.dotClassName
                )}
              />
              <ActionIcon className={cn("shrink-0", nextAction.iconClassName)} />
              <span>{nextAction.label}</span>
            </Button>
          )}

          {!isCancelado && onAddBitacora && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAddBitacora(salida)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs cursor-pointer"
              title="Consultar bitácora en tiempo real"
            >
              <FileText className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xs:inline-block">Bitácora</span>
            </Button>
          )}

          {!isInactive && onCancel && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onCancel(salida)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-2xs cursor-pointer"
              title="Cancelar salida vehicular"
            >
              <Ban className="size-3 text-rose-600 dark:text-rose-400" />
              <span className="hidden xs:inline-block">Cancelar</span>
            </Button>
          )}

          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              handleNavigateDetail()
            }}
            className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer"
            title="Ver detalle completo"
          >
            <Eye className="size-3" />
            <span className="hidden sm:inline-block">Ver Detalle</span>
            <ChevronRight className="size-2.5 ml-0.5 opacity-60" />
          </Button>
        </div>
      </div>

      {/* 2. CUERPO: Ruta + Vehículo + Conductor en Layout limpio sin cajas ni bordes internos */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 items-center">
        {/* Ruta: Origen -> Destino con timeline visual fluido (5 cols) */}
        <div className="md:col-span-5 flex items-center gap-3 min-w-0">
          <div className="flex flex-col items-center shrink-0">
            <span
              className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"
              title="Punto de partida"
            />
            <div className="w-0.5 h-3.5 my-0.5 bg-gradient-to-b from-emerald-500/50 via-border to-indigo-500/50" />
            <span
              className="size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"
              title="Punto de destino"
            />
          </div>

          <div className="flex flex-col justify-between gap-1 min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 shrink-0">
                Origen:
              </span>
              <span
                className="text-xs font-semibold text-foreground truncate"
                title={salida.origen ?? "Origen no especificado"}
              >
                {salida.origen || "No especificado"}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                Destino:
              </span>
              <span
                className="text-xs font-bold text-foreground truncate"
                title={salida.destino ?? "Destino no especificado"}
              >
                {salida.destino || "No especificado"}
              </span>
            </div>
          </div>
        </div>

        {/* Separador vertical sutil en desktop */}
        <div className="hidden md:block w-px h-9 self-center bg-border/40" />

        {/* Vehículo Asignado (4 cols en md) */}
        <div className="md:col-span-4 flex items-center gap-3 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Car className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-bold text-foreground tracking-wide">
                {placaTexto}
              </span>
              {salida.activoCodigo && salida.activoCodigo !== placaTexto && (
                <span className="text-[10px] text-muted-foreground/75 font-mono">
                  ({salida.activoCodigo})
                </span>
              )}
            </div>
            <p
              className="text-[11.5px] text-muted-foreground truncate"
              title={vehiculoTexto}
            >
              {vehiculoTexto}
            </p>
          </div>
        </div>

        {/* Separador vertical sutil en desktop */}
        <div className="hidden md:block w-px h-9 self-center bg-border/40" />

        {/* Conductor asignado (restantes cols) */}
        <div className="md:col-span-2 md:flex-1 flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px] ring-1 ring-primary/20">
            {getInitials(salida.empleadoNombre)}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold text-foreground truncate"
              title={salida.empleadoNombre ?? "Sin conductor"}
            >
              {salida.empleadoNombre ?? "Sin conductor"}
            </p>
            {salida.empleadoCodigo ? (
              <p className="text-[10px] text-muted-foreground/80 font-mono">
                Cod: {salida.empleadoCodigo}
              </p>
            ) : (
              <p className="text-[10.5px] text-muted-foreground/60">
                Chofer designado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Motivo del traslado / comisión - Limpio sin caja gris ni bordes */}
      {salida.motivo && (
        <div className="flex items-start gap-2 pt-2 border-t border-border/40 text-xs">
          <Quote className="size-3 text-muted-foreground/50 shrink-0 mt-0.5" />
          <p
            className="text-[11.5px] text-muted-foreground line-clamp-1 italic leading-relaxed"
            title={salida.motivo}
          >
            <span className="font-medium not-italic text-foreground/80 mr-1.5">
              Motivo:
            </span>
            {salida.motivo}
          </p>
        </div>
      )}
    </div>
  )
}

export function SalidaVehicularListItemSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 space-y-3 animate-pulse shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-md bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-16 rounded bg-muted" />
          <div className="h-6 w-20 rounded bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 items-center">
        <div className="md:col-span-5 flex items-center gap-3">
          <div className="w-2 h-9 rounded-full bg-muted/60" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-muted/60" />
            <div className="h-3.5 w-1/2 rounded bg-muted/60" />
          </div>
        </div>
        <div className="hidden md:block w-px h-9 bg-border/40" />
        <div className="md:col-span-4 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-muted/60" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-3 w-32 rounded bg-muted/40" />
          </div>
        </div>
        <div className="hidden md:block w-px h-9 bg-border/40" />
        <div className="md:col-span-2 flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-muted/60" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-3 w-16 rounded bg-muted/40" />
          </div>
        </div>
      </div>

      <div className="h-3.5 w-2/3 rounded bg-muted/30 pt-1" />
    </div>
  )
}
