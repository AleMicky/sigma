import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

export type TipoCriterioMantenimiento = "TIEMPO" | "KILOMETRAJE" | "HORAS_USO"

export type ConfiguracionPreventiva = AuditableEntity & {
  diasAnticipacionAlerta: number
  kmAnticipacionAlerta: number
  horasAnticipacionAlerta: number
  evaluacionAutomaticaHabilitada: boolean
  cronEvaluacion: string
}

export type ConfiguracionPreventivaPayload = {
  diasAnticipacionAlerta: number
  kmAnticipacionAlerta: number
  horasAnticipacionAlerta: number
  evaluacionAutomaticaHabilitada: boolean
  cronEvaluacion: string
}

export type PreventivoHistorialItem = {
  id: string
  programacionMantenimientoId: string
  planMantenimientoId: string | null
  planCodigo: string | null
  planNombre: string | null
  activoId: string | null
  activoCodigo: string | null
  activoNombre: string | null
  solicitudMantenimientoId: string | null
  solicitudNumero: string | null
  ordenTrabajoId: string | null
  tipoCriterioDisparador: TipoCriterioMantenimiento
  valorDisparador: string
  valorLimite: string | null
  fechaDisparo: string
  completado: boolean
  fechaServicio: string | null
  valorUsoServicio: number | null
  observacion: string | null
}

export type PreventivoHistorialParams = {
  planId?: string
  activoId?: string
  tipoCriterio?: TipoCriterioMantenimiento
  completado?: boolean
  q?: string
  page?: number
  size?: number
}

export function getConfiguracionPreventiva(): Promise<ConfiguracionPreventiva> {
  return http.get<ConfiguracionPreventiva>("/mantenimientos/preventivo/configuracion")
}

export function updateConfiguracionPreventiva(
  payload: ConfiguracionPreventivaPayload,
): Promise<ConfiguracionPreventiva> {
  return http.put<ConfiguracionPreventiva>("/mantenimientos/preventivo/configuracion", payload)
}

export function listPreventivoHistorico(
  params: PreventivoHistorialParams = {},
): Promise<PageResponse<PreventivoHistorialItem>> {
  return http.get<PageResponse<PreventivoHistorialItem>>(
    "/mantenimientos/preventivo/historico",
    { params },
  )
}

export function generarOrdenTrabajoDesdeProgramacion(
  programacionId: string,
  responsableId?: string,
) {
  return http.post<{ id: string; numero: string }>(
    `/programaciones-mantenimiento/${programacionId}/generar-orden-trabajo`,
    null,
    { params: responsableId ? { responsableId } : undefined },
  )
}
