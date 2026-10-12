import type { CargaCombustibleListFilters } from "./carga-combustible.service"

export const cargaCombustibleKeys = {
  all: ["cargas-combustible"] as const,
  lists: () => [...cargaCombustibleKeys.all, "list"] as const,
  list: (filters?: CargaCombustibleListFilters) =>
    [...cargaCombustibleKeys.lists(), filters ?? {}] as const,
  details: () => [...cargaCombustibleKeys.all, "detail"] as const,
  detail: (id: string) => [...cargaCombustibleKeys.details(), id] as const,
  byActivo: (activoId: string) =>
    [...cargaCombustibleKeys.all, "by-activo", activoId] as const,
  byViaje: (viajeId: string) =>
    [...cargaCombustibleKeys.all, "by-viaje", viajeId] as const,
}
