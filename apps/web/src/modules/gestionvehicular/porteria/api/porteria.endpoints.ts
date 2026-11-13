export const porteriaEndpoints = {
  root: "/porteria",
  salidas: "/porteria/salidas",
  afuera: "/porteria/afuera",
  byId: (id: string) => `/porteria/${id}`,
  llegada: (id: string) => `/porteria/${id}/llegada`,
  anular: (id: string) => `/porteria/${id}/anular`,
} as const

