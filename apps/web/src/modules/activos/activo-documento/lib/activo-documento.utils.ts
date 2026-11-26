import type {
  ActivoDocumentoEstado,
  ActivoDocumentoResumenFilters,
} from "../api/activo-documento.service"

export const ALL_DOCUMENTO_FILTER = "__all__"

export type DocumentoEstado = Lowercase<ActivoDocumentoEstado>

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

/** Estado de visualización derivado de la fecha de vencimiento. */
export function getDocumentoEstado(
  fechaVencimiento?: string | null,
  now: Date = new Date(),
): DocumentoEstado {
  if (!fechaVencimiento) return "permanente"

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const parts = fechaVencimiento.split("-")
  const expiry =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(fechaVencimiento)
  expiry.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays < 0) return "vencido"
  if (diffDays <= 30) return "por_vencer"
  return "vigente"
}

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
