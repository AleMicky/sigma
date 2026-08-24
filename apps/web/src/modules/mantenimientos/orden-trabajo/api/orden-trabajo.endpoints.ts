export const ORDEN_TRABAJO_ENDPOINTS = {
  root: "/ordenes-trabajo",
  detail: (id: string) => `/ordenes-trabajo/${id}`,
  adjuntos: {
    root: (ordenTrabajoId: string) => `/ordenes-trabajo/${ordenTrabajoId}/adjuntos`,
    detail: (ordenTrabajoId: string, id: string) =>
      `/ordenes-trabajo/${ordenTrabajoId}/adjuntos/${id}`,
    replaceFile: (ordenTrabajoId: string, id: string) =>
      `/ordenes-trabajo/${ordenTrabajoId}/adjuntos/${id}/archivo`,
  },
  actividades: {
    root: "/ordenes-trabajo-actividades",
    detail: (id: string) => `/ordenes-trabajo-actividades/${id}`,
    evidencias: {
      root: (actividadId: string) =>
        `/ordenes-trabajo-actividades/${actividadId}/evidencias`,
      detail: (actividadId: string, id: string) =>
        `/ordenes-trabajo-actividades/${actividadId}/evidencias/${id}`,
      replaceFile: (actividadId: string, id: string) =>
        `/ordenes-trabajo-actividades/${actividadId}/evidencias/${id}/archivo`,
    },
  },
} as const
