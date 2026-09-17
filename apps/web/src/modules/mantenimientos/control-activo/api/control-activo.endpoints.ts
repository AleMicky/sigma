export const CONTROL_ACTIVO_ENDPOINTS = {
  root: "/controles-activos",
  detail: (id: string) => `/controles-activos/${id}`,
  bySolicitud: (solicitudId: string) => `/controles-activos/solicitud/${solicitudId}`,
  byOrdenTrabajo: (ordenTrabajoId: string) => `/controles-activos/orden-trabajo/${ordenTrabajoId}`,
  byActivo: (activoId: string) => `/controles-activos/activo/${activoId}`,
  reportePdf: (id: string) => `/controles-activos/${id}/reporte-pdf`,
  detalles: {
    root: "/controles-activos-detalles",
    detail: (id: string) => `/controles-activos-detalles/${id}`,
  },
} as const
