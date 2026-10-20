import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import type { AsignacionVehicular } from "@/modules/gestionvehicular/asignacion-vehicular/api/asignacion-vehicular.service"
import { viajeVehicularEndpoints } from "./viaje-vehicular.endpoints"

export type EstadoViajeVehicular =
  | "PROGRAMADO"
  | "EN_CURSO"
  | "FINALIZADO"
  | "CANCELADO"

export type ViajeVehicular = AuditableEntity & {
  id: string
  asignacionVehicularId: string
  asignacionVehicular?: AsignacionVehicular | null
  fechaSalidaReal?: string | null
  kilometrajeSalida?: number | null
  fechaRetornoReal?: string | null
  kilometrajeRetorno?: number | null
  kilometrajeRecorrido?: number | null
  estado: EstadoViajeVehicular
  observacion?: string | null
}

export interface ViajeVehicularFiltros extends PageParams {
  search?: string
  asignacionVehicularId?: string
  solicitudVehicularId?: string
  activoId?: string
  conductorId?: string
  estado?: EstadoViajeVehicular
  fechaDesde?: string
  fechaHasta?: string
  sort?: string
}

export const getViajeByAsignacion = (
  asignacionId: string
): Promise<ViajeVehicular | null> => {
  return http.get<ViajeVehicular | null>(
    viajeVehicularEndpoints.byAsignacion(asignacionId)
  )
}

export const getViajeBySolicitud = (
  solicitudId: string
): Promise<ViajeVehicular | null> => {
  return http.get<ViajeVehicular | null>(
    viajeVehicularEndpoints.bySolicitud(solicitudId)
  )
}

export const listViajes = (
  params?: ViajeVehicularFiltros
): Promise<PageResponse<ViajeVehicular>> => {
  return http.get<PageResponse<ViajeVehicular>>(viajeVehicularEndpoints.root, {
    params,
  })
}

export const exportarViajesExcel = async (
  filtros?: Omit<ViajeVehicularFiltros, "page" | "size" | "sort">
): Promise<void> => {
  const params: Record<string, string> = {}

  if (filtros?.search) params.search = filtros.search
  if (filtros?.activoId) params.activoId = filtros.activoId
  if (filtros?.conductorId) params.conductorId = filtros.conductorId
  if (filtros?.estado) params.estado = filtros.estado
  if (filtros?.fechaDesde) params.fechaDesde = filtros.fechaDesde
  if (filtros?.fechaHasta) params.fechaHasta = filtros.fechaHasta

  const blob = await http.get<Blob>(viajeVehicularEndpoints.exportarExcel, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const fechaHoy = new Date().toISOString().split("T")[0]
  a.download = `historial-viajes-vehiculares-${fechaHoy}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
