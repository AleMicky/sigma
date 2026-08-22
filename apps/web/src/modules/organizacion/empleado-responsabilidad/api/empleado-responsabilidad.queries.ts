import { queryOptions } from "@tanstack/react-query"

import {
  empleadoResponsabilidadKeys,
  type EmpleadoResponsabilidadFilters,
} from "./empleado-responsabilidad.keys"
import {
  getEmpleadoResponsabilidad,
  listEmpleadoResponsabilidades,
} from "./empleado-responsabilidad.service"

export const empleadoResponsabilidadQueries = {
  list: (filters?: EmpleadoResponsabilidadFilters) =>
    queryOptions({
      queryKey: empleadoResponsabilidadKeys.list(filters),
      queryFn: () => listEmpleadoResponsabilidades(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: empleadoResponsabilidadKeys.detail(id),
      queryFn: () => getEmpleadoResponsabilidad(id),
      enabled: Boolean(id),
    }),
}
