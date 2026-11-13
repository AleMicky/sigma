import type { PageParams } from "@/shared/types/api.types"

export type EstadoRegistroPorteria = "AFUERA" | "COMPLETADO" | "ANULADO"

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
  empleadoId: string
  empleadoNombre: string | null
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
  empleadoId: string
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
  estado?: EstadoRegistroPorteria
  fechaDesde?: string
  fechaHasta?: string
}

