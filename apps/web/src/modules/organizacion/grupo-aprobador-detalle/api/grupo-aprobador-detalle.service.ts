import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type {
  CatalogoResumen,
  EmpleadoResumen,
} from "@/shared/types/resumen.types"

import type {
  AlcanceAprobador,
  TipoAprobador,
} from "../schemas/grupo-aprobador-detalle.schema"
import { grupoAprobadorDetalleEndpoints } from "./grupo-aprobador-detalle.endpoints"

export type GrupoAprobadorDetalle = AuditableEntity & {
  grupoAprobadorInfo?: CatalogoResumen | null
  tipoAprobador: TipoAprobador
  empleadoInfo?: EmpleadoResumen | null
  cargoInfo?: CatalogoResumen | null
  unidadInfo?: CatalogoResumen | null
  responsabilidadInfo?: CatalogoResumen | null
  alcance: AlcanceAprobador
  orden: number
  requiereAprobacion: boolean
  grupoAprobadorId?: string
  empleadoId?: string | null
  cargoId?: string | null
  unidadId?: string | null
  responsabilidadId?: string | null
}

export type GrupoAprobadorDetallePayload = {
  tipoAprobador: TipoAprobador
  empleadoId?: string | null
  cargoId?: string | null
  unidadId?: string | null
  responsabilidadId?: string | null
  alcance: AlcanceAprobador
  orden: number
  requiereAprobacion: boolean
}

export async function listGrupoAprobadorDetalles(
  grupoAprobadorId: string,
  params?: PageParams,
): Promise<PageResponse<GrupoAprobadorDetalle>> {
  return http.get<PageResponse<GrupoAprobadorDetalle>>(
    grupoAprobadorDetalleEndpoints.root(grupoAprobadorId),
    { params },
  )
}

export async function getGrupoAprobadorDetalle(
  grupoAprobadorId: string,
  id: string,
): Promise<GrupoAprobadorDetalle> {
  return http.get<GrupoAprobadorDetalle>(
    grupoAprobadorDetalleEndpoints.byId(grupoAprobadorId, id),
  )
}

export async function createGrupoAprobadorDetalle(
  grupoAprobadorId: string,
  payload: GrupoAprobadorDetallePayload,
): Promise<GrupoAprobadorDetalle> {
  return http.post<GrupoAprobadorDetalle, GrupoAprobadorDetallePayload>(
    grupoAprobadorDetalleEndpoints.root(grupoAprobadorId),
    payload,
  )
}

export async function updateGrupoAprobadorDetalle(
  grupoAprobadorId: string,
  id: string,
  payload: GrupoAprobadorDetallePayload,
): Promise<GrupoAprobadorDetalle> {
  return http.put<GrupoAprobadorDetalle, GrupoAprobadorDetallePayload>(
    grupoAprobadorDetalleEndpoints.byId(grupoAprobadorId, id),
    payload,
  )
}

export async function deleteGrupoAprobadorDetalle(
  grupoAprobadorId: string,
  id: string,
): Promise<void> {
  await http.delete<void>(
    grupoAprobadorDetalleEndpoints.byId(grupoAprobadorId, id),
  )
}
