import type { PageParams } from "@/shared/types/api.types"

export type EstadoRegistroPorteria = "AFUERA" | "COMPLETADO" | "ANULADO"
export type TipoMovimientoPorteria = "SALIDA" | "ENTRADA"

export interface RegistroPorteriaActivo {
  id: string
  activoId: string | null
  activoCodigo: string | null
  activoNombre: string | null
  descripcionItem: string | null
  cantidad: number
  observacionSalida: string | null
  retornado: boolean | null
  observacionLlegada: string | null
}

export interface RegistroPorteria {
  id: string
  numero: string
  tipoMovimiento?: TipoMovimientoPorteria
  empleadoId: string | null
  empleadoNombre: string | null
  esExterno?: boolean
  personaExterna?: string | null
  placaExterna?: string | null
  origenUbicacionId?: string | null
  origenUbicacionNombre?: string | null
  destinoUbicacionId?: string | null
  destinoUbicacionNombre?: string | null
  destinoOtro?: string | null
  guardiaSalidaId: string | null
  guardiaSalidaNombre: string | null
  guardiaLlegadaId: string | null
  guardiaLlegadaNombre: string | null
  salidaVehicularId: string | null
  fechaHoraSalida: string
  fechaHoraLlegada: string | null
  estado: EstadoRegistroPorteria
  observacionSalida: string | null
  observacionLlegada: string | null
  activos: RegistroPorteriaActivo[]
  createdAt: string
  updatedAt: string | null
}

export interface RegistroPorteriaActivoSalidaRequest {
  activoId?: string | null
  descripcionItem?: string | null
  cantidad?: number
  observacionSalida?: string | null
}

export interface RegistrarSalidaPorteriaRequest {
  tipoMovimiento?: TipoMovimientoPorteria
  empleadoId?: string | null
  esExterno?: boolean
  personaExterna?: string | null
  placaExterna?: string | null
  origenUbicacionId?: string | null
  destinoUbicacionId?: string | null
  destinoOtro?: string | null
  fechaHoraSalida?: string
  salidaVehicularId?: string | null
  observacionSalida?: string | null
  activos: RegistroPorteriaActivoSalidaRequest[]
}

export interface RegistroPorteriaActivoLlegadaRequest {
  itemId: string
  retornado: boolean
  observacionLlegada?: string | null
}

export interface RegistrarLlegadaPorteriaRequest {
  fechaHoraLlegada?: string
  observacionLlegada?: string | null
  activos?: RegistroPorteriaActivoLlegadaRequest[]
}

export interface AnularRegistroPorteriaRequest {
  motivo?: string | null
}

export interface PorteriaFiltros extends PageParams {
  search?: string
  empleadoId?: string
  activoId?: string
  areaId?: string
  tipoMovimiento?: TipoMovimientoPorteria
  estado?: EstadoRegistroPorteria
  fechaDesde?: string
  fechaHasta?: string
}

export interface BitacoraPorteriaItem {
  id: string
  numero: string
  tipoMovimiento?: TipoMovimientoPorteria
  dia?: number | null
  diaSemana?: string | null
  fechaFormateada?: string | null
  horaSalidaFormateada?: string | null
  horaLlegadaFormateada?: string | null
  fechaHoraSalida: string
  fechaHoraLlegada?: string | null
  duracionMinutos?: number | null
  duracionTexto?: string | null
  esExterno?: boolean
  tipoRegistro?: "INTERNO" | "EXTERNO" | string
  empleadoId?: string | null
  empleadoCodigo?: string | null
  empleadoNombre?: string | null
  empleadoCargo?: string | null
  empleadoArea?: string | null
  personaExterna?: string | null
  placaExterna?: string | null
  activoPrincipalId?: string | null
  vehiculoPlaca?: string | null
  vehiculoCodigo?: string | null
  vehiculoNombre?: string | null
  activosResumen?: string | null
  totalActivos?: number | null
  activosRetornados?: number | null
  activosPendientesRetorno?: number | null
  activos: RegistroPorteriaActivo[]
  origenUbicacionId?: string | null
  origenUbicacionNombre?: string | null
  destinoUbicacionId?: string | null
  destinoUbicacionNombre?: string | null
  destinoOtro?: string | null
  rutaTexto?: string | null
  descripcionActividad?: string | null
  guardiaSalidaId?: string | null
  guardiaSalidaNombre?: string | null
  guardiaLlegadaId?: string | null
  guardiaLlegadaNombre?: string | null
  salidaVehicularId?: string | null
  salidaVehicularNumero?: string | null
  observacionSalida?: string | null
  observacionLlegada?: string | null
  observacionesConsolidadas?: string | null
  estado: EstadoRegistroPorteria
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: string | null
  updatedBy?: string | null
}

export interface ReporteBitacoraPorteriaResponse {
  periodoTexto: string
  mes: string
  anio: number
  totalRegistros: number
  totalInternos: number
  totalExternos: number
  totalAfuera: number
  totalCompletados: number
  totalAnulados: number
  totalActivosMovilizados: number
  totalActivosNoRetornados: number
  duracionPromedioMinutos: number
  items: BitacoraPorteriaItem[]
}

export interface ReporteBitacoraPorteriaFiltros {
  search?: string
  empleadoId?: string
  activoId?: string
  areaId?: string
  createdById?: string
  esExterno?: boolean
  estado?: EstadoRegistroPorteria
  fechaDesde?: string
  fechaHasta?: string
}

/** Parámetros de `GET /porteria/reporte/paginado` (mismos filtros de `/reporte`). */
export interface ReporteBitacoraPorteriaPaginadoParams
  extends ReporteBitacoraPorteriaFiltros {
  q?: string
  fechaInicio?: string
  fechaFin?: string
  page?: number
  size?: number
}

