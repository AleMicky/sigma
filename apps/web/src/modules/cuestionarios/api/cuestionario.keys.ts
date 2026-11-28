import { createResourceKeys } from "@/shared/api"

import type {
  CuestionarioListParams,
  MisPendientesParams,
  ReporteCuestionarioParams,
  ReporteRespuestasParams,
} from "./cuestionario.types"

const baseKeys = createResourceKeys<"cuestionarios", CuestionarioListParams>(
  "cuestionarios",
)

export const cuestionarioKeys = {
  ...baseKeys,
  disparadores: () => [...baseKeys.all, "disparadores"] as const,
  asignaciones: () => [...baseKeys.all, "asignaciones"] as const,
  misPendientes: (params?: MisPendientesParams) =>
    [...baseKeys.all, "asignaciones", "mis-pendientes", params] as const,
  porEntidad: (entidadTipo: string, entidadId: string) =>
    [
      ...baseKeys.all,
      "asignaciones",
      "por-entidad",
      entidadTipo,
      entidadId,
    ] as const,
  lote: (entidadTipo: string, entidadIds: readonly string[]) =>
    [
      ...baseKeys.all,
      "asignaciones",
      "lote",
      entidadTipo,
      [...entidadIds].sort().join(","),
    ] as const,
  asignacionDetail: (id: string) =>
    [...baseKeys.all, "asignaciones", "detail", id] as const,
  reportes: () => [...baseKeys.all, "reportes"] as const,
  reporteResumen: (params: ReporteCuestionarioParams) =>
    [...baseKeys.all, "reportes", "resumen", params] as const,
  reporteRespuestas: (params: ReporteRespuestasParams) =>
    [...baseKeys.all, "reportes", "respuestas", params] as const,
}
