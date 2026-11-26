import { http, openPdfInNewTab } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { porteriaEndpoints } from "./porteria.endpoints"
import type {
  AnularRegistroPorteriaRequest,
  PorteriaFiltros,
  RegistrarLlegadaPorteriaRequest,
  RegistrarSalidaPorteriaRequest,
  RegistroPorteria,
  ReporteBitacoraPorteriaFiltros,
  ReporteBitacoraPorteriaResponse,
} from "./porteria.types"

export const listRegistrosPorteria = (
  params?: PorteriaFiltros
): Promise<PageResponse<RegistroPorteria>> => {
  return http.get<PageResponse<RegistroPorteria>>(porteriaEndpoints.root, {
    params,
  })
}

export const listRegistrosAfuera = (): Promise<RegistroPorteria[]> => {
  return http.get<RegistroPorteria[]>(porteriaEndpoints.afuera)
}

export const getRegistroPorteriaById = (id: string): Promise<RegistroPorteria> => {
  return http.get<RegistroPorteria>(porteriaEndpoints.byId(id))
}

export const getReporteBitacoraPorteria = (
  params?: ReporteBitacoraPorteriaFiltros
): Promise<ReporteBitacoraPorteriaResponse> => {
  return http.get<ReporteBitacoraPorteriaResponse>(porteriaEndpoints.reporte, {
    params,
  })
}

async function fetchReporteBitacoraPorteriaPdf(
  params?: ReporteBitacoraPorteriaFiltros
): Promise<Blob> {
  return http.get<Blob>(porteriaEndpoints.reportePdf, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })
}

export async function descargarReporteBitacoraPorteriaPdf(
  params?: ReporteBitacoraPorteriaFiltros
): Promise<void> {
  const blob = await fetchReporteBitacoraPorteriaPdf(params)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const rango =
    params?.fechaDesde && params?.fechaHasta
      ? `${params.fechaDesde}_${params.fechaHasta}`
      : "general"
  a.download = `bitacora-porteria-${rango}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export async function abrirReporteBitacoraPorteriaPdf(
  params?: ReporteBitacoraPorteriaFiltros
): Promise<void> {
  const rango =
    params?.fechaDesde && params?.fechaHasta
      ? `${params.fechaDesde}_${params.fechaHasta}`
      : "general"
  await openPdfInNewTab(
    porteriaEndpoints.reportePdf,
    `bitacora-porteria-${rango}.pdf`,
    params ? { ...params } : undefined,
  )
}

export const registrarSalidaPorteria = (
  data: RegistrarSalidaPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.salidas, data)
}

export const registrarLlegadaPorteria = (
  id: string,
  data?: RegistrarLlegadaPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.llegada(id), data)
}

export const anularRegistroPorteria = (
  id: string,
  data?: AnularRegistroPorteriaRequest
): Promise<RegistroPorteria> => {
  return http.post<RegistroPorteria>(porteriaEndpoints.anular(id), data)
}

