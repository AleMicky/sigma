export const CONTROL_ACTIVO_VEHICULAR_ENDPOINTS = {
  root: "/controles-activos-vehiculares",
  detail: (id: string) => `/controles-activos-vehiculares/${id}`,
  reportePdf: (id: string) => `/controles-activos-vehiculares/${id}/reporte-pdf`,
  bySolicitud: (solicitudId: string) =>
    `/controles-activos-vehiculares/solicitud/${solicitudId}`,
  byAsignacion: (asignacionId: string) =>
    `/controles-activos-vehiculares/asignacion/${asignacionId}`,
  byActivo: (activoId: string) =>
    `/controles-activos-vehiculares/activo/${activoId}`,
  detalles: {
    root: "/controles-activos-vehiculares-detalles",
    detail: (id: string) => `/controles-activos-vehiculares-detalles/${id}`,
  },
} as const
