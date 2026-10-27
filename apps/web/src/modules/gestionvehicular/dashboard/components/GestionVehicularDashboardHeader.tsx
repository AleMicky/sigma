import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  Calendar,
  Clock,
  FilterX,
  Fuel,
  History,
  Layers,
  LayoutDashboard,
  PlusCircle,
  RefreshCw,
  Send,
} from "lucide-react"

import { routes } from "@/app/config"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"
import { flotaQueries } from "../../flota-vehicular/api/flota.queries"

interface GestionVehicularDashboardHeaderProps {
  meses: number
  flotaId?: string
  onMesesChange: (meses: number) => void
  onFlotaChange: (flotaId?: string) => void
  onRefresh: () => void
  onResetFilters: () => void
  isFetching?: boolean
  lastUpdated?: Date
}

export const GestionVehicularDashboardHeader = ({
  meses,
  flotaId,
  onMesesChange,
  onFlotaChange,
  onRefresh,
  onResetFilters,
  isFetching,
  lastUpdated,
}: GestionVehicularDashboardHeaderProps) => {
  // Carga reactiva de flotas activas desde la API
  const { data: flotasActivas = [], isLoading: isLoadingFlotas } = useQuery(
    flotaQueries.activas()
  )

  const hasActiveFilters = Boolean(flotaId) || meses !== 6

  const formatHora = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-border/60">
      {/* Fila superior: Título compacto y accesos directos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs shrink-0">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Dashboard de Gestión Vehicular
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                Monitoreo Operativo
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Indicadores consolidados de flota, viajes en ruta, asignaciones y consumo
            </p>
          </div>
        </div>

        {/* Acciones rápidas de acceso */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to={routes.gestionVehicular.nuevaSolicitud}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 text-xs gap-1.5 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
            )}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Nueva Solicitud</span>
          </Link>

          <Link
            to={routes.gestionVehicular.salidas}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Salidas</span>
          </Link>

          <Link
            to={routes.gestionVehicular.reportes.historialViajes}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-2 text-xs gap-1 hidden lg:flex text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-3.5 w-3.5 text-emerald-500" />
            <span>Historial</span>
          </Link>

          <Link
            to={routes.gestionVehicular.reportes.consumoCombustible}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-2 text-xs gap-1 hidden lg:flex text-muted-foreground hover:text-foreground"
            )}
          >
            <Fuel className="h-3.5 w-3.5 text-amber-500" />
            <span>Combustible</span>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros compacta y funcional que consulta a API */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Selector de Flota Vehicular */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-0.5 rounded-lg border border-border/70 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground pl-2 shrink-0">
              <Layers className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              Flota:
            </span>
            <Select
              value={flotaId || "all"}
              onValueChange={(val) => onFlotaChange(!val || val === "all" ? undefined : (val as string))}
              disabled={isLoadingFlotas}
            >
              <SelectTrigger className="h-7 w-[160px] sm:w-[190px] text-xs font-medium bg-background border-border/60">
                <SelectValue placeholder="Todas las flotas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las flotas</SelectItem>
                {flotasActivas.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.codigo} - {f.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Selector de Periodo */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-0.5 rounded-lg border border-border/70 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground pl-2 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Periodo:
            </span>
            <Select
              value={String(meses)}
              onValueChange={(val) => onMesesChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[130px] text-xs font-medium bg-background border-border/60">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último mes</SelectItem>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón Reset si hay filtros aplicados */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <FilterX className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </Button>
          )}
        </div>

        {/* Lado derecho: Estado de actualización y botón de refresco */}
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              <Clock className="h-3 w-3" />
              <span>Actualizado: {formatHora(lastUpdated)}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-7 px-2.5 gap-1.5 text-xs border-border/70"
            title="Recargar métricas desde la API"
          >
            <RefreshCw
              className={cn("h-3 w-3", isFetching && "animate-spin text-cyan-500")}
            />
            <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

