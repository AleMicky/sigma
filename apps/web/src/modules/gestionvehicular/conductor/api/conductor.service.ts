import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { conductorEndpoints } from "./conductor.endpoints"
import type { ConductorListFilters } from "./conductor.keys"

export type ConductorEmpleadoInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo?: string | null
  area?: string | null
}

export type Conductor = AuditableEntity & {
  id: string
  empleadoId: string
  empleado?: ConductorEmpleadoInfo | null
  numeroLicencia: string
  categoriaLicencia: string
  fechaVencimiento: string
  activo: boolean
}

export type ConductorPayload = {
  empleadoId: string
  numeroLicencia: string
  categoriaLicencia: string
  fechaVencimiento: string
  activo?: boolean
}

export type ConductorUpdatePayload = {
  empleadoId: string
  numeroLicencia: string
  categoriaLicencia: string
  fechaVencimiento: string
  activo?: boolean
}

const crud = createCrudService<Conductor, ConductorPayload>(conductorEndpoints)

export const listConductores = (filters?: ConductorListFilters): Promise<PageResponse<Conductor>> => {
  return http.get<PageResponse<Conductor>>(conductorEndpoints.root, { params: filters })
}

export const getConductor = crud.get
export const createConductor = crud.create
export const updateConductor = (id: string, payload: ConductorUpdatePayload): Promise<Conductor> => {
  return http.put<Conductor>(conductorEndpoints.byId(id), payload)
}
export const deleteConductor = crud.remove
