import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Clock,
  FilterX,
  Layers,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"
import { flotaQueries } from "../../flota-vehicular/api/flota.queries"

const PERIODO_OPTIONS = [
  { value: "1", label: "Último mes" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
] as const

interface FlotaOption {
  id: string
  codigo: string
  nombre: string
  isAll?: boolean
}

const ALL_FLOTAS_OPTION: FlotaOption = {
  id: "all",
  codigo: "",
  nombre: "Todas las flotas",
  isAll: true,
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function formatFlotaLabel(item: FlotaOption | null): string {
  if (!item) return ""
  return item.codigo ? `${item.codigo} · ${item.nombre}` : item.nombre
}

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
  const { data: flotasActivas = [], isLoading: isLoadingFlotas } = useQuery(
    flotaQueries.activas()
  )

  const flotaOptions = useMemo<FlotaOption[]>(() => {
    const items: FlotaOption[] = flotasActivas.map((f) => ({
      id: f.id,
      codigo: f.codigo,
      nombre: f.nombre,
    }))
    return [ALL_FLOTAS_OPTION, ...items]
  }, [flotasActivas])

  const selectedFlotaOption = useMemo<FlotaOption | null>(() => {
    if (!flotaId) return null
    return flotaOptions.find((f) => f.id === flotaId) ?? null
  }, [flotaOptions, flotaId])

  const selectedPeriodoLabel = useMemo(
    () =>
      PERIODO_OPTIONS.find((opt) => opt.value === String(meses))?.label ??
      `Últimos ${meses} meses`,
    [meses]
  )

  const activeFiltersCount = (flotaId ? 1 : 0) + (meses !== 6 ? 1 : 0)
  const hasActiveFilters = activeFiltersCount > 0

  const formatHora = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-3.5 pb-4 border-b border-border/60">
      {/* Fila superior: Título y control de actualización */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs shrink-0">
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

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono border border-border/50">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span>Actualizado: {formatHora(lastUpdated)}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-9 px-3 gap-1.5 text-xs font-medium rounded-lg border-border/70 bg-background hover:bg-muted/50 shadow-2xs"
            title="Recargar métricas desde la API"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-cyan-500")}
            />
            <span>{isFetching ? "Actualizando..." : "Actualizar"}</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 rounded-xl border border-border/60 bg-card/70 px-3.5 py-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-1 min-w-0">
          {/* 1. Autocomplete de Flota Vehicular */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 sm:max-w-[440px]">
            <label
              htmlFor="dashboard-flota-autocomplete"
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
            >
              <Layers
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  flotaId
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-muted-foreground"
                )}
              />
              <span>Flota vehicular</span>
              {flotaId && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] font-medium bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20"
                >
                  Activa
                </Badge>
              )}
            </label>

            <Combobox<FlotaOption>
              items={flotaOptions}
              value={selectedFlotaOption}
              itemToStringLabel={formatFlotaLabel}
              itemToStringValue={(item) => item?.id ?? ""}
              filter={(item, query) => {
                const q = normalizeSearch(query)
                if (!q) return true
                if (item.isAll) {
                  return normalizeSearch(item.nombre).includes(q)
                }
                return (
                  normalizeSearch(item.codigo).includes(q) ||
                  normalizeSearch(item.nombre).includes(q) ||
                  normalizeSearch(`${item.codigo} ${item.nombre}`).includes(q)
                )
              }}
              onValueChange={(item) => {
                onFlotaChange(!item || item.isAll ? undefined : item.id)
              }}
              disabled={isLoadingFlotas}
            >
              <ComboboxInput
                id="dashboard-flota-autocomplete"
                aria-label="Buscar y filtrar por flota vehicular"
                placeholder={
                  isLoadingFlotas
                    ? "Cargando flotas..."
                    : "Todas las flotas (escriba para buscar...)"
                }
                title={
                  selectedFlotaOption
                    ? formatFlotaLabel(selectedFlotaOption)
                    : "Todas las flotas"
                }
                showTrigger
                showClear={Boolean(flotaId)}
                className={cn(
                  "h-9 w-full rounded-lg bg-background text-xs font-medium shadow-2xs transition-all",
                  "border-border/70 hover:border-cyan-500/50 focus-within:border-cyan-500/60",
                  flotaId && "border-cyan-500/50 bg-cyan-500/[0.04]"
                )}
              />

              <ComboboxContent
                align="start"
                sideOffset={6}
                className="z-50 w-auto min-w-(--anchor-width) max-w-[min(92vw,520px)] rounded-xl border border-border/80 bg-popover p-1 shadow-lg"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  Flotas activas ({flotasActivas.length})
                </div>

                <ComboboxEmpty className="py-5 px-3 text-xs text-muted-foreground text-center">
                  No se encontraron flotas coincidentes.
                </ComboboxEmpty>

                <ComboboxList className="max-h-64 overflow-y-auto overscroll-contain p-1">
                  {(item: FlotaOption) => (
                    <ComboboxItem
                      key={item.id}
                      value={item}
                      className="cursor-pointer py-2 px-2.5 pr-8 rounded-lg text-xs items-start"
                    >
                      {item.isAll ? (
                        <span className="font-medium text-foreground whitespace-normal leading-snug">
                          {item.nombre}
                        </span>
                      ) : (
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shrink-0 mt-0.5">
                            {item.codigo}
                          </span>
                          <span className="font-medium text-foreground whitespace-normal break-words leading-snug">
                            {item.nombre}
                          </span>
                        </div>
                      )}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* 2. Selector de Periodo (ancho completo al texto sin cortes) */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto shrink-0">
            <label
              htmlFor="dashboard-periodo-select"
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
            >
              <Calendar
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  meses !== 6
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                )}
              />
              <span>Periodo</span>
            </label>

            <Select
              value={String(meses)}
              onValueChange={(val) => {
                if (val) onMesesChange(Number(val))
              }}
            >
              <SelectTrigger
                id="dashboard-periodo-select"
                aria-label="Filtrar por periodo"
                className={cn(
                  "h-9 w-full sm:w-auto sm:min-w-[205px] rounded-lg bg-background px-3 text-xs font-medium shadow-2xs transition-all whitespace-nowrap",
                  "border-border/70 hover:border-blue-500/50 hover:bg-muted/20 focus-visible:border-blue-500/60",
                  "*:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:overflow-visible",
                  meses !== 6 && "border-blue-500/50 bg-blue-500/[0.04]"
                )}
              >
                <SelectValue className="whitespace-nowrap font-medium text-foreground">
                  {selectedPeriodoLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="w-auto min-w-[215px] p-1"
              >
                <SelectGroup>
                  <SelectLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rango temporal
                  </SelectLabel>
                  {PERIODO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs py-2 px-2.5 pr-8 rounded-md whitespace-nowrap"
                    >
                      <span className="font-medium whitespace-nowrap">
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón Reset si hay filtros aplicados */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-3 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-end shrink-0"
          >
            <FilterX className="h-3.5 w-3.5" />
            <span>Limpiar filtros ({activeFiltersCount})</span>
          </Button>
        )}
      </div>
    </div>
  )
}
