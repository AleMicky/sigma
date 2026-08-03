import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type EmpleadoListFilters = PageParams & {
  personaId?: string
  areaId?: string
  cargoId?: string
}

export const empleadoKeys = createResourceKeys<"empleados", EmpleadoListFilters>("empleados")
