import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type TipoSolicitudVehicularListFilters = PageParams & {
  search?: string
}

export const tipoSolicitudVehicularKeys = createResourceKeys<
  "tipos-solicitud-vehicular",
  TipoSolicitudVehicularListFilters
>("tipos-solicitud-vehicular")
