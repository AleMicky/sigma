import { queryOptions } from "@tanstack/react-query"

import { cuestionarioKeys } from "./cuestionario.keys"
import { cuestionarioService } from "./cuestionario.service"
import type {
  CuestionarioListParams,
  MisPendientesParams,
  ReporteCuestionarioParams,
  ReporteRespuestasParams,
} from "./cuestionario.types"

export const cuestionarioQueries = {
  list: (params?: CuestionarioListParams) =>
    queryOptions({
      queryKey: cuestionarioKeys.list(params),
      queryFn: () => cuestionarioService.list(params),
    }),

  disparadores: () =>
    queryOptions({
      queryKey: cuestionarioKeys.disparadores(),
      queryFn: () => cuestionarioService.listDisparadores(),
      staleTime: 1000 * 60 * 10,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: cuestionarioKeys.detail(id),
      queryFn: () => cuestionarioService.get(id),
    }),

  misPendientes: (params?: MisPendientesParams) =>
    queryOptions({
      queryKey: cuestionarioKeys.misPendientes(params),
      queryFn: () => cuestionarioService.listMisPendientes(params),
    }),

  porEntidad: (entidadTipo: string, entidadId: string) =>
    queryOptions({
      queryKey: cuestionarioKeys.porEntidad(entidadTipo, entidadId),
      queryFn: () => cuestionarioService.listPorEntidad(entidadTipo, entidadId),
    }),

  misAsignacionesLote: (entidadTipo: string, entidadIds: readonly string[]) =>
    queryOptions({
      queryKey: cuestionarioKeys.lote(entidadTipo, entidadIds),
      queryFn: () =>
        cuestionarioService.listMisAsignacionesLote({
          entidadTipo,
          entidadIds: [...entidadIds],
        }),
    }),

  asignacionDetail: (id: string) =>
    queryOptions({
      queryKey: cuestionarioKeys.asignacionDetail(id),
      queryFn: () => cuestionarioService.getAsignacion(id),
    }),

  reporteResumen: (params: ReporteCuestionarioParams) =>
    queryOptions({
      queryKey: cuestionarioKeys.reporteResumen(params),
      queryFn: () => cuestionarioService.getReporteResumen(params),
    }),

  reporteRespuestas: (params: ReporteRespuestasParams) =>
    queryOptions({
      queryKey: cuestionarioKeys.reporteRespuestas(params),
      queryFn: () => cuestionarioService.listReporteRespuestas(params),
    }),
}
