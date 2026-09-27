import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

export type AuditoriaResponse = AuditableEntity

export interface FlotaVehicular {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  auditoria?: AuditoriaResponse
}

export interface FlotaVehicularRequest {
  codigo: string
  nombre: string
  descripcion?: string | null
  activo?: boolean
}

export interface FlotaVehicularUpdate {
  codigo: string
  nombre: string
  descripcion?: string | null
  activo?: boolean
}

export interface FlotaVehiculoActivoInfo {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  urlImagen?: string | null
}

export interface FlotaVehiculoFlotaInfo {
  id: string
  codigo: string
  nombre: string
}

export interface FlotaVehiculo {
  id: string
  flotaVehicularId: string
  activoId: string
  activo: boolean
  flota?: FlotaVehiculoFlotaInfo | null
  vehiculo?: FlotaVehiculoActivoInfo | null
  auditoria?: AuditoriaResponse
}

export interface FlotaVehiculoRequest {
  flotaVehicularId: string
  activoId?: string
  activoIds?: string[]
  activo?: boolean
}

export interface FlotaVehiculoBatchRequest {
  flotaVehicularId: string
  activoIds: string[]
  activo?: boolean
}

export interface SincronizarFlotaVehiculosRequest {
  activoIds: string[]
}

export interface ResponsableFlotaEmpleadoInfo {
  id: string
  codigo: string
  nombreCompleto: string
  cargo?: string | null
  area?: string | null
}

export interface ResponsableFlotaFlotaInfo {
  id: string
  codigo: string
  nombre: string
}

export interface ResponsableFlota {
  id: string
  flotaVehicularId: string
  empleadoId: string
  principal: boolean
  activo: boolean
  flota?: ResponsableFlotaFlotaInfo | null
  empleado?: ResponsableFlotaEmpleadoInfo | null
  auditoria?: AuditoriaResponse
}

export interface ResponsableFlotaRequest {
  flotaVehicularId: string
  empleadoId: string
  principal?: boolean
  activo?: boolean
}

export interface ResponsableFlotaUpdate {
  flotaVehicularId: string
  empleadoId: string
  principal?: boolean
  activo?: boolean
}

export interface FlotaQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: "ASC" | "DESC"
  search?: string
  activo?: boolean
}

const BASE_URL = "/flotas-vehiculares"
const VEHICULOS_URL = "/flota-vehiculos"
const RESPONSABLES_URL = "/responsables-flota"

export const flotaService = {
  // FLOTA VEHICULAR
  list: (params?: FlotaQueryParams): Promise<PageResponse<FlotaVehicular>> => {
    return http.get<PageResponse<FlotaVehicular>>(BASE_URL, { params })
  },

  listActivas: (): Promise<FlotaVehicular[]> => {
    return http.get<FlotaVehicular[]>(`${BASE_URL}/activas`)
  },

  getById: (id: string): Promise<FlotaVehicular> => {
    return http.get<FlotaVehicular>(`${BASE_URL}/${id}`)
  },

  create: (data: FlotaVehicularRequest): Promise<FlotaVehicular> => {
    return http.post<FlotaVehicular>(BASE_URL, data)
  },

  update: (id: string, data: FlotaVehicularUpdate): Promise<FlotaVehicular> => {
    return http.put<FlotaVehicular>(`${BASE_URL}/${id}`, data)
  },

  toggleActivo: (id: string): Promise<FlotaVehicular> => {
    return http.patch<FlotaVehicular>(`${BASE_URL}/${id}/toggle-activo`)
  },

  delete: (id: string): Promise<void> => {
    return http.delete<void>(`${BASE_URL}/${id}`)
  },

  // FLOTA VEHICULOS (ASIGNACIONES)
  listVehiculosByFlota: (flotaId: string): Promise<FlotaVehiculo[]> => {
    return http.get<FlotaVehiculo[]>(`${VEHICULOS_URL}/flota/${flotaId}`)
  },

  asignarVehiculos: (data: FlotaVehiculoRequest): Promise<FlotaVehiculo[]> => {
    return http.post<FlotaVehiculo[]>(VEHICULOS_URL, data)
  },

  asignarVehiculosBatch: (data: FlotaVehiculoBatchRequest): Promise<FlotaVehiculo[]> => {
    return http.post<FlotaVehiculo[]>(`${VEHICULOS_URL}/batch`, data)
  },

  sincronizarVehiculos: (flotaId: string, data: SincronizarFlotaVehiculosRequest): Promise<FlotaVehiculo[]> => {
    return http.put<FlotaVehiculo[]>(`${VEHICULOS_URL}/flota/${flotaId}/sincronizar`, data)
  },

  toggleActivoVehiculo: (id: string): Promise<FlotaVehiculo> => {
    return http.patch<FlotaVehiculo>(`${VEHICULOS_URL}/${id}/toggle-activo`)
  },

  deleteVehiculo: (id: string): Promise<void> => {
    return http.delete<void>(`${VEHICULOS_URL}/${id}`)
  },

  // RESPONSABLES DE FLOTA
  listResponsablesByFlota: (flotaId: string): Promise<ResponsableFlota[]> => {
    return http.get<ResponsableFlota[]>(`${RESPONSABLES_URL}/flota/${flotaId}`)
  },

  listFlotasByEmpleado: (empleadoId: string): Promise<ResponsableFlota[]> => {
    return http.get<ResponsableFlota[]>(`${RESPONSABLES_URL}/empleado/${empleadoId}`)
  },

  listVehiculosByEmpleado: (empleadoId: string, activo?: boolean): Promise<FlotaVehiculo[]> => {
    return http.get<FlotaVehiculo[]>(`${RESPONSABLES_URL}/empleado/${empleadoId}/vehiculos`, {
      params: activo !== undefined ? { activo } : undefined,
    })
  },

  asignarResponsable: (data: ResponsableFlotaRequest): Promise<ResponsableFlota> => {
    return http.post<ResponsableFlota>(RESPONSABLES_URL, data)
  },

  updateResponsable: (id: string, data: ResponsableFlotaUpdate): Promise<ResponsableFlota> => {
    return http.put<ResponsableFlota>(`${RESPONSABLES_URL}/${id}`, data)
  },

  toggleActivoResponsable: (id: string): Promise<ResponsableFlota> => {
    return http.patch<ResponsableFlota>(`${RESPONSABLES_URL}/${id}/toggle-activo`)
  },

  setResponsablePrincipal: (id: string): Promise<ResponsableFlota> => {
    return http.patch<ResponsableFlota>(`${RESPONSABLES_URL}/${id}/set-principal`)
  },

  deleteResponsable: (id: string): Promise<void> => {
    return http.delete<void>(`${RESPONSABLES_URL}/${id}`)
  },
}
