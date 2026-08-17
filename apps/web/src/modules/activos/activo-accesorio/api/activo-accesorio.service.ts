import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

export type ActivoItemInfo = {
  id: string
  codigo: string
  nombre: string
}

export type AccesorioItemInfo = {
  id: string
  codigo: string
  nombre: string
}

export type ActivoAccesorio = AuditableEntity & {
  id: string
  activo?: ActivoItemInfo | null
  accesorio?: AccesorioItemInfo | null
  cantidad: number
  numeroSerie?: string | null
  observacion?: string | null
}

export type ActivoAccesorioPayload = {
  activoId: string
  accesorioId: string
  cantidad: number
  numeroSerie?: string | null
  observacion?: string | null
}

export type ActivoAccesorioFilters = PageParams & {
  activoId?: string
  accesorioId?: string
}

export async function listActivoAccesorios(
  filters?: ActivoAccesorioFilters,
): Promise<PageResponse<ActivoAccesorio>> {
  return http.get<PageResponse<ActivoAccesorio>>("/activo-accesorios", {
    params: filters,
  })
}

export async function getActivoAccesorio(id: string): Promise<ActivoAccesorio> {
  return http.get<ActivoAccesorio>(`/activo-accesorios/${id}`)
}

export async function createActivoAccesorio(
  payload: ActivoAccesorioPayload,
): Promise<ActivoAccesorio> {
  return http.post<ActivoAccesorio>("/activo-accesorios", payload)
}

export async function updateActivoAccesorio(
  id: string,
  payload: ActivoAccesorioPayload,
): Promise<ActivoAccesorio> {
  return http.put<ActivoAccesorio>(`/activo-accesorios/${id}`, payload)
}

export async function deleteActivoAccesorio(id: string): Promise<void> {
  return http.delete<void>(`/activo-accesorios/${id}`)
}
