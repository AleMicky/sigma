import { RotateCcw, Search } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

interface IncidenteFiltrosBarProps {
  search: string
  onSearchChange: (value: string) => void
  prioridad: string
  onPrioridadChange: (value: string) => void
  estado: string
  onEstadoChange: (value: string) => void
  tipoIncidente: string
  onTipoIncidenteChange: (value: string) => void
  onReset: () => void
}

export function IncidenteFiltrosBar({
  search,
  onSearchChange,
  prioridad,
  onPrioridadChange,
  estado,
  onEstadoChange,
  tipoIncidente,
  onTipoIncidenteChange,
  onReset,
}: IncidenteFiltrosBarProps) {
  const hasActiveFilters = Boolean(search || prioridad || estado || tipoIncidente)

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descripción, tipo o ubicación…"
            className="pl-9 h-10 bg-background"
          />
        </div>

        {/* Filtro de Estado */}
        <div className="w-full md:w-44">
          <Select
            value={estado || "ALL"}
            onValueChange={(val: string | null) => onEstadoChange(val === "ALL" || !val ? "" : val)}
          >
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="REGISTRADO">Registrado</SelectItem>
              <SelectItem value="REVISION">En Revisión</SelectItem>
              <SelectItem value="EN_ATENCION">En Atención</SelectItem>
              <SelectItem value="VALIDACION">En Validación</SelectItem>
              <SelectItem value="EN_CIERRE">En Cierre</SelectItem>
              <SelectItem value="CERRADO">Cerrado</SelectItem>
              <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Prioridad */}
        <div className="w-full md:w-40">
          <Select
            value={prioridad || "ALL"}
            onValueChange={(val: string | null) => onPrioridadChange(val === "ALL" || !val ? "" : val)}
          >
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las prioridades</SelectItem>
              <SelectItem value="BAJA">Baja</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="CRITICA">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Tipo */}
        <div className="w-full md:w-48">
          <Select
            value={tipoIncidente || "ALL"}
            onValueChange={(val: string | null) => onTipoIncidenteChange(val === "ALL" || !val ? "" : val)}
          >
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Tipo de incidente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="COLISION">Colisión / Choque</SelectItem>
              <SelectItem value="FALLA_MECANICA">Falla Mecánica Grave</SelectItem>
              <SelectItem value="ROBO_HURTO">Robo / Pérdida</SelectItem>
              <SelectItem value="DANO_MATERIAL">Daño Material / Vandalismo</SelectItem>
              <SelectItem value="ACCIDENTE_LABORAL">Accidente Laboral</SelectItem>
              <SelectItem value="OTRO">Otro Siniestro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
