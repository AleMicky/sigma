import { http } from "@/shared/api"
import type { TipoCriterioMantenimiento } from "../../preventivo/api/preventivo.service"
import type { PlanMantenimiento } from "./plan-mantenimiento.service"

export type EstadoPlanMantenimiento = "BORRADOR" | "ACTIVO" | "INACTIVO"

export type PlanPreventivoCompletoPayload = {
  tipoActivoId: string
  tipoMantenimientoId?: string | null
  codigo: string
  nombre: string
  descripcion?: string | null
  estado?: EstadoPlanMantenimiento
  criterioDefaultTipo?: TipoCriterioMantenimiento | null
  criterioDefaultDias?: number | null
  criterioDefaultUso?: number | null
  actividades: Array<{
    actividadMantenimientoAplicacionId: string
    orden: number
    obligatorio: boolean
  }>
  activos: Array<{
    activoId: string
    responsableId?: string | null
    fechaInicio?: string | null
    fechaFin?: string | null
    activo: boolean
    kilometrajeInicial?: number | null
    horasUsoInicial?: number | null
    criterios?: Array<{
      tipoCriterio: TipoCriterioMantenimiento
      intervaloDias?: number | null
      intervaloUso?: number | null
      activo: boolean
    }>
  }>
}

export type PlanPreventivoCompletoResponse = {
  plan: PlanMantenimiento
  estado: EstadoPlanMantenimiento
  tipoMantenimientoId: string | null
  criterioDefaultTipo: TipoCriterioMantenimiento | null
  criterioDefaultDias: number | null
  criterioDefaultUso: number | null
  actividades: Array<{
    id: string
    actividadMantenimientoAplicacionId: string
    orden: number
    obligatorio: boolean
  }>
  activos: Array<{
    planMantenimientoActivoId: string
    programacionMantenimientoId: string | null
    activoId: string
    responsableId: string | null
    fechaInicio: string | null
    fechaFin: string | null
    activo: boolean
  }>
}

export function getPlanPreventivoCompleto(id: string): Promise<PlanPreventivoCompletoResponse> {
  return http.get<PlanPreventivoCompletoResponse>(`/planes-mantenimiento/${id}/completo`)
}

export function createPlanPreventivoCompleto(
  payload: PlanPreventivoCompletoPayload,
): Promise<PlanPreventivoCompletoResponse> {
  return http.post<PlanPreventivoCompletoResponse>("/planes-mantenimiento/completo", payload)
}

export function updatePlanPreventivoCompleto(
  id: string,
  payload: PlanPreventivoCompletoPayload,
): Promise<PlanPreventivoCompletoResponse> {
  return http.put<PlanPreventivoCompletoResponse>(`/planes-mantenimiento/${id}/completo`, payload)
}
