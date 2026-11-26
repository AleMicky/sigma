import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { normalizeDocumentoFilters } from "../lib/activo-documento.utils"

export type ActivoDocumento = AuditableEntity & {
  activoId: string
  tipoDocumentoId: string
  numeroDocumento?: string | null
  nombre: string
  descripcion?: string | null
  fechaEmision?: string | null
  fechaVencimiento?: string | null
  nombreArchivo: string
  rutaArchivo: string
  mimeType?: string | null
  size?: number | null
}

export type ActivoDocumentoPayload = {
  activoId: string
  tipoDocumentoId: string
  numeroDocumento?: string | null
  nombre: string
  descripcion?: string | null
  fechaEmision?: string | null
  fechaVencimiento?: string | null
}

export type ActivoDocumentoEstado =
  | "VIGENTE"
  | "POR_VENCER"
  | "VENCIDO"
  | "PERMANENTE"

export type ActivoDocumentoEstadoInput =
  | ActivoDocumentoEstado
  | Lowercase<ActivoDocumentoEstado>

export type ActivoDocumentoResumenFilters = {
  activoId?: string
  query?: string
  tipoDocumentoId?: string
  estado?: ActivoDocumentoEstadoInput
}

export type ActivoDocumentoFilters = ActivoDocumentoResumenFilters & {
  page?: number
  size?: number
  sortBy?: string
  direction?: "ASC" | "DESC"
}

export type ActivoDocumentoResumen = {
  total: number
  vigentes: number
  porVencer: number
  vencidos: number
  permanentes: number
}

export const EMPTY_ACTIVO_DOCUMENTO_RESUMEN: ActivoDocumentoResumen = {
  total: 0,
  vigentes: 0,
  porVencer: 0,
  vencidos: 0,
  permanentes: 0,
}

export async function listActivoDocumentos(
  filters?: ActivoDocumentoFilters,
): Promise<PageResponse<ActivoDocumento>> {
  return http.get<PageResponse<ActivoDocumento>>("/activo-documentos", {
    params: normalizeDocumentoFilters(filters),
  })
}

export async function getActivoDocumentosResumen(
  filters?: ActivoDocumentoResumenFilters,
): Promise<ActivoDocumentoResumen> {
  return http.get<ActivoDocumentoResumen>("/activo-documentos/resumen", {
    params: normalizeDocumentoFilters(filters),
  })
}

export async function getActivoDocumento(id: string): Promise<ActivoDocumento> {
  return http.get<ActivoDocumento>(`/activo-documentos/${id}`)
}

export async function createActivoDocumentoWithFile(
  payload: ActivoDocumentoPayload,
  file: File,
): Promise<ActivoDocumento> {
  const formData = new FormData()
  formData.append("file", file)

  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })
  formData.append("data", jsonBlob)

  return http.post<ActivoDocumento>("/activo-documentos", formData)
}

export async function updateActivoDocumento(
  id: string,
  payload: ActivoDocumentoPayload,
): Promise<ActivoDocumento> {
  return http.put<ActivoDocumento>(`/activo-documentos/${id}`, payload)
}

export async function replaceActivoDocumentoFile(
  id: string,
  file: File,
): Promise<ActivoDocumento> {
  const formData = new FormData()
  formData.append("file", file)
  return http.post<ActivoDocumento>(`/activo-documentos/${id}/archivo`, formData)
}

export async function deleteActivoDocumento(id: string): Promise<void> {
  return http.delete<void>(`/activo-documentos/${id}`)
}
