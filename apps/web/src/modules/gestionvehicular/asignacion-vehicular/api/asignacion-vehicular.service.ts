import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { asignacionVehicularEndpoints } from "./asignacion-vehicular.endpoints"
import type { AsignacionVehicularListFilters } from "./asignacion-vehicular.keys"

export type AsignacionVehicularSolicitudInfo = {
  id: string
  numero: string
  motivo: string
  destino?: string | null
  fechaSalida?: string | null
  fechaRetornoEstimada?: string | null
  estado?: string | null
}

export type AsignacionVehicularActivoInfo = {
  id: string
  codigo: string
  nombre: string
  placa?: string | null
}

export type AsignacionVehicularConductorInfo = {
  id: string
  empleadoId?: string | null
  nombreCompleto?: string | null
  numeroLicencia?: string | null
  categoriaLicencia?: string | null
}

export type AsignacionVehicularEmpleadoInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo?: string | null
  area?: string | null
}

export type AsignacionVehicular = AuditableEntity & {
  id: string
  solicitudVehicularId: string
  solicitudVehicular?: AsignacionVehicularSolicitudInfo | null
  activoId: string
  activo?: AsignacionVehicularActivoInfo | null
  conductorId: string
  conductor?: AsignacionVehicularConductorInfo | null
  asignadoPorId: string
  asignadoPor?: AsignacionVehicularEmpleadoInfo | null
  fechaAsignacion?: string | null
  observacion?: string | null
}

export type AsignacionVehicularPayload = {
  solicitudVehicularId: string
  activoId: string
  conductorId: string
  asignadoPorId: string
  fechaAsignacion?: string | null
  observacion?: string | null
}

export type AsignacionVehicularUpdatePayload = {
  solicitudVehicularId: string
  activoId: string
  conductorId: string
  asignadoPorId: string
  fechaAsignacion?: string | null
  observacion?: string | null
}

const crud = createCrudService<AsignacionVehicular, AsignacionVehicularPayload>(
  asignacionVehicularEndpoints
)

export const listAsignacionesVehiculares = (
  filters?: AsignacionVehicularListFilters
): Promise<PageResponse<AsignacionVehicular>> => {
  return http.get<PageResponse<AsignacionVehicular>>(
    asignacionVehicularEndpoints.root,
    { params: filters }
  )
}

export const getAsignacionesBySolicitud = (
  solicitudVehicularId: string
): Promise<AsignacionVehicular[]> => {
  return http.get<AsignacionVehicular[]>(
    asignacionVehicularEndpoints.bySolicitud(solicitudVehicularId)
  )
}

export const getAsignacionVehicular = crud.get
export const createAsignacionVehicular = crud.create
export const updateAsignacionVehicular = (
  id: string,
  payload: AsignacionVehicularUpdatePayload
): Promise<AsignacionVehicular> => {
  return http.put<AsignacionVehicular>(
    asignacionVehicularEndpoints.byId(id),
    payload
  )
}
export const deleteAsignacionVehicular = crud.remove
