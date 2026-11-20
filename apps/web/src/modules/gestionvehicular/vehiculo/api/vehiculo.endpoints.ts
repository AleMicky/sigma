export const vehiculoEndpoints = {
  root: "/gestion-vehicular/vehiculos",
  byId: (id: string) => `/gestion-vehicular/vehiculos/${id}`,
} as const
