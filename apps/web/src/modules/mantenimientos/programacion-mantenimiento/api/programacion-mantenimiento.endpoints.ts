export const programacionMantenimientoEndpoints = {
  list: "/programaciones-mantenimiento",
  create: "/programaciones-mantenimiento",
  detail: (id: string) => `/programaciones-mantenimiento/${id}`,
  update: (id: string) => `/programaciones-mantenimiento/${id}`,
  delete: (id: string) => `/programaciones-mantenimiento/${id}`,
  byPlanActivo: (planActivoId: string) =>
    `/programaciones-mantenimiento/plan-activo/${planActivoId}`,
  activar: (id: string) => `/programaciones-mantenimiento/${id}/activar`,
  desactivar: (id: string) => `/programaciones-mantenimiento/${id}/desactivar`,
  evaluar: (id: string) => `/programaciones-mantenimiento/${id}/evaluar`,
  evaluarTodas: "/programaciones-mantenimiento/evaluar-todas",
  completar: (id: string) => `/programaciones-mantenimiento/${id}/completar`,
  historial: (id: string) => `/programaciones-mantenimiento/${id}/historial`,
  reporteExcel: "/programaciones-mantenimiento/reporte-excel",

  // Endpoints individuales de criterios
  criterioCreate: (programacionId: string) =>
    `/programacion-mantenimiento-criterios/programacion/${programacionId}`,
  criterioUpdate: (id: string) =>
    `/programacion-mantenimiento-criterios/${id}`,
  criterioDelete: (id: string) =>
    `/programacion-mantenimiento-criterios/${id}`,
  criterioActivar: (id: string) =>
    `/programacion-mantenimiento-criterios/${id}/activar`,
  criterioDesactivar: (id: string) =>
    `/programacion-mantenimiento-criterios/${id}/desactivar`,
  criteriosByProgramacion: (programacionId: string) =>
    `/programacion-mantenimiento-criterios/programacion/${programacionId}`,
}
