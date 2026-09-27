import { queryOptions } from "@tanstack/react-query"

import { controlActivoVehicularKeys } from "./control-activo.keys"
import {
  getControlActivoVehicular,
  getControlActivoVehicularDetalle,
  listControlActivoVehicularDetalles,
  listControlesActivosByActivoVehicular,
  listControlesActivosByAsignacionVehicular,
  listControlesActivosBySolicitudVehicular,
  listControlesActivosVehiculares,
  type ControlActivoVehicularDetalleFilters,
  type ControlActivoVehicularFilters,
} from "./control-activo.service"

export const controlActivoVehicularQueries = {
  list: (filters?: ControlActivoVehicularFilters) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.list(filters),
      queryFn: () => listControlesActivosVehiculares(filters),
    }),

  bySolicitud: (solicitudId?: string | null) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.bySolicitud(solicitudId),
      queryFn: () =>
        solicitudId
          ? listControlesActivosBySolicitudVehicular(solicitudId)
          : Promise.resolve([]),
      enabled: Boolean(solicitudId),
    }),

  byAsignacion: (asignacionId?: string | null) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.byAsignacion(asignacionId),
      queryFn: () =>
        asignacionId
          ? listControlesActivosByAsignacionVehicular(asignacionId)
          : Promise.resolve([]),
      enabled: Boolean(asignacionId),
    }),

  byActivo: (activoId?: string | null) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.byActivo(activoId),
      queryFn: () =>
        activoId
          ? listControlesActivosByActivoVehicular(activoId)
          : Promise.resolve([]),
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.detail(id),
      queryFn: () => getControlActivoVehicular(id),
      enabled: Boolean(id),
    }),

  detallesList: (filters?: ControlActivoVehicularDetalleFilters) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.detalles.list(filters),
      queryFn: () => listControlActivoVehicularDetalles(filters),
    }),

  detalle: (id: string) =>
    queryOptions({
      queryKey: controlActivoVehicularKeys.detalles.detail(id),
      queryFn: () => getControlActivoVehicularDetalle(id),
      enabled: Boolean(id),
    }),
}
