import type { SolicitudMantenimientoFilters } from "../types/solicitud.type"

export const solicitudKeys = {
  all: ["solicitudes-mantenimiento"] as const,
  resumen: (interfaz?: string) => [...solicitudKeys.all, "resumen", interfaz ?? "all"] as const,
  lists: () => [...solicitudKeys.all, "list"] as const,
  list: (filters?: SolicitudMantenimientoFilters) => [...solicitudKeys.lists(), filters ?? {}] as const,
  details: () => [...solicitudKeys.all, "detail"] as const,
  detail: (id: string) => [...solicitudKeys.details(), id] as const,
  trazabilidad: (id: string) => [...solicitudKeys.detail(id), "trazabilidad"] as const,
}
