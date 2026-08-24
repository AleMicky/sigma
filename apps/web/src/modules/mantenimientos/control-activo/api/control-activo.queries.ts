import { queryOptions } from "@tanstack/react-query"

import { controlActivoKeys } from "./control-activo.keys"
import {
  type ControlActivoDetalleFilters,
  type ControlActivoFilters,
  getControlActivo,
  getControlActivoDetalle,
  listControlActivoDetalles,
  listControlesActivos,
} from "./control-activo.service"

export const controlActivoQueries = {
  list: (filters?: ControlActivoFilters) =>
    queryOptions({
      queryKey: controlActivoKeys.list(filters),
      queryFn: () => listControlesActivos(filters),
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
