import type {
  ActivoListFilters,
  ActivoResumenFilters,
} from "../api/activo.keys"

export const ALL_TIPOS = "__all__"
export const ALL_UBICACIONES = "__all__"

export type ActivoCatalogoFilterInput = {
  page: number
  size: number
  search: string
  tipoActivoId: string
  ubicacionId: string
  sortBy?: string
  direction?: "ASC" | "DESC"
}

/** Traduce el estado local de los filtros a los parámetros del listado de API. */
export function buildActivoListFilters({
  page,
  size,
  search,
  tipoActivoId,
  ubicacionId,
  sortBy = "createdAt",
  direction = "DESC",
}: ActivoCatalogoFilterInput): ActivoListFilters {
  const q = search.trim()

  return {
    page,
    size,
    ...(q ? { q } : {}),
    ...(tipoActivoId !== ALL_TIPOS ? { tipoActivoId } : {}),
    ...(ubicacionId !== ALL_UBICACIONES ? { ubicacionId } : {}),
    sortBy,
    direction,
  }
}

/** El resumen no pagina: conserva únicamente los criterios de búsqueda. */
export function buildActivoResumenFilters(
  filters: ActivoListFilters,
): ActivoResumenFilters {
  return {
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.tipoActivoId ? { tipoActivoId: filters.tipoActivoId } : {}),
    ...(filters.ubicacionId ? { ubicacionId: filters.ubicacionId } : {}),
  }
}
