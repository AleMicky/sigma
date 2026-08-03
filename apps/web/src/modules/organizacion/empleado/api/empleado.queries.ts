import { queryOptions } from "@tanstack/react-query"

import { empleadoKeys, type EmpleadoListFilters } from "./empleado.keys"
import { getEmpleado, listEmpleados } from "./empleado.service"

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

  detail: (id: string) =>
    queryOptions({
      queryKey: empleadoKeys.detail(id),
      queryFn: () => getEmpleado(id),
      enabled: Boolean(id),
    }),
}
