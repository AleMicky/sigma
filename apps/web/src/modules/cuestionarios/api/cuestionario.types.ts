import type { PageParams } from "@/shared/types/api.types"

export type EstadoCuestionario = "BORRADOR" | "PUBLICADO" | "INACTIVO"

export type TipoPregunta =
  | "ESTRELLAS_1_5"
  | "ESCALA_1_5"
  | "SI_NO"
  | "OPCION_UNICA"
  | "OPCION_MULTIPLE"
  | "TEXTO_CORTO"
  | "TEXTO_LARGO"
  | "NUMERICO"

export type EstadoAsignacionCuestionario =
  | "PENDIENTE"
  | "RESPONDIDO"
  | "OMITIDO"

export type DisparadorCatalogo = {
  moduloOrigen: string
  moduloEtiqueta: string
  entidadTipo: string
  entidadEtiqueta: string
  eventoDisparador: string
  eventoEtiqueta: string
  descripcion?: string | null
  evaluadoTipoDefecto?: string | null
}

export type PreguntaOpcion = {
  id: string
  orden: number
  etiqueta: string
  valor: string
  puntaje: number | null
  activo: boolean
}

export type PreguntaCuestionario = {
  id: string
  seccion: string | null
  orden: number
  enunciado: string
  descripcionAyuda: string | null
  tipoPregunta: TipoPregunta
  obligatoria: boolean
  peso: number | null
  configJson: Record<string, unknown> | null
  activo: boolean
  opciones: PreguntaOpcion[]
}

export type Cuestionario = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  moduloOrigen: string
  entidadTipo: string
  eventoDisparador: string
  version: number
  estado: EstadoCuestionario
  obligatorio: boolean
  anonimoEnReportes: boolean
  activo: boolean
  totalPreguntas: number
  totalRespuestas: number
  createdAt: string
  updatedAt: string
}

export type CuestionarioDetalle = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  moduloOrigen: string
  entidadTipo: string
  eventoDisparador: string
  version: number
  estado: EstadoCuestionario
  obligatorio: boolean
  anonimoEnReportes: boolean
  activo: boolean
  totalRespuestas: number
  preguntas: PreguntaCuestionario[]
  createdAt: string
  updatedAt: string
}

export type CuestionarioPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  moduloOrigen: string
  entidadTipo: string
  eventoDisparador: string
  obligatorio: boolean
  anonimoEnReportes: boolean
}

export type PreguntaOpcionPayload = {
  id?: string
  orden: number
  etiqueta: string
  valor: string
  puntaje?: number | null
  activo?: boolean
}

export type PreguntaPayload = {
  id?: string
  seccion?: string | null
  orden: number
  enunciado: string
  descripcionAyuda?: string | null
  tipoPregunta: TipoPregunta
  obligatoria: boolean
  peso?: number | null
  configJson?: Record<string, unknown> | null
  activo?: boolean
  opciones?: PreguntaOpcionPayload[]
}

export type GuardarPreguntasPayload = {
  preguntas: PreguntaPayload[]
}

export type AsignacionCuestionario = {
  id: string
  cuestionarioId: string
  cuestionarioNombre: string
  cuestionarioCodigo: string
  cuestionarioVersion: number
  moduloOrigen: string
  entidadTipo: string
  entidadId: string
  entidadCodigoRef: string | null
  evaluadoTipo: string | null
  evaluadoId: string | null
  evaluadoNombre: string | null
  evaluadorEmpleadoId: string | null
  evaluadorNombre: string | null
  obligatorio: boolean
  anonimoEnReportes: boolean
  estado: EstadoAsignacionCuestionario
  fechaHabilitacion: string
  fechaRespuesta: string | null
  puntajeTotal: number | null
  puntajeMaximo: number | null
  porcentaje: number | null
  comentarioGeneral: string | null
}

export type RespuestaDetalle = {
  id: string
  preguntaId: string
  preguntaEnunciadoSnapshot: string
  tipoPreguntaSnapshot: TipoPregunta
  valorTexto: string | null
  valorNumerico: number | null
  valorBooleano: boolean | null
  opcionId: string | null
  opcionesIds: string[] | null
  puntajeObtenido: number | null
}

export type AsignacionDetalle = {
  asignacion: AsignacionCuestionario
  cuestionario: CuestionarioDetalle
  respuestas: RespuestaDetalle[]
}

export type RespuestaItemPayload = {
  preguntaId: string
  valorTexto?: string | null
  valorNumerico?: number | null
  valorBooleano?: boolean | null
  opcionId?: string | null
  opcionesIds?: string[] | null
}

export type ResponderAsignacionPayload = {
  comentarioGeneral?: string | null
  respuestas: RespuestaItemPayload[]
}

export type CuestionarioListParams = PageParams & {
  moduloOrigen?: string
  estado?: EstadoCuestionario
  activo?: boolean
}

export type MisPendientesParams = PageParams & {
  estado?: EstadoAsignacionCuestionario
  entidadTipo?: string
}

export type AsignacionesLotePayload = {
  entidadTipo: string
  entidadIds: string[]
}

export type ReporteCuestionarioParams = {
  cuestionarioId: string
  evaluadoId?: string
  fechaDesde?: string
  fechaHasta?: string
}

export type ReporteRespuestasParams = ReporteCuestionarioParams & PageParams

export type DistribucionOpcionItem = {
  etiqueta: string
  cantidad: number
  porcentaje: number | null
}

export type ReportePorPreguntaItem = {
  preguntaId: string
  orden: number
  seccion: string | null
  enunciado: string
  tipoPregunta: TipoPregunta
  totalRespuestas: number
  promedioValor: number | null
  promedioPuntaje: number | null
  distribucion: DistribucionOpcionItem[] | null
}

export type ReportePorEvaluadoItem = {
  evaluadoTipo: string | null
  evaluadoId: string
  evaluadoNombre: string
  totalEvaluaciones: number
  promedioPuntaje: number | null
  promedioPorcentaje: number | null
}

export type CuestionarioReporteResumen = {
  cuestionarioId: string
  cuestionarioNombre: string
  anonimoEnReportes: boolean
  totalAsignadas: number
  totalRespondidas: number
  totalPendientes: number
  tasaParticipacion: number
  promedioPuntaje: number | null
  promedioPorcentaje: number | null
  porPregunta: ReportePorPreguntaItem[]
  porEvaluado: ReportePorEvaluadoItem[]
}
