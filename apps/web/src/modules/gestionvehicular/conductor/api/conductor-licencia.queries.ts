import { queryOptions } from "@tanstack/react-query"

import {
  getLicencia,
  listLicenciasByConductor,
} from "./conductor-licencia.service"

export const conductorLicenciaKeys = {
  all: ["conductor-licencias"] as const,
  byConductor: (conductorId: string) =>
    [...conductorLicenciaKeys.all, "byConductor", conductorId] as const,
  detail: (id: string) => [...conductorLicenciaKeys.all, "detail", id] as const,
}

export const conductorLicenciaQueries = {
  byConductor: (conductorId: string) =>
    queryOptions({
      queryKey: conductorLicenciaKeys.byConductor(conductorId),
      queryFn: () => listLicenciasByConductor(conductorId),
      enabled: Boolean(conductorId),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: conductorLicenciaKeys.detail(id),
      queryFn: () => getLicencia(id),
      enabled: Boolean(id),
    }),
}
