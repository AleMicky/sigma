import { createResourceEndpoints } from "@/shared/api"

export const solicitudVehicularEndpoints = {
  ...createResourceEndpoints("/solicitudes-vehiculares"),
  conAdjuntos: "/solicitudes-vehiculares/con-adjuntos",
}
