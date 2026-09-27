import { createResourceEndpoints } from "@/shared/api"

export const conductorEndpoints = {
  ...createResourceEndpoints("/conductores"),
  disponibles: "/conductores/disponibles",
}

export const conductorLicenciaEndpoints = {
  root: "/conductor-licencias",
  byConductor: (conductorId: string) => `/conductor-licencias/conductor/${conductorId}`,
  byId: (id: string) => `/conductor-licencias/${id}`,
}
