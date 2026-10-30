import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type SolicitudVehicularListFilters = PageParams & {
  search?: string
  estado?: string
  tipoSolicitudVehicularId?: string
  solicitanteId?: string
  conductorAsignadoId?: string
  responsableAsignacionId?: string
  interfaz?: string
}

export type ReporteSolicitudesFilters = {
  search?: string
  activoId?: string
  solicitanteId?: string
  conductorId?: string
  tipoSolicitudVehicularId?: string
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
}

export const solicitudVehicularKeys = {
  ...createResourceKeys<
    "solicitudes-vehiculares",
    SolicitudVehicularListFilters
  >("solicitudes-vehiculares"),
  calendario: (filters?: Record<string, unknown>) =>
    ["solicitudes-vehiculares", "calendario", filters] as const,
  reportes: {
    all: ["reportes-solicitudes-vehiculares"] as const,
    general: (filters?: ReporteSolicitudesFilters) =>
      ["reportes-solicitudes-vehiculares", "general", filters] as const,
  },
}
