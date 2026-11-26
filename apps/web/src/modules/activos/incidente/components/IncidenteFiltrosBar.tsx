import { RotateCcw, Search } from "lucide-react"

import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

const ESTADO_OPTIONS: OptionsComboboxOption[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "REGISTRADO", label: "Registrado" },
  { value: "REVISION", label: "En Revisión" },
  { value: "EN_ATENCION", label: "En Atención" },
  { value: "VALIDACION", label: "En Validación" },
  { value: "EN_CIERRE", label: "En Cierre" },
  { value: "CERRADO", label: "Cerrado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "CANCELADO", label: "Cancelado" },
]

const PRIORIDAD_OPTIONS: OptionsComboboxOption[] = [
  { value: "ALL", label: "Todas las prioridades" },
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
]

const TIPO_INCIDENTE_OPTIONS: OptionsComboboxOption[] = [
  { value: "ALL", label: "Todos los tipos" },
  { value: "COLISION", label: "Colisión / Choque" },
  { value: "FALLA_MECANICA", label: "Falla Mecánica Grave" },
  { value: "ROBO_HURTO", label: "Robo / Pérdida" },
  { value: "DANO_MATERIAL", label: "Daño Material / Vandalismo" },
  { value: "ACCIDENTE_LABORAL", label: "Accidente Laboral" },
  { value: "OTRO", label: "Otro Siniestro" },
]

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
          <OptionsCombobox
            options={ESTADO_OPTIONS}
            value={estado || "ALL"}
            onValueChange={(val) => onEstadoChange(val === "ALL" || !val ? "" : val)}
            placeholder="Estado"
            ariaLabel="Estado"
            size="sm"
            className="w-full"
          />
        </div>

        {/* Filtro de Prioridad */}
        <div className="w-full md:w-40">
          <OptionsCombobox
            options={PRIORIDAD_OPTIONS}
            value={prioridad || "ALL"}
            onValueChange={(val) => onPrioridadChange(val === "ALL" || !val ? "" : val)}
            placeholder="Prioridad"
            ariaLabel="Prioridad"
            size="sm"
            className="w-full"
          />
        </div>

        {/* Filtro de Tipo */}
        <div className="w-full md:w-48">
          <OptionsCombobox
            options={TIPO_INCIDENTE_OPTIONS}
            value={tipoIncidente || "ALL"}
            onValueChange={(val) =>
              onTipoIncidenteChange(val === "ALL" || !val ? "" : val)
            }
            placeholder="Tipo de incidente"
            ariaLabel="Tipo de incidente"
            size="sm"
            className="w-full"
          />
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
