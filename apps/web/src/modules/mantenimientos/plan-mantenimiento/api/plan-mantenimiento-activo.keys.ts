export const planMantenimientoActivoKeys = {
  all: ["plan-mantenimiento-activos"] as const,
  byPlan: (planId: string, activo?: boolean) =>
    [...planMantenimientoActivoKeys.all, "plan", planId, { activo }] as const,
  byActivo: (activoId: string) =>
    [...planMantenimientoActivoKeys.all, "activo", activoId] as const,
  detail: (id: string) =>
    [...planMantenimientoActivoKeys.all, "detail", id] as const,
}
