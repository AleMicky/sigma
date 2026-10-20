export const planMantenimientoActivoEndpoints = {
  root: "/planes-mantenimiento-activos",
  detail: (id: string) => `/planes-mantenimiento-activos/${id}`,
  byPlan: (planId: string) => `/planes-mantenimiento-activos/plan/${planId}`,
  byActivo: (activoId: string) => `/planes-mantenimiento-activos/activo/${activoId}`,
  desactivar: (id: string) => `/planes-mantenimiento-activos/${id}/desactivar`,
  activar: (id: string) => `/planes-mantenimiento-activos/${id}/activar`,
} as const
