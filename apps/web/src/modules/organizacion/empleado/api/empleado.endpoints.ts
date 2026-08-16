import { createResourceEndpoints } from "@/shared/api"

export const empleadoEndpoints = {
  ...createResourceEndpoints("/empleados"),
  buscar: "/empleados/buscar",
  byArea: (areaId: string) => `/empleados/area/${areaId}`,
}
