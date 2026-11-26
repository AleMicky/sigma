import { queryOptions } from "@tanstack/react-query"

import {
  getGestionVehicularTotales,
  type GestionVehicularTotalesFiltros,
  type ModuloTotalesGestionVehicular,
} from "./gestion-vehicular-totales.service"

export const gestionVehicularTotalesKeys = {
  all: ["gestion-vehicular", "totales"] as const,
  byModulo: (
    modulo: ModuloTotalesGestionVehicular,
    filtros?: GestionVehicularTotalesFiltros
  ) => [...gestionVehicularTotalesKeys.all, modulo, filtros ?? {}] as const,
}

export const gestionVehicularTotalesQueries = {
  byModulo: (
    modulo: ModuloTotalesGestionVehicular,
    filtros?: GestionVehicularTotalesFiltros
  ) =>
    queryOptions({
      queryKey: gestionVehicularTotalesKeys.byModulo(modulo, filtros),
      queryFn: () => getGestionVehicularTotales(modulo, filtros),
    }),
}
