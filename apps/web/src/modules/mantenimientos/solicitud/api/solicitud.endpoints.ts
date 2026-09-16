export const SOLICITUD_ENDPOINTS = {
  root: "/solicitudes-mantenimiento",
  detail: (id: string) => `/solicitudes-mantenimiento/${id}`,
  resumen: "/solicitudes-mantenimiento/resumen",
  trazabilidad: (id: string) => `/solicitudes-mantenimiento/${id}/trazabilidad`,
} as const

export const solicitudEndpoints = SOLICITUD_ENDPOINTS
