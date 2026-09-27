import type { FlotaQueryParams } from "./flota.service"

export const flotaKeys = {
  all: ["flotas-vehiculares"] as const,
  lists: () => [...flotaKeys.all, "list"] as const,
  list: (params?: FlotaQueryParams) => [...flotaKeys.lists(), params] as const,
  activas: () => [...flotaKeys.all, "activas"] as const,
  details: () => [...flotaKeys.all, "detail"] as const,
  detail: (id: string) => [...flotaKeys.details(), id] as const,
  vehiculos: (flotaId: string) => [...flotaKeys.all, "vehiculos", flotaId] as const,
  vehiculosByEmpleado: (empleadoId: string, activo?: boolean) =>
    [...flotaKeys.all, "vehiculos-empleado", empleadoId, { activo }] as const,
  responsables: (flotaId: string) => [...flotaKeys.all, "responsables", flotaId] as const,
  flotasByEmpleado: (empleadoId: string) => [...flotaKeys.all, "flotas-empleado", empleadoId] as const,
}
