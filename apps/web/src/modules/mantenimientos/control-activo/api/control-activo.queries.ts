import { queryOptions } from "@tanstack/react-query"

import { controlActivoKeys } from "./control-activo.keys"
import {
  type ControlActivoDetalleFilters,
  type ControlActivoFilters,
  getControlActivo,
  getControlActivoDetalle,
  listControlActivoDetalles,
  listControlesActivos,
  listControlesActivosByActivo,
  listControlesActivosByOrdenTrabajo,
  listControlesActivosBySolicitud,
} from "./control-activo.service"

export const controlActivoQueries = {
  list: (filters?: ControlActivoFilters) =>
    queryOptions({
      queryKey: controlActivoKeys.list(filters),
      queryFn: () => listControlesActivos(filters),
    }),

  bySolicitud: (solicitudId?: string | null) =>
    queryOptions({
      queryKey: controlActivoKeys.bySolicitud(solicitudId),
      queryFn: () =>
        solicitudId
          ? listControlesActivosBySolicitud(solicitudId)
          : Promise.resolve([]),
      enabled: Boolean(solicitudId),
    }),

  byOrdenTrabajo: (ordenTrabajoId?: string | null) =>
    queryOptions({
      queryKey: controlActivoKeys.byOrdenTrabajo(ordenTrabajoId),
      queryFn: () =>
        ordenTrabajoId
          ? listControlesActivosByOrdenTrabajo(ordenTrabajoId)
          : Promise.resolve([]),
      enabled: Boolean(ordenTrabajoId),
    }),

  byActivo: (activoId?: string | null) =>
    queryOptions({
      queryKey: controlActivoKeys.byActivo(activoId),
      queryFn: () =>
        activoId ? listControlesActivosByActivo(activoId) : Promise.resolve([]),
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: controlActivoKeys.detail(id),
      queryFn: () => getControlActivo(id),
      enabled: Boolean(id),
    }),

  detallesList: (filters?: ControlActivoDetalleFilters) =>
    queryOptions({
      queryKey: controlActivoKeys.detalles.list(filters),
      queryFn: () => listControlActivoDetalles(filters),
    }),

  detalleDetail: (id: string) =>
    queryOptions({
      queryKey: controlActivoKeys.detalles.detail(id),
      queryFn: () => getControlActivoDetalle(id),
      enabled: Boolean(id),
    }),
}
