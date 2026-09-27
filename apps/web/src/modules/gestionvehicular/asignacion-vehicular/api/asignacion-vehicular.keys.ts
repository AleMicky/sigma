import type { PageParams } from "@/shared/types/api.types"

export type AsignacionVehicularListFilters = PageParams & {
  search?: string
  solicitudVehicularId?: string
  activoId?: string
  conductorId?: string
  asignadoPorId?: string
}

export const asignacionVehicularKeys = {
  all: ["asignaciones-vehiculares"] as const,
  lists: () => [...asignacionVehicularKeys.all, "list"] as const,
  list: (filters?: AsignacionVehicularListFilters) =>
    [...asignacionVehicularKeys.lists(), filters] as const,
  details: () => [...asignacionVehicularKeys.all, "detail"] as const,
  detail: (id: string) => [...asignacionVehicularKeys.details(), id] as const,
  bySolicitud: (solicitudVehicularId: string) =>
    [...asignacionVehicularKeys.all, "by-solicitud", solicitudVehicularId] as const,
}
