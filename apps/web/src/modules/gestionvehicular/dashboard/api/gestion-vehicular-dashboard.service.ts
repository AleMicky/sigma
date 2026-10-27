import { http } from "@/shared/api"

import type {
  GestionVehicularDashboardData,
  GestionVehicularDashboardFilterParams,
} from "../types/gestion-vehicular-dashboard.types"

export const getGestionVehicularDashboard = (
  params?: GestionVehicularDashboardFilterParams
): Promise<GestionVehicularDashboardData> => {
  return http.get<GestionVehicularDashboardData>(
    "/gestion-vehicular/dashboard",
    {
      params: {
        meses: params?.meses ?? 6,
        ...(params?.flotaId ? { flotaId: params.flotaId } : {}),
      },
    }
  )
}

