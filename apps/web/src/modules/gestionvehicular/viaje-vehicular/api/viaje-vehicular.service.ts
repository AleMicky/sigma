import { http } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { viajeVehicularEndpoints } from "./viaje-vehicular.endpoints"

export type EstadoViajeVehicular =
  | "PROGRAMADO"
  | "EN_CURSO"
  | "FINALIZADO"
  | "CANCELADO"

export type ViajeVehicular = AuditableEntity & {
  id: string
  asignacionVehicularId: string
  fechaSalidaReal?: string | null
  kilometrajeSalida?: number | null
  fechaRetornoReal?: string | null
  kilometrajeRetorno?: number | null
  estado: EstadoViajeVehicular
  observacion?: string | null
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
