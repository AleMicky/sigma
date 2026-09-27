import { createResourceEndpoints } from "@/shared/api"

export const asignacionVehicularEndpoints = {
  ...createResourceEndpoints("/asignaciones-vehiculares"),
  bySolicitud: (solicitudVehicularId: string) =>
    `/asignaciones-vehiculares/solicitud/${solicitudVehicularId}`,
}
