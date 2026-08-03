export const migracionEndpoints = {
  root: "/registros-migracion",
  byId: (id: string) => `/registros-migracion/${id}`,
} as const
