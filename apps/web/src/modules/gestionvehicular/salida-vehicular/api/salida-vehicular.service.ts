import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

import { salidaVehicularEndpoints } from "./salida-vehicular.endpoints"
import type {
  ActualizarSalidaVehicularRequest,
  BitacoraVehicular,
  CancelarSalidaVehicularRequest,
  EjecutarAccionSalidaRequest,
  RegistrarBitacoraRequest,
  RegistrarSalidaVehicularRequest,
  ReporteBitacorasActividadesIncidentes,
  ReporteEmpleadoSalidas,
  ReporteSalidasGeneral,
  ReporteTiemposRecorrido,
  ReporteVehiculoKilometraje,
  SalidaVehicular,
  SalidaVehicularEvento,
  SalidaVehicularFiltros,
  WorkflowHistory,
  WorkflowTask,
  WorkflowTaskActions,
} from "./salida-vehicular.types"

export const listSalidas = (
  params?: SalidaVehicularFiltros
): Promise<PageResponse<SalidaVehicular>> => {
  return http.get<PageResponse<SalidaVehicular>>(salidaVehicularEndpoints.root, {
    params,
  })
}

export const listSalidasActivas = (): Promise<SalidaVehicular[]> => {
  return http.get<SalidaVehicular[]>(salidaVehicularEndpoints.activas)
}

export const listMisSalidas = (
  params?: PageParams
): Promise<PageResponse<SalidaVehicular>> => {
  return http.get<PageResponse<SalidaVehicular>>(salidaVehicularEndpoints.misSalidas, {
    params,
  })
}

export const getSalidaById = (id: string): Promise<SalidaVehicular> => {
  return http.get<SalidaVehicular>(salidaVehicularEndpoints.byId(id))
}

export const registrarSalida = (
  data: RegistrarSalidaVehicularRequest
): Promise<SalidaVehicular> => {
  return http.post<SalidaVehicular>(salidaVehicularEndpoints.root, data)
}

export const actualizarSalida = (
  id: string,
  data: ActualizarSalidaVehicularRequest
): Promise<SalidaVehicular> => {
  return http.put<SalidaVehicular>(salidaVehicularEndpoints.byId(id), data)
}

export const cancelarSalida = (
  id: string,
  data?: CancelarSalidaVehicularRequest
): Promise<SalidaVehicular> => {
  return http.post<SalidaVehicular>(salidaVehicularEndpoints.cancelar(id), data)
}

// Flowable
export const getTareaActual = (id: string): Promise<WorkflowTask | null> => {
  return http.get<WorkflowTask | null>(salidaVehicularEndpoints.tareaActual(id))
}

export const getAcciones = (id: string): Promise<WorkflowTaskActions> => {
  return http.get<WorkflowTaskActions>(salidaVehicularEndpoints.acciones(id))
}

export const ejecutarAccion = (
  id: string,
  accionId: string,
  data?: EjecutarAccionSalidaRequest
): Promise<SalidaVehicular> => {
  return http.post<SalidaVehicular>(
    salidaVehicularEndpoints.ejecutarAccion(id, accionId),
    data ?? {}
  )
}

export const getHistorialProceso = (id: string): Promise<WorkflowHistory> => {
  return http.get<WorkflowHistory>(salidaVehicularEndpoints.historialProceso(id))
}

// Eventos
export const listEventos = (id: string): Promise<SalidaVehicularEvento[]> => {
  return http.get<SalidaVehicularEvento[]>(salidaVehicularEndpoints.eventos(id))
}

export const getEventoById = (
  id: string,
  eventoId: string
): Promise<SalidaVehicularEvento> => {
  return http.get<SalidaVehicularEvento>(
    salidaVehicularEndpoints.eventoById(id, eventoId)
  )
}

// Bitácoras
export const registrarBitacora = (
  id: string,
  data: RegistrarBitacoraRequest
): Promise<BitacoraVehicular> => {
  return http.post<BitacoraVehicular>(salidaVehicularEndpoints.bitacoras(id), data)
}

export const listBitacoras = (id: string): Promise<BitacoraVehicular[]> => {
  return http.get<BitacoraVehicular[]>(salidaVehicularEndpoints.bitacoras(id))
}

export const getBitacoraById = (
  id: string,
  bitacoraId: string
): Promise<BitacoraVehicular> => {
  return http.get<BitacoraVehicular>(
    salidaVehicularEndpoints.bitacoraById(id, bitacoraId)
  )
}

// Reportes
export const getReporteGeneral = (
  params?: Record<string, unknown>
): Promise<ReporteSalidasGeneral> => {
  return http.get<ReporteSalidasGeneral>(
    salidaVehicularEndpoints.reportes.general,
    { params }
  )
}

export const getReporteVehiculos = (
  params?: Record<string, unknown>
): Promise<ReporteVehiculoKilometraje[]> => {
  return http.get<ReporteVehiculoKilometraje[]>(
    salidaVehicularEndpoints.reportes.vehiculos,
    { params }
  )
}

export const getReporteEmpleados = (
  params?: Record<string, unknown>
): Promise<ReporteEmpleadoSalidas[]> => {
  return http.get<ReporteEmpleadoSalidas[]>(
    salidaVehicularEndpoints.reportes.empleados,
    { params }
  )
}

export const getReporteTiempos = (
  params?: Record<string, unknown>
): Promise<ReporteTiemposRecorrido> => {
  return http.get<ReporteTiemposRecorrido>(
    salidaVehicularEndpoints.reportes.tiempos,
    { params }
  )
}

export const getReporteBitacoras = (
  params?: Record<string, unknown>
): Promise<ReporteBitacorasActividadesIncidentes> => {
  return http.get<ReporteBitacorasActividadesIncidentes>(
    salidaVehicularEndpoints.reportes.bitacoras,
    { params }
  )
}

export interface DescargarReporteBitacoraPdfParams {
  activoId: string
  fechaDesde: string
  fechaHasta: string
  search?: string
  placa?: string | null
}

export const descargarReporteSalidasBitacoraPdf = async (
  params: DescargarReporteBitacoraPdfParams
): Promise<void> => {
  const queryParams: Record<string, string> = {
    activoId: params.activoId,
    fechaDesde: `${params.fechaDesde}T00:00:00`,
    fechaHasta: `${params.fechaHasta}T23:59:59`,
  }
  if (params.search?.trim()) {
    queryParams.search = params.search.trim()
  }

  const blob = await http.get<Blob>(salidaVehicularEndpoints.reportes.pdf, {
    params: queryParams,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const cleanPlaca = params.placa
    ? params.placa.replace(/[^a-zA-Z0-9-]/g, "")
    : "vehiculo"
  a.download = `bitacora-salidas-${cleanPlaca}-${params.fechaDesde}_${params.fechaHasta}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const abrirReporteSalidasBitacoraPdf = async (
  params: DescargarReporteBitacoraPdfParams
): Promise<void> => {
  const queryParams: Record<string, string> = {
    activoId: params.activoId,
    fechaDesde: `${params.fechaDesde}T00:00:00`,
    fechaHasta: `${params.fechaHasta}T23:59:59`,
  }
  if (params.search?.trim()) {
    queryParams.search = params.search.trim()
  }

  const blob = await http.get<Blob>(salidaVehicularEndpoints.reportes.pdf, {
    params: queryParams,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  window.open(url, "_blank")
}
