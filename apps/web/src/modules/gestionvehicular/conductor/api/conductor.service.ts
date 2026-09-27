import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { conductorEndpoints } from "./conductor.endpoints"
import type { ConductorListFilters } from "./conductor.keys"

export type EstadoConductor = "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | "BAJA"
export type EstadoLicenciaConductor = "VIGENTE" | "VENCIDA" | "SUSPENDIDA" | "CANCELADA"

export type ConductorEmpleadoInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo?: string | null
  area?: string | null
}

export type ConductorLicencia = AuditableEntity & {
  id?: string
  conductorId?: string
  categoriaLicencia: string
  numeroLicencia: string
  fechaEmision: string
  fechaVencimiento: string
  estado: EstadoLicenciaConductor
  nombreArchivo?: string | null
  nombreOriginal?: string | null
  url?: string | null
  mimeType?: string | null
  size?: number | null
  observacion?: string | null
  activo?: boolean
}

export type Conductor = AuditableEntity & {
  id: string
  empleadoId: string
  empleado?: ConductorEmpleadoInfo | null
  estado: EstadoConductor
  observacion?: string | null
  activo: boolean
  licencias: ConductorLicencia[]
}

export type ConductorLicenciaPayload = {
  id?: string
  categoriaLicencia: string
  numeroLicencia: string
  fechaEmision: string
  fechaVencimiento: string
  estado?: EstadoLicenciaConductor
  nombreArchivo?: string | null
  nombreOriginal?: string | null
  url?: string | null
  mimeType?: string | null
  size?: number | null
  observacion?: string | null
  activo?: boolean
}

export type ConductorPayload = {
  empleadoId: string
  estado?: EstadoConductor
  observacion?: string | null
  activo?: boolean
  licencias: ConductorLicenciaPayload[]
}

export type ConductorUpdatePayload = {
  empleadoId: string
  estado?: EstadoConductor
  observacion?: string | null
  activo?: boolean
  licencias: ConductorLicenciaPayload[]
}

const crud = createCrudService<Conductor, ConductorPayload>(conductorEndpoints)

export const listConductores = (filters?: ConductorListFilters): Promise<PageResponse<Conductor>> => {
  return http.get<PageResponse<Conductor>>(conductorEndpoints.root, { params: filters })
}

export const listConductoresDisponibles = (params: {
  fechaSalida: string
  fechaRetorno: string
}): Promise<Conductor[]> => {
  return http.get<Conductor[]>(conductorEndpoints.disponibles, { params })
}

export const getConductor = crud.get
export const createConductor = crud.create
export const updateConductor = (id: string, payload: ConductorUpdatePayload): Promise<Conductor> => {
  return http.put<Conductor>(conductorEndpoints.byId(id), payload)
}
export const deleteConductor = crud.remove
