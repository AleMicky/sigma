import type { PageParams } from "@/shared/types/api.types"

export type EmpleadoResponsabilidadFilters = PageParams & {
  responsabilidadId?: string
}

export const empleadoResponsabilidadKeys = {
  all: ["empleado-responsabilidades"] as const,
  lists: () => [...empleadoResponsabilidadKeys.all, "list"] as const,
  list: (filters?: EmpleadoResponsabilidadFilters) =>
    [...empleadoResponsabilidadKeys.lists(), filters] as const,
  details: () => [...empleadoResponsabilidadKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...empleadoResponsabilidadKeys.details(), id] as const,
  byResponsabilidadCodigo: (codigo: string) =>
    [...empleadoResponsabilidadKeys.all, "responsabilidad", codigo] as const,
}
