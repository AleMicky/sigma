import { queryOptions } from "@tanstack/react-query"

import { vehiculoKeys } from "./vehiculo.keys"
import {
  getVehiculoCatalogoById,
  listVehiculosCatalogo,
} from "./vehiculo.service"
import type { VehiculoCatalogoFilters } from "./vehiculo.types"

export const vehiculoQueries = {
  list: (filters?: VehiculoCatalogoFilters) =>
    queryOptions({
      queryKey: vehiculoKeys.list(filters),
      queryFn: () => listVehiculosCatalogo(filters),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: vehiculoKeys.detail(id),
      queryFn: () => getVehiculoCatalogoById(id),
      enabled: Boolean(id),
    }),
}
