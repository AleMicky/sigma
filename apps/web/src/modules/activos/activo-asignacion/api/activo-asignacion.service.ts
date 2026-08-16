import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

export type ActivoAsignacion = AuditableEntity & {
  activoId: string
  empleadoId?: string | null
  areaId?: string | null
  fechaAsignacion: string
  fechaDevolucion?: string | null
  observacionAsignacion?: string | null
  observacionDevolucion?: string | null
}

export type ActivoAsignacionPayload = {
  activoId: string
  empleadoId?: string | null
  areaId?: string | null
  fechaAsignacion: string
  fechaDevolucion?: string | null
  observacionAsignacion?: string | null
  observacionDevolucion?: string | null
}

export type ActivoAsignacionFilters = PageParams & {
  activoId?: string
}

export async function listActivoAsignaciones(
  filters?: ActivoAsignacionFilters,
): Promise<PageResponse<ActivoAsignacion>> {
  return http.get<PageResponse<ActivoAsignacion>>("/activo-asignaciones", {
    params: filters,
  })
}

export async function getActivoAsignacion(id: string): Promise<ActivoAsignacion> {
  return http.get<ActivoAsignacion>(`/activo-asignaciones/${id}`)
}

export async function createActivoAsignacion(
  payload: ActivoAsignacionPayload,
): Promise<ActivoAsignacion> {
  return http.post<ActivoAsignacion>("/activo-asignaciones", payload)
}

export async function updateActivoAsignacion(
  id: string,
  payload: ActivoAsignacionPayload,
): Promise<ActivoAsignacion> {
  return http.put<ActivoAsignacion>(`/activo-asignaciones/${id}`, payload)
}

export async function deleteActivoAsignacion(id: string): Promise<void> {
  return http.delete<void>(`/activo-asignaciones/${id}`)
}
