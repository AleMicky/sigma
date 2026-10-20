import { http } from "@/shared/api"

import type { GestionVehicularDashboardData } from "../types/gestion-vehicular-dashboard.types"

export const getGestionVehicularDashboard = (
  meses: number = 6
): Promise<GestionVehicularDashboardData> => {
  return http.get<GestionVehicularDashboardData>(
    "/gestion-vehicular/dashboard",
    {
      params: { meses },
    }
  )
}
