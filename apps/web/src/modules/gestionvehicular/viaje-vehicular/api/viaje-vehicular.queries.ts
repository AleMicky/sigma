import { queryOptions } from "@tanstack/react-query"
import {
  getViajeByAsignacion,
  getViajeBySolicitud,
  listViajes,
  type ViajeVehicularFiltros,
} from "./viaje-vehicular.service"

export const viajeVehicularKeys = {
  all: ["viajes-vehiculares"] as const,
  lists: () => [...viajeVehicularKeys.all, "list"] as const,
  list: (filtros?: ViajeVehicularFiltros) =>
    [...viajeVehicularKeys.lists(), filtros] as const,
  byAsignacion: (asignacionId: string) =>
    [...viajeVehicularKeys.all, "asignacion", asignacionId] as const,
  bySolicitud: (solicitudId: string) =>
    [...viajeVehicularKeys.all, "solicitud", solicitudId] as const,
}

export const viajeVehicularQueries = {
  list: (filtros?: ViajeVehicularFiltros) =>
    queryOptions({
      queryKey: viajeVehicularKeys.list(filtros),
      queryFn: () => listViajes(filtros),
      staleTime: 1000 * 30,
    }),
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
