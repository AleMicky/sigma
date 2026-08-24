import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { grupoAprobadorDependienteKeys } from "./grupo-aprobador-dependiente.keys"
import {
  getAprobadoresSelectByEmpleado,
  getDependientesSelectByAprobador,
  getGrupoAprobadorDependiente,
  listGrupoAprobadorDependientes,
} from "./grupo-aprobador-dependiente.service"

export const grupoAprobadorDependienteQueries = {
  list: (grupoAprobadorId: string, params?: PageParams) =>
    queryOptions({
      queryKey: grupoAprobadorDependienteKeys.list(grupoAprobadorId, params),
      queryFn: () =>
        listGrupoAprobadorDependientes(grupoAprobadorId, params),
    }),
  detail: (grupoAprobadorId: string, id: string) =>
    queryOptions({
      queryKey: grupoAprobadorDependienteKeys.detail(grupoAprobadorId, id),
      queryFn: () => getGrupoAprobadorDependiente(grupoAprobadorId, id),
    }),
  aprobadoresSelect: (empleadoId: string) =>
    queryOptions({
      queryKey: grupoAprobadorDependienteKeys.aprobadoresSelect(empleadoId),
      queryFn: () => getAprobadoresSelectByEmpleado(empleadoId),
      enabled: Boolean(empleadoId),
    }),
  dependientesSelect: (aprobadorId?: string | null) =>
    queryOptions({
      queryKey: grupoAprobadorDependienteKeys.dependientesSelect(aprobadorId ?? ""),
      queryFn: () => getDependientesSelectByAprobador(aprobadorId!),
      enabled: Boolean(aprobadorId),
      staleTime: 1000 * 60 * 5,
    }),
}
