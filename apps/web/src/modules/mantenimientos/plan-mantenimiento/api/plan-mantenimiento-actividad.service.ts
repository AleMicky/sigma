import { http } from "@/shared/api"

import { planMantenimientoActividadEndpoints } from "./plan-mantenimiento-actividad.endpoints"

export type PlanMantenimientoActividad = {
  id: string
  planMantenimientoId: string
  actividadMantenimientoAplicacionId: string
  actividad?: {
    id: string
    codigo: string
    nombre: string
    descripcion?: string
  } | null
  tipoActivo?: {
    id: string
    nombre: string
  } | null
  componente?: {
    id: string
    nombre: string
  } | null
  orden: number
  obligatorio: boolean
  auditoria?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
  }
}

export type PlanMantenimientoActividadPayload = {
  planMantenimientoId: string
  actividadMantenimientoAplicacionId: string
  orden?: number
  obligatorio?: boolean
}

export type PlanMantenimientoActividadUpdatePayload = {
  orden?: number
  obligatorio?: boolean
}

export async function getActividadesByPlan(planId: string): Promise<PlanMantenimientoActividad[]> {
  return http.get<PlanMantenimientoActividad[]>(planMantenimientoActividadEndpoints.byPlan(planId))
}

export async function createPlanMantenimientoActividad(
  payload: PlanMantenimientoActividadPayload,
): Promise<PlanMantenimientoActividad> {
  return http.post<PlanMantenimientoActividad>(planMantenimientoActividadEndpoints.root, payload)
}

export async function updatePlanMantenimientoActividad(
  id: string,
  payload: PlanMantenimientoActividadUpdatePayload,
): Promise<PlanMantenimientoActividad> {
  return http.put<PlanMantenimientoActividad>(planMantenimientoActividadEndpoints.detail(id), payload)
}

export async function deletePlanMantenimientoActividad(id: string): Promise<void> {
  return http.delete<void>(planMantenimientoActividadEndpoints.detail(id))
}
