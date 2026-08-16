import { MapPin, RotateCcw, Tag } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export const ALL_TIPOS = "__all__"
export const ALL_UBICACIONES = "__all__"

interface ActivoCatalogoToolbarProps {
  search: string
  onSearchChange: (val: string) => void
  tipoActivoId: string
  onTipoActivoChange: (val: string) => void
  ubicacionId: string
  onUbicacionChange: (val: string) => void
  tipos: TipoActivo[]
  ubicaciones: Ubicacion[]
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function ActivoCatalogoToolbar({
  search,
  onSearchChange,
  tipoActivoId,
  onTipoActivoChange,
  ubicacionId,
  onUbicacionChange,
  tipos,
  ubicaciones,
  hasActiveFilters,
  onResetFilters,
}: ActivoCatalogoToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar activo por código, nombre o descripción..."
          className="flex-1"
        />

        {/* Tipo de Activo selector */}
        <Select value={tipoActivoId} onValueChange={onTipoActivoChange}>
          <SelectTrigger className="w-full sm:w-52 h-8.5 text-xs">
            <Tag className="size-3.5 text-muted-foreground mr-1.5" />
            <SelectValue placeholder="Tipo de activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ubicacion selector */}
        <Select value={ubicacionId} onValueChange={onUbicacionChange}>
          <SelectTrigger className="w-full sm:w-52 h-8.5 text-xs">
            <MapPin className="size-3.5 text-muted-foreground mr-1.5" />
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_UBICACIONES}>Todas las ubicaciones</SelectItem>
            {ubicaciones.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          size="sm"
          variant="outline"
          onClick={onResetFilters}
          className="h-8.5 text-xs shrink-0"
        >
          <RotateCcw className="size-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
