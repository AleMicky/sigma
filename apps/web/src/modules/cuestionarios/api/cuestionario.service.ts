import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { cuestionarioEndpoints } from "./cuestionario.endpoints"
import type {
  AsignacionCuestionario,
  AsignacionDetalle,
  AsignacionesLotePayload,
  Cuestionario,
  CuestionarioDetalle,
  CuestionarioListParams,
  CuestionarioPayload,
  CuestionarioReporteResumen,
  DisparadorCatalogo,
  GuardarPreguntasPayload,
  MisPendientesParams,
  ReporteCuestionarioParams,
  ReporteRespuestasParams,
  ResponderAsignacionPayload,
} from "./cuestionario.types"

export const cuestionarioService = {
  list: (params?: CuestionarioListParams) =>
    http.get<PageResponse<Cuestionario>>(cuestionarioEndpoints.root, {
      params,
    }),

  listDisparadores: () =>
    http.get<DisparadorCatalogo[]>(cuestionarioEndpoints.disparadores),

  get: (id: string) =>
    http.get<CuestionarioDetalle>(cuestionarioEndpoints.byId(id)),

  create: (payload: CuestionarioPayload) =>
    http.post<CuestionarioDetalle, CuestionarioPayload>(
      cuestionarioEndpoints.root,
      payload,
    ),

  update: (id: string, payload: CuestionarioPayload) =>
    http.put<CuestionarioDetalle, CuestionarioPayload>(
      cuestionarioEndpoints.byId(id),
      payload,
    ),

  remove: async (id: string) => {
    await http.delete<void>(cuestionarioEndpoints.byId(id))
  },

  guardarPreguntas: (id: string, payload: GuardarPreguntasPayload) =>
    http.put<CuestionarioDetalle, GuardarPreguntasPayload>(
      cuestionarioEndpoints.preguntas(id),
      payload,
    ),

  publicar: (id: string, reemplazarActivo = false) =>
    http.post<CuestionarioDetalle>(
      cuestionarioEndpoints.publicar(id),
      undefined,
      { params: { reemplazarActivo } },
    ),

  inactivar: (id: string) =>
    http.post<CuestionarioDetalle>(cuestionarioEndpoints.inactivar(id)),

  nuevaVersion: (id: string) =>
    http.post<CuestionarioDetalle>(cuestionarioEndpoints.nuevaVersion(id)),

  listMisPendientes: (params?: MisPendientesParams) =>
    http.get<PageResponse<AsignacionCuestionario>>(
      cuestionarioEndpoints.misPendientes,
      { params },
    ),

  listPorEntidad: (entidadTipo: string, entidadId: string) =>
    http.get<AsignacionCuestionario[]>(cuestionarioEndpoints.porEntidad, {
      params: { entidadTipo, entidadId },
    }),

  listMisAsignacionesLote: (payload: AsignacionesLotePayload) =>
    http.post<AsignacionCuestionario[], AsignacionesLotePayload>(
      cuestionarioEndpoints.misAsignacionesLote,
      payload,
    ),

  getAsignacion: (id: string) =>
    http.get<AsignacionDetalle>(cuestionarioEndpoints.asignacionById(id)),

  responderAsignacion: (id: string, payload: ResponderAsignacionPayload) =>
    http.post<AsignacionDetalle, ResponderAsignacionPayload>(
      cuestionarioEndpoints.responderAsignacion(id),
      payload,
    ),

  getReporteResumen: (params: ReporteCuestionarioParams) =>
    http.get<CuestionarioReporteResumen>(
      cuestionarioEndpoints.reporteResumen,
      { params },
    ),

  listReporteRespuestas: (params: ReporteRespuestasParams) =>
    http.get<PageResponse<AsignacionCuestionario>>(
      cuestionarioEndpoints.reporteRespuestas,
      { params },
    ),
}
