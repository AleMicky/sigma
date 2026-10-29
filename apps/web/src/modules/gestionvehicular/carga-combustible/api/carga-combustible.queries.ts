import { queryOptions } from "@tanstack/react-query"

import { cargaCombustibleKeys } from "./carga-combustible.keys"
import {
  getCargaCombustible,
  getCargasByActivo,
  getCargasBySalida,
  getCargasByViaje,
  listCargasCombustible,
  type CargaCombustibleListFilters,
} from "./carga-combustible.service"

export const cargaCombustibleQueries = {
  list: (filters?: CargaCombustibleListFilters) =>
    queryOptions({
      queryKey: cargaCombustibleKeys.list(filters),
      queryFn: () => listCargasCombustible(filters),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: cargaCombustibleKeys.detail(id),
      queryFn: () => getCargaCombustible(id),
      enabled: Boolean(id),
    }),

  byActivo: (activoId: string) =>
    queryOptions({
      queryKey: cargaCombustibleKeys.byActivo(activoId),
      queryFn: () => getCargasByActivo(activoId),
      enabled: Boolean(activoId),
    }),

  byViaje: (viajeId: string) =>
    queryOptions({
      queryKey: cargaCombustibleKeys.byViaje(viajeId),
      queryFn: () => getCargasByViaje(viajeId),
      enabled: Boolean(viajeId),
    }),

  bySalida: (salidaId: string) =>
    queryOptions({
      queryKey: cargaCombustibleKeys.bySalida(salidaId),
      queryFn: () => getCargasBySalida(salidaId),
      enabled: Boolean(salidaId),
    }),
}
