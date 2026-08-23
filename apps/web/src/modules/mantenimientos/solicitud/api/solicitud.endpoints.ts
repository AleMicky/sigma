import { createResourceEndpoints } from "@/shared/api"

export const solicitudEndpoints = {
  ...createResourceEndpoints("/solicitudes-mantenimiento"),
  enviar: (id: string) => `/solicitudes-mantenimiento/${id}/enviar`,
  workflow: {
    actions: (processInstanceId: string) => `/workflow/instances/${processInstanceId}/actions`,
    complete: (solicitudId: string) => `/solicitudes-mantenimiento/${solicitudId}/workflow/complete`,
  },
  adjuntos: {
    list: (solicitudId: string) => `/solicitudes-mantenimiento/${solicitudId}/adjuntos`,
    create: (solicitudId: string) => `/solicitudes-mantenimiento/${solicitudId}/adjuntos`,
    byId: (solicitudId: string, adjuntoId: string) =>
      `/solicitudes-mantenimiento/${solicitudId}/adjuntos/${adjuntoId}`,
    replaceFile: (solicitudId: string, adjuntoId: string) =>
      `/solicitudes-mantenimiento/${solicitudId}/adjuntos/${adjuntoId}/archivo`,
  },
}


