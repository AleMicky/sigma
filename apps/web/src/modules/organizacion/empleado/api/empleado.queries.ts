import { queryOptions } from "@tanstack/react-query"

import { empleadoKeys, type EmpleadoListFilters } from "./empleado.keys"
import {
  getEmpleado,
  listEmpleados,
  listEmpleadosByArea,
  listMisEmpleados,
} from "./empleado.service"

export const empleadoQueries = {
  list: (filters?: EmpleadoListFilters) =>
    queryOptions({
      queryKey: empleadoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listEmpleados(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  misEmpleados: (filters?: EmpleadoListFilters) =>
    queryOptions({
      queryKey: empleadoKeys.misEmpleados(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listMisEmpleados(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  byArea: (areaId: string, filters?: Omit<EmpleadoListFilters, "areaId">) =>
    queryOptions({
      queryKey: empleadoKeys.byArea(areaId, filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listEmpleadosByArea(areaId, trimmed ? { ...rest, q: trimmed } : rest)
      },
      enabled: Boolean(areaId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: empleadoKeys.detail(id),
      queryFn: () => getEmpleado(id),
      enabled: Boolean(id),
    }),
}
