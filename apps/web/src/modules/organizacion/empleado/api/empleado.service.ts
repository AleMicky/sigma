import { createCrudService, http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { empleadoEndpoints } from "./empleado.endpoints"
import type { EmpleadoListFilters } from "./empleado.keys"

export type Empleado = AuditableEntity & {
  personaId: string
  personaNombreCompleto?: string | null
  personaDocumento?: string | null
  areaId: string
  areaNombre?: string | null
  cargoId: string
  cargoNombre?: string | null
  codigo: string
  fechaInicio: string | null
  fechaFin: string | null
}

export type EmpleadoPayload = {
  personaId: string
  areaId: string
  cargoId: string
  codigo: string
  fechaInicio?: string | null
  fechaFin?: string | null
}

const crud = createCrudService<Empleado, EmpleadoPayload>(empleadoEndpoints)

export const listEmpleados = (filters?: EmpleadoListFilters): Promise<PageResponse<Empleado>> => {
  if (filters?.personaId || filters?.areaId || filters?.cargoId || filters?.q) {
    return http.get<PageResponse<Empleado>>(empleadoEndpoints.buscar, { params: filters })
  }
  return crud.list(filters)
}

export const listEmpleadosByArea = (
  areaId: string,
  filters?: EmpleadoListFilters,
): Promise<PageResponse<Empleado>> => {
  return http.get<PageResponse<Empleado>>(empleadoEndpoints.byArea(areaId), {
    params: filters,
  })
}

export const getEmpleado = crud.get
export const createEmpleado = crud.create
export const updateEmpleado = crud.update
export const deleteEmpleado = crud.remove
