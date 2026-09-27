import { queryOptions } from "@tanstack/react-query"

import { flotaKeys } from "./flota.keys"
import { type FlotaQueryParams, flotaService } from "./flota.service"

export const flotaQueries = {
  list: (params?: FlotaQueryParams) =>
    queryOptions({
      queryKey: flotaKeys.list(params),
      queryFn: () => flotaService.list(params),
    }),

  activas: () =>
    queryOptions({
      queryKey: flotaKeys.activas(),
      queryFn: () => flotaService.listActivas(),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: flotaKeys.detail(id),
      queryFn: () => flotaService.getById(id),
      enabled: Boolean(id),
    }),

  vehiculos: (flotaId: string) =>
    queryOptions({
      queryKey: flotaKeys.vehiculos(flotaId),
      queryFn: () => flotaService.listVehiculosByFlota(flotaId),
      enabled: Boolean(flotaId),
    }),

  vehiculosByEmpleado: (empleadoId: string, activo?: boolean) =>
    queryOptions({
      queryKey: flotaKeys.vehiculosByEmpleado(empleadoId, activo),
      queryFn: () => flotaService.listVehiculosByEmpleado(empleadoId, activo),
      enabled: Boolean(empleadoId),
    }),

  responsables: (flotaId: string) =>
    queryOptions({
      queryKey: flotaKeys.responsables(flotaId),
      queryFn: () => flotaService.listResponsablesByFlota(flotaId),
      enabled: Boolean(flotaId),
    }),

  flotasByEmpleado: (empleadoId: string) =>
    queryOptions({
      queryKey: flotaKeys.flotasByEmpleado(empleadoId),
      queryFn: () => flotaService.listFlotasByEmpleado(empleadoId),
      enabled: Boolean(empleadoId),
    }),
}
