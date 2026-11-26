import { useMemo } from "react"
import {
  FileSpreadsheet,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { TipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import {
  ALL_TIPOS,
  ALL_UBICACIONES,
} from "@/modules/activos/activo/lib/catalogo.utils"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

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
  viewMode?: "list" | "grid"
  onViewModeChange?: (mode: "list" | "grid") => void
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
  viewMode = "list",
  onViewModeChange,
}: Readonly<ActivoCatalogoToolbarProps>) {
  const tiposById = useMemo(
    () => new Map(tipos.map((t) => [t.id, t])),
    [tipos],
  )

  const ubicacionesById = useMemo(
    () => new Map(ubicaciones.map((u) => [u.id, u])),
    [ubicaciones],
  )

  const tipoOptions = useMemo<OptionsComboboxOption[]>(
    () => [
      { value: ALL_TIPOS, label: "Todos los tipos" },
      ...tipos.map((tipo) => ({ value: tipo.id, label: tipo.nombre })),
    ],
    [tipos],
  )

  const ubicacionOptions = useMemo<OptionsComboboxOption[]>(
    () => [
      { value: ALL_UBICACIONES, label: "Todas las ubicaciones" },
      ...ubicaciones.map((ubicacion) => ({
        value: ubicacion.id,
        label: ubicacion.nombre,
      })),
    ],
    [ubicaciones],
  )

  const renderTipoValor = (option: OptionsComboboxOption) => {
    const tipo = tiposById.get(option.value)
    if (!tipo) {
      return (
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Filter className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{option.label}</span>
        </span>
      )
    }
    return (
      <span className="flex min-w-0 items-center gap-1.5 truncate">
        <TipoActivoIcon
          name={tipo.icono}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: tipo.color || DEFAULT_TIPO_ACTIVO_COLOR }}
        />
        <span className="truncate">{option.label}</span>
      </span>
    )
  }

  const renderTipoOption = (option: OptionsComboboxOption) => {
    const tipo = tiposById.get(option.value)
    if (!tipo) return <span className="truncate">{option.label}</span>
    return (
      <span className="flex min-w-0 items-center gap-2 truncate">
        <TipoActivoIcon
          name={tipo.icono}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: tipo.color || DEFAULT_TIPO_ACTIVO_COLOR }}
        />
        <span className="truncate">{option.label}</span>
      </span>
    )
  }

  const renderUbicacion = (option: OptionsComboboxOption) => {
    if (option.value === ALL_UBICACIONES) {
      return <span className="truncate">{option.label}</span>
    }
    return (
      <span className="flex min-w-0 items-center gap-1.5 truncate">
        <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
        <span className="truncate">{option.label}</span>
      </span>
    )
  }

  const renderUbicacionValor = (option: OptionsComboboxOption) => {
    if (option.value === ALL_UBICACIONES) {
      return (
        <span className="flex min-w-0 items-center gap-2 truncate">
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{option.label}</span>
        </span>
      )
    }
    return (
      <span className="flex min-w-0 items-center gap-2 truncate">
        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{ubicacionesById.get(option.value)?.nombre ?? option.label}</span>
      </span>
    )
  }

  function handleExportExcel() {
    toast.info("Exportación a Excel", {
      description:
        "La generación de reportes y exportación en formato Excel (.xlsx) estará disponible próximamente.",
    })
  }

  return (
    <div className="flex shrink-0 flex-col gap-2.5 py-3 sm:py-4 border-b border-border/60">
      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        {/* Buscador */}
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar activo por código, código alternativo, nombre o descripción…"
          aria-label="Buscar activos"
          className="w-full md:flex-1 min-w-0"
        />

        {/* Filtros y Exportación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2 shrink-0">
          {/* Tipo de Activo */}
          <OptionsCombobox
            options={tipoOptions}
            value={tipoActivoId}
            onValueChange={(val) => onTipoActivoChange(val || ALL_TIPOS)}
            placeholder="Todos los tipos"
            ariaLabel="Filtrar por tipo de activo"
            size="sm"
            className="w-full sm:w-full md:w-[190px]"
            renderOption={renderTipoOption}
            renderValue={renderTipoValor}
            emptyMessage="No se encontraron tipos de activo"
          />

          {/* Ubicación */}
          <OptionsCombobox
            options={ubicacionOptions}
            value={ubicacionId}
            onValueChange={(val) => onUbicacionChange(val || ALL_UBICACIONES)}
            placeholder="Todas las ubicaciones"
            ariaLabel="Filtrar por ubicación"
            size="sm"
            className="w-full sm:w-full md:w-[190px]"
            renderOption={renderUbicacion}
            renderValue={renderUbicacionValor}
            emptyMessage="No se encontraron ubicaciones"
          />

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

            {onViewModeChange && (
              <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "flex size-7.5 items-center justify-center rounded-md transition-all cursor-pointer",
                    viewMode === "list"
                      ? "bg-background text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Vista en lista"
                  aria-label="Vista en lista"
                >
                  <List className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "flex size-7.5 items-center justify-center rounded-md transition-all cursor-pointer",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Vista en cuadrícula"
                  aria-label="Vista en cuadrícula"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
