import type { ListProgramacionesParams } from "./programacion-mantenimiento.service"

export const programacionMantenimientoKeys = {
  all: ["programaciones-mantenimiento"] as const,
  lists: () => [...programacionMantenimientoKeys.all, "list"] as const,
  list: (params?: ListProgramacionesParams) =>
    [...programacionMantenimientoKeys.lists(), params] as const,
  details: () => [...programacionMantenimientoKeys.all, "detail"] as const,
  detail: (id: string) => [...programacionMantenimientoKeys.details(), id] as const,
  byPlanActivo: (planActivoId: string) =>
    [...programacionMantenimientoKeys.all, "by-plan-activo", planActivoId] as const,
  byActivo: (activoId: string) =>
    [...programacionMantenimientoKeys.all, "by-activo", activoId] as const,
  historial: (id: string) =>
    [...programacionMantenimientoKeys.all, "historial", id] as const,
  criterios: (programacionId: string) =>
    [...programacionMantenimientoKeys.all, "criterios", programacionId] as const,
}
