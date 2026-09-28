import { createResourceEndpoints } from "@/shared/api"

export const solicitudVehicularEndpoints = {
  ...createResourceEndpoints("/solicitudes-vehiculares"),
  calendario: "/solicitudes-vehiculares/calendario",
  conAdjuntos: "/solicitudes-vehiculares/con-adjuntos",
  enviar: (id: string) => `/solicitudes-vehiculares/${id}/enviar`,
  workflowComplete: (id: string) => `/solicitudes-vehiculares/${id}/workflow/complete`,
}
