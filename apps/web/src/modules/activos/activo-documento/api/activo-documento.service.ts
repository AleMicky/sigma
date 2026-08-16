import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

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

export type ActivoDocumentoFilters = PageParams & {
  activoId?: string
  tipoDocumentoId?: string
}

export async function listActivoDocumentos(
  filters?: ActivoDocumentoFilters,
): Promise<PageResponse<ActivoDocumento>> {
  return http.get<PageResponse<ActivoDocumento>>("/activo-documentos", {
    params: filters,
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
