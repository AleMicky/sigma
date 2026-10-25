import { http } from "@/shared/api"
import { programacionMantenimientoEndpoints } from "./programacion-mantenimiento.endpoints"

export type TipoCriterioMantenimiento = "TIEMPO" | "KILOMETRAJE" | "HORAS_USO"

export type ProgramacionMantenimientoCriterio = {
  id: string
  programacionMantenimientoId: string
  tipoCriterio: TipoCriterioMantenimiento
  intervaloDias?: number | null
  intervaloUso?: number | null
  proximaFecha?: string | null
  proximoValorUso?: number | null
  valorActualUso?: number | null
  activo: boolean
  auditoria?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
  }
}

export type PlanActivoInfo = {
  id: string
  planMantenimientoId: string
  planCodigo?: string
  planNombre?: string
  activoId: string
  activoCodigo?: string
  activoNombre?: string
  tipoActivoId?: string
  tipoActivoNombre?: string
  fechaInicio?: string
  fechaFin?: string | null
  estadoActivo?: boolean
}

export type ProgramacionMantenimiento = {
  id: string
  planMantenimientoActivoId: string
  planActivo?: PlanActivoInfo | null
  activo: boolean
  criterios: ProgramacionMantenimientoCriterio[]
  auditoria?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
  }
}

export type ProgramacionMantenimientoHistorial = {
  id: string
  programacionMantenimientoId: string
  solicitudMantenimientoId?: string | null
  solicitudNumero?: string | null
  tipoCriterioDisparador: TipoCriterioMantenimiento
  valorDisparador: string
  valorLimite?: string | null
  fechaDisparo: string
  snapshotValores?: string | null
  completado: boolean
  fechaServicio?: string | null
  valorUsoServicio?: number | null
  observacion?: string | null
  auditoria?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
  }
}

export type EvaluacionProgramacionResponse = {
  programacionId: string
  cumpleCriterio: boolean
  criterioCumplido?: TipoCriterioMantenimiento | null
  motivoDisparo?: string | null
  solicitudGenerada: boolean
  yaExistiaSolicitudAbierta: boolean
  solicitudMantenimientoId?: string | null
  solicitudNumero?: string | null
  mensaje: string
}

export type BatchEvaluacionProgramacionResponse = {
  totalEvaluadas: number
  solicitudesGeneradas: number
  yaExistiaSolicitudAbierta: number
  cumplieronCriterio: number
  errores: number
  evaluaciones: EvaluacionProgramacionResponse[]
}

export type ProgramacionMantenimientoCriterioPayload = {
  id?: string
  tipoCriterio: TipoCriterioMantenimiento
  intervaloDias?: number | null
  intervaloUso?: number | null
  proximaFecha?: string | null
  proximoValorUso?: number | null
  activo?: boolean
}

export type ProgramacionMantenimientoPayload = {
  planMantenimientoActivoId: string
  activo?: boolean
  criterios: ProgramacionMantenimientoCriterioPayload[]
}

export type ProgramacionMantenimientoUpdatePayload = {
  activo?: boolean
  criterios?: ProgramacionMantenimientoCriterioPayload[]
}

export type EvaluarProgramacionPayload = {
  fechaActual?: string
  kilometrajeActual?: number | null
  horasUsoActual?: number | null
  forzarGeneracion?: boolean
}

export type CompletarMantenimientoPayload = {
  fechaServicio?: string
  kilometrajeServicio?: number | null
  horasUsoServicio?: number | null
  solicitudId?: string | null
  observacion?: string | null
}

export type ListProgramacionesParams = {
  planMantenimientoActivoId?: string
  activoId?: string
  activo?: boolean
  q?: string
  page?: number
  pageSize?: number
}

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export async function getProgramaciones(
  params?: ListProgramacionesParams,
): Promise<PageResponse<ProgramacionMantenimiento>> {
  const query = new URLSearchParams()
  if (params?.planMantenimientoActivoId) query.append("planMantenimientoActivoId", params.planMantenimientoActivoId)
  if (params?.activoId) query.append("activoId", params.activoId)
  if (params?.activo !== undefined) query.append("activo", String(params.activo))
  if (params?.q) query.append("q", params.q)
  if (params?.page !== undefined) query.append("page", String(params.page))
  const size = params?.pageSize ?? 100
  query.append("size", String(size))

  const qs = query.toString()
  return http.get<PageResponse<ProgramacionMantenimiento>>(
    `${programacionMantenimientoEndpoints.list}${qs ? `?${qs}` : ""}`,
  )
}

export async function getProgramacion(id: string): Promise<ProgramacionMantenimiento> {
  return http.get<ProgramacionMantenimiento>(programacionMantenimientoEndpoints.detail(id))
}

export async function getProgramacionesByPlanActivo(
  planActivoId: string,
): Promise<ProgramacionMantenimiento[]> {
  return http.get<ProgramacionMantenimiento[]>(
    programacionMantenimientoEndpoints.byPlanActivo(planActivoId),
  )
}

export async function createProgramacion(
  payload: ProgramacionMantenimientoPayload,
): Promise<ProgramacionMantenimiento> {
  return http.post<ProgramacionMantenimiento>(
    programacionMantenimientoEndpoints.create,
    payload,
  )
}

export async function updateProgramacion(
  id: string,
  payload: ProgramacionMantenimientoUpdatePayload,
): Promise<ProgramacionMantenimiento> {
  return http.put<ProgramacionMantenimiento>(
    programacionMantenimientoEndpoints.update(id),
    payload,
  )
}

export async function activarProgramacion(id: string): Promise<ProgramacionMantenimiento> {
  return http.patch<ProgramacionMantenimiento>(programacionMantenimientoEndpoints.activar(id))
}

export async function desactivarProgramacion(id: string): Promise<ProgramacionMantenimiento> {
  return http.patch<ProgramacionMantenimiento>(programacionMantenimientoEndpoints.desactivar(id))
}

export async function deleteProgramacion(id: string): Promise<void> {
  return http.delete(programacionMantenimientoEndpoints.delete(id))
}

export async function evaluarProgramacion(
  id: string,
  payload?: EvaluarProgramacionPayload,
): Promise<EvaluacionProgramacionResponse> {
  return http.post<EvaluacionProgramacionResponse>(
    programacionMantenimientoEndpoints.evaluar(id),
    payload ?? {},
  )
}

export async function evaluarTodasProgramaciones(): Promise<BatchEvaluacionProgramacionResponse> {
  return http.post<BatchEvaluacionProgramacionResponse>(
    programacionMantenimientoEndpoints.evaluarTodas,
  )
}

export async function completarMantenimiento(
  id: string,
  payload: CompletarMantenimientoPayload,
): Promise<ProgramacionMantenimiento> {
  return http.post<ProgramacionMantenimiento>(
    programacionMantenimientoEndpoints.completar(id),
    payload,
  )
}

export async function getHistorial(id: string): Promise<ProgramacionMantenimientoHistorial[]> {
  return http.get<ProgramacionMantenimientoHistorial[]>(
    programacionMantenimientoEndpoints.historial(id),
  )
}

export async function createCriterio(
  programacionId: string,
  payload: ProgramacionMantenimientoCriterioPayload,
): Promise<ProgramacionMantenimientoCriterio> {
  return http.post<ProgramacionMantenimientoCriterio>(
    programacionMantenimientoEndpoints.criterioCreate(programacionId),
    payload,
  )
}

export async function updateCriterio(
  id: string,
  payload: Partial<ProgramacionMantenimientoCriterioPayload>,
): Promise<ProgramacionMantenimientoCriterio> {
  return http.put<ProgramacionMantenimientoCriterio>(
    programacionMantenimientoEndpoints.criterioUpdate(id),
    payload,
  )
}

export async function activarCriterio(id: string): Promise<ProgramacionMantenimientoCriterio> {
  return http.patch<ProgramacionMantenimientoCriterio>(
    programacionMantenimientoEndpoints.criterioActivar(id),
  )
}

export async function desactivarCriterio(id: string): Promise<ProgramacionMantenimientoCriterio> {
  return http.patch<ProgramacionMantenimientoCriterio>(
    programacionMantenimientoEndpoints.criterioDesactivar(id),
  )
}

export async function deleteCriterio(id: string): Promise<void> {
  return http.delete(programacionMantenimientoEndpoints.criterioDelete(id))
}

export async function exportarSeguimientoExcel(params?: {
  planMantenimientoActivoId?: string
  activoId?: string
  activo?: boolean
  q?: string
}): Promise<void> {
  const queryParams: Record<string, string> = {}
  if (params?.planMantenimientoActivoId) queryParams.planMantenimientoActivoId = params.planMantenimientoActivoId
  if (params?.activoId) queryParams.activoId = params.activoId
  if (params?.activo !== undefined) queryParams.activo = String(params.activo)
  if (params?.q) queryParams.q = params.q

  const blob = await http.get<Blob>(programacionMantenimientoEndpoints.reporteExcel, {
    params: queryParams,
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const fechaHoy = new Date().toISOString().split("T")[0]
  a.download = `seguimiento-mantenimiento-preventivo-${fechaHoy}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
