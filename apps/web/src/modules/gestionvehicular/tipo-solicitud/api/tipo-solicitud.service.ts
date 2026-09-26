import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoSolicitudVehicularEndpoints } from "./tipo-solicitud.endpoints"
import type { TipoSolicitudVehicularListFilters } from "./tipo-solicitud.keys"

export type TipoSolicitudVehicular = AuditableEntity & {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  diasAnticipacion: number
  requiereRespaldo: boolean
  requiereJustificacion: boolean
}

export type TipoSolicitudVehicularPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  diasAnticipacion: number
  requiereRespaldo: boolean
  requiereJustificacion: boolean
}

export type TipoSolicitudVehicularUpdatePayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  diasAnticipacion: number
  requiereRespaldo: boolean
  requiereJustificacion: boolean
}

const crud = createCrudService<TipoSolicitudVehicular, TipoSolicitudVehicularPayload>(
  tipoSolicitudVehicularEndpoints
)

export const listTiposSolicitudVehicular = (
  filters?: TipoSolicitudVehicularListFilters
): Promise<PageResponse<TipoSolicitudVehicular>> => {
  return http.get<PageResponse<TipoSolicitudVehicular>>(
    tipoSolicitudVehicularEndpoints.root,
    { params: filters }
  )
}

export const getTipoSolicitudVehicular = crud.get
export const createTipoSolicitudVehicular = crud.create
export const updateTipoSolicitudVehicular = (
  id: string,
  payload: TipoSolicitudVehicularUpdatePayload
): Promise<TipoSolicitudVehicular> => {
  return http.put<TipoSolicitudVehicular>(
    tipoSolicitudVehicularEndpoints.byId(id),
    payload
  )
}
export const deleteTipoSolicitudVehicular = crud.remove
