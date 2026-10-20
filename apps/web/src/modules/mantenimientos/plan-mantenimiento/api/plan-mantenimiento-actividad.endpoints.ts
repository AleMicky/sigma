export const planMantenimientoActividadEndpoints = {
  root: "/planes-mantenimiento-actividades",
  detail: (id: string) => `/planes-mantenimiento-actividades/${id}`,
  byPlan: (planId: string) => `/planes-mantenimiento-actividades/plan/${planId}`,
}
