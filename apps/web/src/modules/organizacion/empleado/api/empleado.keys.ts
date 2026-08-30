import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type EmpleadoListFilters = PageParams & {
  personaId?: string
  areaId?: string
  cargoId?: string
}

const baseKeys = createResourceKeys<"empleados", EmpleadoListFilters>("empleados")

export const empleadoKeys = {
  ...baseKeys,
  misEmpleados: (filters?: EmpleadoListFilters) =>
    [...baseKeys.all, "mis-empleados", filters] as const,
  byArea: (areaId: string, filters?: EmpleadoListFilters) =>
    [...baseKeys.all, "by-area", areaId, filters] as const,
}
