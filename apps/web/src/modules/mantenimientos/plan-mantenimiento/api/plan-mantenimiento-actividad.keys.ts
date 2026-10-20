export const planMantenimientoActividadKeys = {
  all: ["plan-mantenimiento-actividades"] as const,
  byPlan: (planId: string) =>
    [...planMantenimientoActividadKeys.all, "plan", planId] as const,
  detail: (id: string) =>
    [...planMantenimientoActividadKeys.all, "detail", id] as const,
}
