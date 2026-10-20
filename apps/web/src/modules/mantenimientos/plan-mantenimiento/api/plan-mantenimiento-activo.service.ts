import { http } from "@/shared/api"

import { planMantenimientoActivoEndpoints } from "./plan-mantenimiento-activo.endpoints"

export type PlanMantenimientoActivo = {
  id: string
  planMantenimientoId: string
  plan?: {
    id: string
    codigo: string
    nombre: string
    tipoActivoId?: string
    tipoActivoNombre?: string
  } | null
  activoId: string
  activo?: {
    id: string
    codigo: string
    nombre: string
    descripcion?: string
    tipoActivoId?: string
    tipoActivoNombre?: string
  } | null
  responsableId?: string | null
  responsable?: {
    id: string
    codigo: string
    nombreCompleto: string
  } | null
  fechaInicio: string
  fechaFin?: string | null
  estadoActivo: boolean
  auditoria?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
  }
}

export type PlanMantenimientoActivoPayload = {
  planMantenimientoId: string
  activoId: string
  responsableId?: string | null
  fechaInicio: string
  fechaFin?: string | null
  estadoActivo?: boolean
}

export type PlanMantenimientoActivoUpdatePayload = {
  responsableId?: string | null
  fechaInicio?: string
  fechaFin?: string | null
  estadoActivo?: boolean
}

export async function getActivosByPlan(
  planId: string,
  activo?: boolean,
): Promise<PlanMantenimientoActivo[]> {
  const params = activo !== undefined ? `?activo=${activo}` : ""
  return http.get<PlanMantenimientoActivo[]>(`${planMantenimientoActivoEndpoints.byPlan(planId)}${params}`)
}

export async function getPlanesByActivo(activoId: string): Promise<PlanMantenimientoActivo[]> {
  return http.get<PlanMantenimientoActivo[]>(planMantenimientoActivoEndpoints.byActivo(activoId))
}

export async function getPlanMantenimientoActivo(id: string): Promise<PlanMantenimientoActivo> {
  return http.get<PlanMantenimientoActivo>(planMantenimientoActivoEndpoints.detail(id))
}

export async function createPlanMantenimientoActivo(
  payload: PlanMantenimientoActivoPayload,
): Promise<PlanMantenimientoActivo> {
  return http.post<PlanMantenimientoActivo>(planMantenimientoActivoEndpoints.root, payload)
}

export async function updatePlanMantenimientoActivo(
  id: string,
  payload: PlanMantenimientoActivoUpdatePayload,
): Promise<PlanMantenimientoActivo> {
  return http.put<PlanMantenimientoActivo>(planMantenimientoActivoEndpoints.detail(id), payload)
}

export async function desactivarPlanMantenimientoActivo(id: string): Promise<PlanMantenimientoActivo> {
  return http.patch<PlanMantenimientoActivo>(planMantenimientoActivoEndpoints.desactivar(id), {})
}

export async function activarPlanMantenimientoActivo(id: string): Promise<PlanMantenimientoActivo> {
  return http.patch<PlanMantenimientoActivo>(planMantenimientoActivoEndpoints.activar(id), {})
}

export async function deletePlanMantenimientoActivo(id: string): Promise<void> {
  return http.delete<void>(planMantenimientoActivoEndpoints.detail(id))
}
