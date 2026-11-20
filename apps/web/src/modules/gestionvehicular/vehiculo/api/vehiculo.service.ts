import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { vehiculoEndpoints } from "./vehiculo.endpoints"
import type {
  VehiculoCatalogo,
  VehiculoCatalogoFilters,
} from "./vehiculo.types"

export function listVehiculosCatalogo(
  params?: VehiculoCatalogoFilters,
): Promise<PageResponse<VehiculoCatalogo>> {
  return http.get<PageResponse<VehiculoCatalogo>>(vehiculoEndpoints.root, {
    params,
  })
}

export function getVehiculoCatalogoById(id: string): Promise<VehiculoCatalogo> {
  return http.get<VehiculoCatalogo>(vehiculoEndpoints.byId(id))
}
