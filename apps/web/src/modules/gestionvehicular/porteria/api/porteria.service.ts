import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { porteriaEndpoints } from "./porteria.endpoints"
import type {
  AnularRegistroPorteriaRequest,
  PorteriaFiltros,
  RegistrarLlegadaPorteriaRequest,
  RegistrarSalidaPorteriaRequest,
  RegistroPorteria,
} from "./porteria.types"

export const listRegistrosPorteria = (
  params?: PorteriaFiltros
): Promise<PageResponse<RegistroPorteria>> => {
  return http.get<PageResponse<RegistroPorteria>>(porteriaEndpoints.root, {
    params,
  })
}

export const listRegistrosAfuera = (): Promise<RegistroPorteria[]> => {
  return http.get<RegistroPorteria[]>(porteriaEndpoints.afuera)
}

export const getRegistroPorteriaById = (id: string): Promise<RegistroPorteria> => {
  return http.get<RegistroPorteria>(porteriaEndpoints.byId(id))
}

export const registrarSalidaPorteria = (
  data: RegistrarSalidaPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.salidas, data)
}

export const registrarLlegadaPorteria = (
  id: string,
  data?: RegistrarLlegadaPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.llegada(id), data)
}

export const anularRegistroPorteria = (
  id: string,
  data?: AnularRegistroPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.anular(id), data)
}

