import type { PageParams } from "@/shared/types/api.types"

export interface SalidaVehicular {
  id: string
  numero: string
  activoId: string
  activoCodigo?: string | null
  activoDescripcion?: string | null
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  empleadoId: string
  empleadoCodigo?: string | null
  empleadoNombre?: string | null
  motivo: string
  origen: string
  destino: string
  estado: string
  processInstanceId?: string | null
  eventos?: SalidaVehicularEvento[]
  bitacoras?: BitacoraVehicular[]
  createdAt: string
  updatedAt?: string | null
}

export interface SalidaVehicularEvento {
  id: string
  salidaVehicularId: string
  empleadoId: string
  empleadoNombre?: string | null
  tipoEvento: string
  fechaHora: string
  kilometraje?: number | null
  latitud?: number | null
  longitud?: number | null
  observacion?: string | null
  createdAt: string
}

export interface BitacoraVehicular {
  id: string
  salidaVehicularId: string
  empleadoId: string
  empleadoNombre?: string | null
  tipo: "ACTIVIDAD" | "NOVEDAD" | "INCIDENTE" | string
  fechaHora: string
  descripcion: string
  latitud?: number | null
  longitud?: number | null
  createdAt: string
}

export interface WorkflowAction {
  name: string
  variable: string
  value: string
}

export interface WorkflowField {
  id: string
  name: string
  type: string
  required: boolean
  readable: boolean
  writable: boolean
  component?: string | null
  source?: string | null
  url?: string | null
}

export interface WorkflowTask {
  id: string
  name: string
  taskDefinitionKey: string
  assignee?: string | null
  processInstanceId: string
  processDefinitionId: string
}

export interface WorkflowTaskActions {
  taskId?: string | null
  taskName?: string | null
  taskDefinitionKey?: string | null
  processInstanceId: string
  status?: string | null
  fields?: WorkflowField[]
  actions?: WorkflowAction[]
}

export interface WorkflowHistoryItem {
  taskId: string
  taskName: string
  taskDefinitionKey: string
  assignee?: string | null
  assigneeName?: string | null
  startTime?: string | null
  endTime?: string | null
  durationInMillis?: number | null
  deleteReason?: string | null
}

export interface WorkflowHistory {
  processInstanceId: string
  tasks: WorkflowHistoryItem[]
}

export interface RegistrarSalidaVehicularRequest {
  activoId: string
  empleadoId?: string | null
  motivo: string
  origen: string
  destino: string
}

export interface ActualizarSalidaVehicularRequest {
  motivo?: string
  origen?: string
  destino?: string
}

export interface CancelarSalidaVehicularRequest {
  motivo?: string
}

export interface EjecutarAccionSalidaRequest {
  kilometraje?: number | null
  latitud?: number | null
  longitud?: number | null
  observacion?: string | null
  variables?: Record<string, unknown>
}

export interface RegistrarBitacoraRequest {
  tipo: string
  descripcion: string
  fechaHora?: string | null
  latitud?: number | null
  longitud?: number | null
}

export interface SalidaVehicularFiltros extends PageParams {
  search?: string
  activoId?: string
  empleadoId?: string
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
}

// Tipos de Reportes
export interface ReporteSalidasGeneral {
  totalSalidas: number
  salidasActivas: number
  salidasFinalizadas: number
  salidasCanceladas: number
  items: SalidaVehicular[]
}

export interface ReporteVehiculoKilometraje {
  activoId: string
  activoCodigo?: string | null
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  activoDescripcion?: string | null
  cantidadSalidas: number
  kilometrajeInicial?: number | null
  kilometrajeFinal?: number | null
  kilometrajeTotalRecorrido: number
}

export interface ReporteEmpleadoSalidas {
  empleadoId: string
  empleadoCodigo?: string | null
  empleadoNombre?: string | null
  cargo?: string | null
  area?: string | null
  totalSalidas: number
  salidasActivas: number
  salidasFinalizadas: number
  salidasCanceladas: number
  totalBitacoras: number
  totalIncidentes: number
}

export interface ItemTiempoRecorrido {
  salidaId: string
  numero: string
  placa?: string | null
  vehiculoDescripcion?: string | null
  empleadoNombre?: string | null
  origen: string
  destino: string
  estado: string
  fechaInicio?: string | null
  fechaFin?: string | null
  duracionMinutos?: number | null
  duracionHoras?: number | null
}

export interface ReporteTiemposRecorrido {
  totalSalidasAnalizadas: number
  duracionPromedioHoras: number
  duracionMinimaMinutos?: number | null
  duracionMaximaMinutos?: number | null
  items: ItemTiempoRecorrido[]
}

export interface ReporteBitacorasActividadesIncidentes {
  totalBitacoras: number
  totalActividades: number
  totalNovedades: number
  totalIncidentes: number
  items: BitacoraVehicular[]
}
