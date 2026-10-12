import { queryOptions } from "@tanstack/react-query"
import {
  getViajeByAsignacion,
  getViajeBySolicitud,
} from "./viaje-vehicular.service"

export const viajeVehicularKeys = {
  all: ["viajes-vehiculares"] as const,
  byAsignacion: (asignacionId: string) =>
    [...viajeVehicularKeys.all, "asignacion", asignacionId] as const,
  bySolicitud: (solicitudId: string) =>
    [...viajeVehicularKeys.all, "solicitud", solicitudId] as const,
}

export const viajeVehicularQueries = {
  byAsignacion: (asignacionId?: string | null) =>
    queryOptions({
      queryKey: viajeVehicularKeys.byAsignacion(asignacionId ?? ""),
      queryFn: () => (asignacionId ? getViajeByAsignacion(asignacionId) : null),
      enabled: Boolean(asignacionId),
      staleTime: 1000 * 60 * 2,
    }),
  bySolicitud: (solicitudId?: string | null) =>
    queryOptions({
      queryKey: viajeVehicularKeys.bySolicitud(solicitudId ?? ""),
      queryFn: () => (solicitudId ? getViajeBySolicitud(solicitudId) : null),
      enabled: Boolean(solicitudId),
      staleTime: 1000 * 60 * 2,
    }),
}
