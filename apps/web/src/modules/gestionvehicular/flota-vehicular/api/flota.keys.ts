import type { FlotaQueryParams } from "./flota.service"

export const flotaKeys = {
  all: ["flotas-vehiculares"] as const,
  lists: () => [...flotaKeys.all, "list"] as const,
  list: (params?: FlotaQueryParams) => [...flotaKeys.lists(), params] as const,
  activas: () => [...flotaKeys.all, "activas"] as const,
  details: () => [...flotaKeys.all, "detail"] as const,
  detail: (id: string) => [...flotaKeys.details(), id] as const,
  vehiculos: (flotaId: string) => [...flotaKeys.all, "vehiculos", flotaId] as const,
  responsables: (flotaId: string) => [...flotaKeys.all, "responsables", flotaId] as const,
}
