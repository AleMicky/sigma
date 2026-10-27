import { BarChart3, Car, Plus, RotateCw, Search, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

interface SalidaVehicularFiltrosBarProps {
  search: string
  onSearchChange: (value: string) => void
  estadoFilter: string
  onEstadoFilterChange: (value: string) => void
  onReset: () => void
  onRefresh: () => void
  onOpenCreate: () => void
  isFetching?: boolean
}

const ESTADOS_DISPONIBLES = [
  { value: "ALL", label: "Todos los estados" },
  { value: "INICIADO", label: "Iniciado / Salida" },
  { value: "EN_TRANSITO", label: "En Tránsito / Destino" },
  { value: "RETORNO", label: "Retorno" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
]

export function SalidaVehicularFiltrosBar({
  search,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  onReset,
  onRefresh,
  onOpenCreate,
  isFetching = false,
}: SalidaVehicularFiltrosBarProps) {
  const navigate = useNavigate()
  const hasActiveFilters = search.trim().length > 0 || estadoFilter !== "ALL"

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-card/60 backdrop-blur-xs p-3 rounded-xl border shadow-xs">
      {/* Filters Left */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por placa, conductor, destino..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={estadoFilter} onValueChange={(val) => onEstadoFilterChange(val ?? "ALL")}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Estado de Salida" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_DISPONIBLES.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-xs">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Actions Right */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          title="Actualizar datos"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void navigate({
              to: "/gestion-vehicular/reportes/salidas-vehiculares",
            })
          }
          className="h-9 text-xs gap-1.5"
        >
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          Reportes
        </Button>

        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-9 text-xs font-semibold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Car className="h-4 w-4" />
          <Plus className="h-3.5 w-3.5 -ml-1" />
          Nueva Salida
        </Button>
      </div>
    </div>
  )
}
