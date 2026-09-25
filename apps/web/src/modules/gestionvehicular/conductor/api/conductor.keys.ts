import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ConductorListFilters = PageParams & {
  search?: string
  categoria?: string
  empleadoId?: string
  activo?: boolean
}

export const conductorKeys = createResourceKeys<"conductores", ConductorListFilters>("conductores")
