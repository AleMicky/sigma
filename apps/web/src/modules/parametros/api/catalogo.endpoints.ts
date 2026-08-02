export const catalogoEndpoints = {
  root: "/catalogos",
  byId: (id: string) => `/catalogos/${id}`,
} as const
