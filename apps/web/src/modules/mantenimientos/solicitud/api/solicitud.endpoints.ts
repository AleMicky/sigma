import { createResourceEndpoints } from "@/shared/api"

export const solicitudEndpoints = {
  ...createResourceEndpoints("/solicitudes-mantenimiento"),
  enviar: (id: string) => `/solicitudes-mantenimiento/${id}/enviar`,
  adjuntos: {
    list: (solicitudId: string) => `/solicitudes-mantenimiento/${solicitudId}/adjuntos`,
    create: (solicitudId: string) => `/solicitudes-mantenimiento/${solicitudId}/adjuntos`,
    byId: (solicitudId: string, adjuntoId: string) =>
      `/solicitudes-mantenimiento/${solicitudId}/adjuntos/${adjuntoId}`,
    replaceFile: (solicitudId: string, adjuntoId: string) =>
      `/solicitudes-mantenimiento/${solicitudId}/adjuntos/${adjuntoId}/archivo`,
  },
}

