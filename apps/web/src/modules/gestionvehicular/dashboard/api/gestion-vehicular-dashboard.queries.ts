import { queryOptions } from "@tanstack/react-query"

import { getGestionVehicularDashboard } from "./gestion-vehicular-dashboard.service"

export const gestionVehicularDashboardKeys = {
  all: ["gestion-vehicular", "dashboard"] as const,
  byPeriodo: (meses: number) =>
    [...gestionVehicularDashboardKeys.all, { meses }] as const,
}

export const gestionVehicularDashboardQueries = {
  data: (meses: number = 6) =>
    queryOptions({
      queryKey: gestionVehicularDashboardKeys.byPeriodo(meses),
      queryFn: () => getGestionVehicularDashboard(meses),
      staleTime: 1000 * 60 * 3, // 3 minutos
    }),
}
