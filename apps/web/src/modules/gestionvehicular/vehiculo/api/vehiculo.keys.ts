import type { VehiculoCatalogoFilters } from "./vehiculo.types"

export const vehiculoKeys = {
  all: ["gestion-vehicular", "vehiculos"] as const,
  lists: () => [...vehiculoKeys.all, "list"] as const,
  list: (filters?: VehiculoCatalogoFilters) =>
    [...vehiculoKeys.lists(), filters ?? {}] as const,
  details: () => [...vehiculoKeys.all, "detail"] as const,
  detail: (id: string) => [...vehiculoKeys.details(), id] as const,
}
