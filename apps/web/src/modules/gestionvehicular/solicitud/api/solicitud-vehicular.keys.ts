import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type SolicitudVehicularListFilters = PageParams & {
  search?: string
  estado?: string
  tipoSolicitudVehicularId?: string
  solicitanteId?: string
}

export const solicitudVehicularKeys = createResourceKeys<
  "solicitudes-vehiculares",
  SolicitudVehicularListFilters
>("solicitudes-vehiculares")
