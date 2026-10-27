import { queryOptions } from "@tanstack/react-query"

import type { GestionVehicularDashboardFilterParams } from "../types/gestion-vehicular-dashboard.types"
import { getGestionVehicularDashboard } from "./gestion-vehicular-dashboard.service"

export const gestionVehicularDashboardKeys = {
  all: ["gestion-vehicular", "dashboard"] as const,
  byFilter: (params?: GestionVehicularDashboardFilterParams) =>
    [...gestionVehicularDashboardKeys.all, params ?? {}] as const,
}

export const gestionVehicularDashboardQueries = {
  data: (params?: GestionVehicularDashboardFilterParams) =>
    queryOptions({
      queryKey: gestionVehicularDashboardKeys.byFilter(params),
      queryFn: () => getGestionVehicularDashboard(params),
      staleTime: 1000 * 60 * 3, // 3 minutos
    }),
}

