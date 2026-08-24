import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type {
  CatalogoResumen,
  EmpleadoResumen,
} from "@/shared/types/resumen.types"

import { grupoAprobadorDependienteEndpoints } from "./grupo-aprobador-dependiente.endpoints"

export type GrupoAprobadorDependiente = AuditableEntity & {
  grupoAprobadorInfo?: CatalogoResumen | null
  empleadoInfo?: EmpleadoResumen | null
  grupoAprobadorId?: string
  empleadoId?: string | null
}

export type GrupoAprobadorDependientePayload = {
  empleadoId: string
}

export async function listGrupoAprobadorDependientes(
  grupoAprobadorId: string,
  params?: PageParams,
): Promise<PageResponse<GrupoAprobadorDependiente>> {
  return http.get<PageResponse<GrupoAprobadorDependiente>>(
    grupoAprobadorDependienteEndpoints.root(grupoAprobadorId),
    { params },
  )
}

export async function getGrupoAprobadorDependiente(
  grupoAprobadorId: string,
  id: string,
): Promise<GrupoAprobadorDependiente> {
  return http.get<GrupoAprobadorDependiente>(
    grupoAprobadorDependienteEndpoints.byId(grupoAprobadorId, id),
  )
}

export async function createGrupoAprobadorDependiente(
  grupoAprobadorId: string,
  payload: GrupoAprobadorDependientePayload,
): Promise<GrupoAprobadorDependiente> {
  return http.post<
    GrupoAprobadorDependiente,
    GrupoAprobadorDependientePayload
  >(grupoAprobadorDependienteEndpoints.root(grupoAprobadorId), payload)
}

export async function updateGrupoAprobadorDependiente(
  grupoAprobadorId: string,
  id: string,
  payload: GrupoAprobadorDependientePayload,
): Promise<GrupoAprobadorDependiente> {
  return http.put<
    GrupoAprobadorDependiente,
    GrupoAprobadorDependientePayload
  >(grupoAprobadorDependienteEndpoints.byId(grupoAprobadorId, id), payload)
}

export async function deleteGrupoAprobadorDependiente(
  grupoAprobadorId: string,
  id: string,
): Promise<void> {
  await http.delete<void>(
    grupoAprobadorDependienteEndpoints.byId(grupoAprobadorId, id),
  )
}

export type AprobadorSelect = {
  id: string
  nombreCompleto: string
  cargo?: string | null
}

export async function getAprobadoresSelectByEmpleado(
  empleadoId: string,
): Promise<AprobadorSelect[]> {
  return http.get<AprobadorSelect[]>(
    grupoAprobadorDependienteEndpoints.aprobadoresSelect(empleadoId),
  )
}

export type DependienteSelect = {
  id: string
  nombreCompleto: string
  cargo?: string | null
}

export async function getDependientesSelectByAprobador(
  aprobadorId: string,
): Promise<DependienteSelect[]> {
  return http.get<DependienteSelect[]>(
    grupoAprobadorDependienteEndpoints.dependientesSelect(aprobadorId),
  )
}
