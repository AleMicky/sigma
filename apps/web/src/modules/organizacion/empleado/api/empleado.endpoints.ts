import { createResourceEndpoints } from "@/shared/api"

export const empleadoEndpoints = {
  ...createResourceEndpoints("/empleados"),
  buscar: "/empleados/buscar",
  misEmpleados: "/empleados/mis-empleados",
  byArea: (areaId: string) => `/empleados/area/${areaId}`,
}
