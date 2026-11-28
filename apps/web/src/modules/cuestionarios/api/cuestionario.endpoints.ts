import { createResourceEndpoints } from "@/shared/api"

const base = createResourceEndpoints("/cuestionarios")

export const cuestionarioEndpoints = {
  ...base,
  disparadores: "/cuestionarios/disparadores",
  preguntas: (id: string) => `/cuestionarios/${id}/preguntas`,
  publicar: (id: string) => `/cuestionarios/${id}/publicar`,
  inactivar: (id: string) => `/cuestionarios/${id}/inactivar`,
  nuevaVersion: (id: string) => `/cuestionarios/${id}/nueva-version`,
  misPendientes: "/cuestionarios/asignaciones/mis-pendientes",
  porEntidad: "/cuestionarios/asignaciones/por-entidad",
  misAsignacionesLote: "/cuestionarios/asignaciones/mis-asignaciones-lote",
  asignacionById: (id: string) => `/cuestionarios/asignaciones/${id}`,
  responderAsignacion: (id: string) =>
    `/cuestionarios/asignaciones/${id}/responder`,
  reporteResumen: "/cuestionarios/reportes/resumen",
  reporteRespuestas: "/cuestionarios/reportes/respuestas",
} as const
