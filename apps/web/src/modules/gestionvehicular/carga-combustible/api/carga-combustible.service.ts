import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { cargaCombustibleEndpoints } from "./carga-combustible.endpoints"

export type CargaCombustibleActivoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type CargaCombustibleViajeInfo = {
  id: string
  estado: string
  fechaSalidaReal?: string | null
  fechaRetornoReal?: string | null
}

export type CargaCombustibleInsumoInfo = {
  id: string
  codigo: string
  nombre: string
  unidadMedida?: string | null
}

export type CargaCombustibleEmpleadoInfo = {
  id: string
  codigo: string
  nombreCompleto: string
  cargo?: string | null
}

export type CargaCombustible = AuditableEntity & {
  id: string
  activoId: string
  activo?: CargaCombustibleActivoInfo | null
  viajeVehicularId?: string | null
  viajeVehicular?: CargaCombustibleViajeInfo | null
  insumoId: string
  insumo?: CargaCombustibleInsumoInfo | null
  fechaCarga: string
  litros: number
  precioTotal: number
  precioPorLitro?: number | null
  numeroFactura?: string | null
  empleadoId: string
  empleado?: CargaCombustibleEmpleadoInfo | null
}

export type CargaCombustiblePayload = {
  activoId: string
  viajeVehicularId?: string | null
  insumoId: string
  fechaCarga?: string | null
  litros: number
  precioTotal: number
  numeroFactura?: string | null
  empleadoId: string
}

export type CargaCombustibleUpdatePayload = {
  activoId: string
  viajeVehicularId?: string | null
  insumoId: string
  fechaCarga: string
  litros: number
  precioTotal: number
  numeroFactura?: string | null
  empleadoId: string
}

export type CargaCombustibleListFilters = {
  page?: number
  size?: number
  search?: string
  activoId?: string
  viajeVehicularId?: string
  insumoId?: string
  empleadoId?: string
  fechaDesde?: string
  fechaHasta?: string
  sort?: string
}

export const listCargasCombustible = (
  filters?: CargaCombustibleListFilters
): Promise<PageResponse<CargaCombustible>> => {
  return http.get<PageResponse<CargaCombustible>>(
    cargaCombustibleEndpoints.root,
    { params: filters }
  )
}

export const getCargaCombustible = (id: string): Promise<CargaCombustible> => {
  return http.get<CargaCombustible>(cargaCombustibleEndpoints.byId(id))
}

export const getCargasByActivo = (
  activoId: string
): Promise<CargaCombustible[]> => {
  return http.get<CargaCombustible[]>(
    cargaCombustibleEndpoints.byActivo(activoId)
  )
}

export const getCargasByViaje = (
  viajeId: string
): Promise<CargaCombustible[]> => {
  return http.get<CargaCombustible[]>(
    cargaCombustibleEndpoints.byViaje(viajeId)
  )
}

export const createCargaCombustible = (
  payload: CargaCombustiblePayload
): Promise<CargaCombustible> => {
  return http.post<CargaCombustible>(cargaCombustibleEndpoints.root, payload)
}

export const updateCargaCombustible = (
  id: string,
  payload: CargaCombustibleUpdatePayload
): Promise<CargaCombustible> => {
  return http.put<CargaCombustible>(cargaCombustibleEndpoints.byId(id), payload)
}

export const deleteCargaCombustible = (id: string): Promise<void> => {
  return http.delete<void>(cargaCombustibleEndpoints.byId(id))
}
