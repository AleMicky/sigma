import {
  getDocumentoEstado,
  type DocumentoEstado,
} from "@/modules/activos/activo/lib/activo-documentos.utils"

import type {
  ActivoDocumentoEstado,
  ActivoDocumentoResumenFilters,
} from "../api/activo-documento.service"

export { getDocumentoEstado }
export type { DocumentoEstado }

export const ALL_DOCUMENTO_FILTER = "__all__"

export type DocumentoFilterInput = {
  activoId?: string
  search: string
  tipoDocumentoId?: string
  estado?: string
}

const ESTADOS_API: readonly ActivoDocumentoEstado[] = [
  "VIGENTE",
  "POR_VENCER",
  "VENCIDO",
  "PERMANENTE",
]

/** Convierte el selector local al enum que espera la API. */
export function toApiDocumentoEstado(
  estado?: string | null,
): ActivoDocumentoEstado | undefined {
  if (!estado || estado === ALL_DOCUMENTO_FILTER) return undefined

  const normalized = estado.toUpperCase() as ActivoDocumentoEstado
  return ESTADOS_API.includes(normalized) ? normalized : undefined
}

/** Normaliza los filtros enviados a `/activo-documentos` y `/resumen`. */
export function buildDocumentoFilters({
  activoId,
  search,
  tipoDocumentoId,
  estado,
}: DocumentoFilterInput): ActivoDocumentoResumenFilters {
  const query = search.trim()
  const estadoApi = toApiDocumentoEstado(estado)

  return {
    ...(activoId ? { activoId } : {}),
    ...(query ? { query } : {}),
    ...(tipoDocumentoId && tipoDocumentoId !== ALL_DOCUMENTO_FILTER
      ? { tipoDocumentoId }
      : {}),
    ...(estadoApi ? { estado: estadoApi } : {}),
  }
}

/** Elimina búsquedas vacías y normaliza el enum de vigencia. */
export function normalizeDocumentoFilters<T extends ActivoDocumentoResumenFilters>(
  filters?: T,
): T | undefined {
  if (!filters) return undefined

  const query = filters.query?.trim()
  const estado = toApiDocumentoEstado(filters.estado)

  return {
    ...filters,
    ...(query ? { query } : { query: undefined }),
    ...(estado ? { estado } : { estado: undefined }),
  }
}
