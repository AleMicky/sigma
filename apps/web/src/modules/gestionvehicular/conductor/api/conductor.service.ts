import { createCrudService, http, uploadImage } from "@/shared/api"
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
  urlImagen?: string | null
  tipoSangre?: string | null
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
  urlImagen?: string | null
  tipoSangre?: string | null
  activo?: boolean
  licencias: ConductorLicenciaPayload[]
}

export type ConductorUpdatePayload = {
  empleadoId: string
  estado?: EstadoConductor
  observacion?: string | null
  urlImagen?: string | null
  tipoSangre?: string | null
  activo?: boolean
  licencias: ConductorLicenciaPayload[]
}

const crud = createCrudService<Conductor, ConductorPayload>(conductorEndpoints)

export const listConductores = (filters?: ConductorListFilters): Promise<PageResponse<Conductor>> => {
  return http.get<PageResponse<Conductor>>(conductorEndpoints.root, { params: filters })
}

function toLocalDateTimeParam(value: string): string {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return trimmed.slice(0, 19)
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) return trimmed
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export const listConductoresDisponibles = (params: {
  fechaSalida: string
  fechaRetorno: string
}): Promise<Conductor[]> => {
  return http.get<Conductor[]>(conductorEndpoints.disponibles, {
    params: {
      fechaSalida: toLocalDateTimeParam(params.fechaSalida),
      fechaRetorno: toLocalDateTimeParam(params.fechaRetorno),
    },
  })
}

export const getConductor = crud.get
export const createConductor = crud.create
export const updateConductor = (id: string, payload: ConductorUpdatePayload): Promise<Conductor> => {
  return http.put<Conductor>(conductorEndpoints.byId(id), payload)
}
export const deleteConductor = crud.remove

export function uploadConductorImagen(id: string, file: File): Promise<Conductor> {
  return uploadImage<Conductor>(conductorEndpoints.imagen(id), file)
}

export function deleteConductorImagen(id: string): Promise<Conductor> {
  return http.delete<Conductor>(conductorEndpoints.imagen(id))
}
