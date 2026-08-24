import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { CONTROL_ACTIVO_ENDPOINTS } from "./control-activo.endpoints"

export type TipoControlActivo = "ENTREGA" | "DEVOLUCION"

export type ActivoInfo = {
  id: string
  codigo: string
  nombre: string
}

export type UserInfo = {
  id: string
  nombre: string
}

export type AccesorioInfo = {
  id: string
  codigo: string
  nombre: string
}

export type ControlActivo = AuditableEntity & {
  id: string
  solicitudMantenimientoId: string
  ordenTrabajoId?: string | null
  activo?: ActivoInfo | null
  tipo: TipoControlActivo
  entregadoPor?: UserInfo | null
  recibidoPor?: UserInfo | null
  fecha: string
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoPayload = {
  solicitudMantenimientoId: string
  ordenTrabajoId?: string | null
  activoId: string
  tipo: TipoControlActivo
  entregadoPorId?: string | null
  recibidoPorId?: string | null
  fecha: string
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoDetalle = AuditableEntity & {
  id: string
  controlActivoId: string
  accesorio?: AccesorioInfo | null
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoDetallePayload = {
  controlActivoId: string
  accesorioId: string
  cantidadEsperada: number
  cantidadEncontrada: number
  conforme: boolean
  observacion?: string | null
}

export type ControlActivoFilters = PageParams & {
  solicitudMantenimientoId?: string
  activoId?: string
  tipo?: TipoControlActivo
}

export type ControlActivoDetalleFilters = PageParams & {
  controlActivoId?: string
}

// Service Methods for ControlActivo
export async function listControlesActivos(
  filters?: ControlActivoFilters,
): Promise<PageResponse<ControlActivo>> {
  return http.get<PageResponse<ControlActivo>>(CONTROL_ACTIVO_ENDPOINTS.root, {
    params: filters,
  })
}

export async function getControlActivo(id: string): Promise<ControlActivo> {
  return http.get<ControlActivo>(CONTROL_ACTIVO_ENDPOINTS.detail(id))
}

export async function createControlActivo(
  payload: ControlActivoPayload,
): Promise<ControlActivo> {
  return http.post<ControlActivo>(CONTROL_ACTIVO_ENDPOINTS.root, payload)
}

export async function updateControlActivo(
  id: string,
  payload: ControlActivoPayload,
): Promise<ControlActivo> {
  return http.put<ControlActivo>(CONTROL_ACTIVO_ENDPOINTS.detail(id), payload)
}

export async function deleteControlActivo(id: string): Promise<void> {
  return http.delete<void>(CONTROL_ACTIVO_ENDPOINTS.detail(id))
}

// Service Methods for ControlActivoDetalle
export async function listControlActivoDetalles(
  filters?: ControlActivoDetalleFilters,
): Promise<PageResponse<ControlActivoDetalle>> {
  return http.get<PageResponse<ControlActivoDetalle>>(
    CONTROL_ACTIVO_ENDPOINTS.detalles.root,
    {
      params: filters,
    },
  )
}

export async function getControlActivoDetalle(
  id: string,
): Promise<ControlActivoDetalle> {
  return http.get<ControlActivoDetalle>(
    CONTROL_ACTIVO_ENDPOINTS.detalles.detail(id),
  )
}

export async function createControlActivoDetalle(
  payload: ControlActivoDetallePayload,
): Promise<ControlActivoDetalle> {
  return http.post<ControlActivoDetalle>(
    CONTROL_ACTIVO_ENDPOINTS.detalles.root,
    payload,
  )
}

export async function updateControlActivoDetalle(
  id: string,
  payload: ControlActivoDetallePayload,
): Promise<ControlActivoDetalle> {
  return http.put<ControlActivoDetalle>(
    CONTROL_ACTIVO_ENDPOINTS.detalles.detail(id),
    payload,
  )
}

export async function deleteControlActivoDetalle(id: string): Promise<void> {
  return http.delete<void>(CONTROL_ACTIVO_ENDPOINTS.detalles.detail(id))
}
