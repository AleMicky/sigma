import { http } from "@/shared/api"

import { bitacoraEndpoints } from "./bitacora.endpoints"

export interface BitacoraVehicularItem {
  id: string
  fecha?: string | null
  dia?: number | null
  diaSemana?: string | null
  tipoRegistro: "VIAJE" | "CARGA_COMBUSTIBLE"
  kmSalida?: number | null
  kmLlegada?: number | null
  kmRecorrido?: number | null
  descripcionTrabajo?: string | null
  solicitudId?: string | null
  solicitudNumero?: string | null
  combustibleFactura?: string | null
  combustibleLitros?: number | null
  combustibleImporte?: number | null
  supervisorNombre?: string | null
  supervisorVoBo?: boolean | null
  observaciones?: string | null
  conductorNombre?: string | null
  conductorLicencia?: string | null
}

export interface BitacoraVehicularVehiculoInfo {
  id: string
  codigo: string
  nombre: string
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  tipoVehiculo?: string | null
  kilometrajeActual?: number | null
  proximoMantenimientoKm?: number | null
}

export interface BitacoraVehicularPeriodoInfo {
  fechaInicio: string
  fechaFin: string
  mes: string
  anio: number
}

export interface BitacoraVehicularResumen {
  totalViajes: number
  totalCargasCombustible: number
  kmSalidaInicial?: number | null
  kmRetornoFinal?: number | null
  totalKmRecorridos?: number | null
  totalLitrosCombustible?: number | null
  totalImporteCombustible?: number | null
  rendimientoKmPorLitro?: number | null
  costoPromedioPorKm?: number | null
}

export interface BitacoraVehicularReporte {
  vehiculo: BitacoraVehicularVehiculoInfo
  periodo: BitacoraVehicularPeriodoInfo
  conductorFiltroNombre?: string | null
  resumen: BitacoraVehicularResumen
  items: BitacoraVehicularItem[]
}

export interface BitacoraVehicularFiltros {
  activoId: string
  fechaInicio: string
  fechaFin: string
  conductorId?: string | null
}

/**
 * Consulta los datos estructurados del reporte de bitácora vehicular.
 */
export async function getBitacoraVehicular(
  filtros: BitacoraVehicularFiltros
): Promise<BitacoraVehicularReporte> {
  const params: Record<string, string> = {
    activoId: filtros.activoId,
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin,
  }
  if (filtros.conductorId) {
    params.conductorId = filtros.conductorId
  }

  return http.get<BitacoraVehicularReporte>(bitacoraEndpoints.root, { params })
}

/**
 * Descarga el reporte oficial de la bitácora en formato PDF (idéntico al impreso ENDE CORANI).
 */
export async function descargarBitacoraVehicularPdf(
  filtros: BitacoraVehicularFiltros,
  placa?: string | null
): Promise<void> {
  const params: Record<string, string> = {
    activoId: filtros.activoId,
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin,
  }
  if (filtros.conductorId) {
    params.conductorId = filtros.conductorId
  }

  const blob = await http.get<Blob>(bitacoraEndpoints.pdf, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const cleanPlaca = placa ? placa.replace(/[^a-zA-Z0-9-]/g, "") : "vehiculo"
  a.download = `bitacora-${cleanPlaca}-${filtros.fechaInicio}_${filtros.fechaFin}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Abre el reporte oficial de la bitácora en PDF en una nueva pestaña del navegador.
 */
export async function abrirBitacoraVehicularPdf(
  filtros: BitacoraVehicularFiltros
): Promise<void> {
  const params: Record<string, string> = {
    activoId: filtros.activoId,
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin,
  }
  if (filtros.conductorId) {
    params.conductorId = filtros.conductorId
  }

  const blob = await http.get<Blob>(bitacoraEndpoints.pdf, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  const url = window.URL.createObjectURL(blob)
  window.open(url, "_blank")
}

// ============================================================================
// BITÁCORA CONSOLIDADA (Salidas vehiculares + Solicitudes vehiculares)
// ============================================================================

export type BitacoraConsolidadaOrigen = "SALIDA" | "SOLICITUD"

export interface BitacoraConsolidadaItem {
  id: string
  origen: BitacoraConsolidadaOrigen
  numero: string
  fecha?: string | null
  dia?: number | null
  fechaFormateada?: string | null
  descripcionActividad?: string | null
  kmSalida?: number | null
  kmLlegada?: number | null
  kmRecorrido?: number | null
  combustibleTexto?: string | null
  combustibleLitros?: number | null
  combustibleFactura?: string | null
  conductorNombre?: string | null
  observaciones?: string | null
  estado?: string | null
  activoId?: string | null
  vehiculoPlaca?: string | null
  vehiculoCodigo?: string | null
}

export interface BitacoraConsolidadaReporte {
  totalRegistros: number
  totalSalidas: number
  totalSolicitudes: number
  totalKmRecorridos?: number | null
  totalLitrosCombustible?: number | null
  items: BitacoraConsolidadaItem[]
}

export interface BitacoraConsolidadaFiltros {
  activoId?: string | null
  fechaInicio: string
  fechaFin: string
  search?: string | null
}

function buildConsolidadoParams(filtros: BitacoraConsolidadaFiltros): Record<string, string> {
  const params: Record<string, string> = {
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin,
  }
  if (filtros.activoId?.trim()) {
    params.activoId = filtros.activoId.trim()
  }
  if (filtros.search?.trim()) {
    params.search = filtros.search.trim()
  }
  return params
}

/**
 * Consulta la bitácora consolidada: bitácora de salidas + solicitudes vehiculares.
 */
export async function getBitacoraConsolidada(
  filtros: BitacoraConsolidadaFiltros
): Promise<BitacoraConsolidadaReporte> {
  return http.get<BitacoraConsolidadaReporte>(bitacoraEndpoints.consolidado, {
    params: buildConsolidadoParams(filtros),
  })
}

async function fetchBitacoraConsolidadaPdf(filtros: BitacoraConsolidadaFiltros): Promise<Blob> {
  return http.get<Blob>(bitacoraEndpoints.consolidadoPdf, {
    params: buildConsolidadoParams(filtros),
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })
}

/**
 * Descarga el PDF oficial GA-IN7-04 de la bitácora consolidada.
 */
export async function descargarBitacoraConsolidadaPdf(
  filtros: BitacoraConsolidadaFiltros,
  placa?: string | null
): Promise<void> {
  const blob = await fetchBitacoraConsolidadaPdf(filtros)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const cleanPlaca = placa ? placa.replace(/[^a-zA-Z0-9-]/g, "") : "flota-completa"
  a.download = `bitacora-vehicular-${cleanPlaca || "flota-completa"}-${filtros.fechaInicio}_${filtros.fechaFin}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Abre en una nueva pestaña el PDF oficial GA-IN7-04 de la bitácora consolidada.
 */
export async function abrirBitacoraConsolidadaPdf(
  filtros: BitacoraConsolidadaFiltros
): Promise<void> {
  const blob = await fetchBitacoraConsolidadaPdf(filtros)
  const url = window.URL.createObjectURL(blob)
  window.open(url, "_blank")
}
