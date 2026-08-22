import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type {
  CatalogoResumen,
  EmpleadoResumen,
} from "@/shared/types/resumen.types"

import { empleadoResponsabilidadEndpoints } from "./empleado-responsabilidad.endpoints"
import type { EmpleadoResponsabilidadFilters } from "./empleado-responsabilidad.keys"

export type EmpleadoResponsabilidad = AuditableEntity & {
  empleadoInfo?: EmpleadoResumen | null
  responsabilidadInfo?: CatalogoResumen | null
  fechaInicio: string
  fechaFin: string | null
  empleadoId?: string
  responsabilidadId?: string
}

export type EmpleadoResponsabilidadPayload = {
  empleadoId: string
  responsabilidadId: string
  fechaInicio: string
  fechaFin?: string | null
}

export async function listEmpleadoResponsabilidades(
  filters?: EmpleadoResponsabilidadFilters,
): Promise<PageResponse<EmpleadoResponsabilidad>> {
  return http.get<PageResponse<EmpleadoResponsabilidad>>(
    empleadoResponsabilidadEndpoints.root,
    { params: filters },
  )
}

export async function getEmpleadoResponsabilidad(
  id: string,
): Promise<EmpleadoResponsabilidad> {
  return http.get<EmpleadoResponsabilidad>(
    empleadoResponsabilidadEndpoints.byId(id),
  )
}

export async function createEmpleadoResponsabilidad(
  payload: EmpleadoResponsabilidadPayload,
): Promise<EmpleadoResponsabilidad> {
  return http.post<
    EmpleadoResponsabilidad,
    EmpleadoResponsabilidadPayload
  >(empleadoResponsabilidadEndpoints.root, payload)
}

export async function updateEmpleadoResponsabilidad(
  id: string,
  payload: EmpleadoResponsabilidadPayload,
): Promise<EmpleadoResponsabilidad> {
  return http.put<
    EmpleadoResponsabilidad,
    EmpleadoResponsabilidadPayload
  >(empleadoResponsabilidadEndpoints.byId(id), payload)
}

export async function deleteEmpleadoResponsabilidad(id: string): Promise<void> {
  await http.delete<void>(empleadoResponsabilidadEndpoints.byId(id))
}
