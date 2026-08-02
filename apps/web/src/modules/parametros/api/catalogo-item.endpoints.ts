export const catalogoItemEndpoints = {
  root: "/catalogo-items",
  byId: (id: string) => `/catalogo-items/${id}`,
} as const
