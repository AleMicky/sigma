export const SOLICITUD_ENDPOINTS = {
  root: "/solicitudes-mantenimiento",
  detail: (id: string) => `/solicitudes-mantenimiento/${id}`,
  resumen: "/solicitudes-mantenimiento/resumen",
  trazabilidad: (id: string) => `/solicitudes-mantenimiento/${id}/trazabilidad`,
  reportePdf: (id: string) => `/solicitudes-mantenimiento/${id}/reporte-pdf`,
  workflowComplete: (id: string) => `/solicitudes-mantenimiento/${id}/workflow/complete`,
} as const

export const solicitudEndpoints = SOLICITUD_ENDPOINTS
