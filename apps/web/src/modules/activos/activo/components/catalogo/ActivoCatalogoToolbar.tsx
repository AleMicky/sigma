import { useMemo } from "react"
import { FileSpreadsheet, Filter, MapPin, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
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
  const tiposById = useMemo(
    () => new Map(tipos.map((t) => [t.id, t])),
    [tipos],
  )

  const ubicacionesById = useMemo(
    () => new Map(ubicaciones.map((u) => [u.id, u])),
    [ubicaciones],
  )

  const selectedTipo =
    tipoActivoId !== ALL_TIPOS ? tiposById.get(tipoActivoId) : null
  const selectedUbicacion =
    ubicacionId !== ALL_UBICACIONES ? ubicacionesById.get(ubicacionId) : null

  function handleExportExcel() {
    toast.info("Exportación a Excel", {
      description:
        "La generación de reportes y exportación en formato Excel (.xlsx) estará disponible próximamente.",
    })
  }

  return (
    <div className="flex shrink-0 flex-col gap-2.5 py-3 sm:py-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        {/* Buscador */}
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar activo por código, nombre o descripción…"
          aria-label="Buscar activos"
          className="w-full md:flex-1 min-w-0"
        />

        {/* Filtros y Exportación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2 shrink-0">
          {/* Tipo de Activo Select */}
          <Select
            value={tipoActivoId}
            onValueChange={(val) => onTipoActivoChange(val ?? ALL_TIPOS)}
          >
            <SelectTrigger
              className="w-full sm:w-full md:w-[190px] h-9 text-xs"
              aria-label="Filtrar por tipo de activo"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todos los tipos">
                  {!selectedTipo ? (
                    "Todos los tipos"
                  ) : (
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            selectedTipo.color || DEFAULT_TIPO_ACTIVO_COLOR,
                        }}
                      />
                      <span className="truncate">{selectedTipo.nombre}</span>
                    </div>
                  )}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: t.color || DEFAULT_TIPO_ACTIVO_COLOR,
                      }}
                    />
                    <span>{t.nombre}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ubicacion Select */}
          <Select
            value={ubicacionId}
            onValueChange={(val) => onUbicacionChange(val ?? ALL_UBICACIONES)}
          >
            <SelectTrigger
              className="w-full sm:w-full md:w-[190px] h-9 text-xs"
              aria-label="Filtrar por ubicación"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todas las ubicaciones">
                  {!selectedUbicacion ? (
                    "Todas las ubicaciones"
                  ) : (
                    <span className="truncate">{selectedUbicacion.nombre}</span>
                  )}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_UBICACIONES}>
                Todas las ubicaciones
              </SelectItem>
              {ubicaciones.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                    <span>{u.nombre}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Acciones: Limpiar y Exportar */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex items-center justify-end gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-initial"
                title="Limpiar filtros"
              >
                <RotateCcw className="size-3.5 text-muted-foreground" />
                <span>Limpiar</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportExcel}
              className="h-9 px-2.5 text-xs font-medium gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-colors flex-1 sm:flex-initial"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar Excel</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
