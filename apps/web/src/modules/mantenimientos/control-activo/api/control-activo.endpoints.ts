export const CONTROL_ACTIVO_ENDPOINTS = {
  root: "/controles-activos",
  detail: (id: string) => `/controles-activos/${id}`,
  detalles: {
    root: "/controles-activos-detalles",
    detail: (id: string) => `/controles-activos-detalles/${id}`,
  },
} as const
