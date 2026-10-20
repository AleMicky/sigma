export interface GestionVehicularKpis {
  totalVehiculosFlota: number
  vehiculosDisponibles: number
  vehiculosEnViaje: number
  vehiculosEnMantenimiento: number
  vehiculosAsignados: number

  totalConductores: number
  conductoresActivos: number
  licenciasPorVencer: number

  solicitudesPendientes: number
  solicitudesAprobadas: number
  solicitudesEnCurso: number

  viajesMesActual: number
  viajesEnCurso: number
  kmRecorridosMesActual: number

  combustibleLitrosMesActual: number
  combustibleCostoMesActual: number
}

export interface TendenciaViajes {
  periodo: string
  mesLabel: string
  totalViajes: number
  completados: number
  cancelados: number
  enCurso: number
  totalKmRecorridos: number
}

export interface TendenciaCombustible {
  periodo: string
  mesLabel: string
  totalLitros: number
  totalCosto: number
  cantidadCargas: number
}

export interface DistribucionEstado {
  clave: string
  label: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface TopVehiculoKm {
  activoId: string
  codigo: string
  placa: string
  marcaModelo: string
  totalKmRecorridos: number
  cantidadViajes: number
}

export interface TopVehiculoCombustible {
  activoId: string
  codigo: string
  placa: string
  marcaModelo: string
  totalLitros: number
  totalCosto: number
  cantidadCargas: number
}

export interface ViajeActivoReciente {
  viajeId: string
  solicitudId: string | null
  numeroSolicitud: string
  motivo: string
  destino: string
  activoId: string | null
  vehiculoCodigo: string
  placa: string
  marcaModelo: string
  conductorId: string | null
  conductorNombre: string
  fechaSalida: string
  fechaRetornoEstimada: string | null
  estado: "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO" | string
  kilometrajeSalida: number | null
}

export interface AlertaLicenciaConductor {
  conductorId: string
  conductorNombre: string
  conductorCodigo: string
  numeroLicencia: string
  categoria: string
  fechaVencimiento: string
  diasRestantes: number
  nivelAlerta: "VENCIDA" | "CRITICA" | "ADVERTENCIA" | string
}

export interface GestionVehicularDashboardData {
  kpis: GestionVehicularKpis
  tendenciaViajesYKm: TendenciaViajes[]
  tendenciaCombustible: TendenciaCombustible[]
  distribucionFlota: DistribucionEstado[]
  distribucionSolicitudes: DistribucionEstado[]
  topVehiculosRecorrido: TopVehiculoKm[]
  topVehiculosCombustible: TopVehiculoCombustible[]
  viajesActivosRecientes: ViajeActivoReciente[]
  alertasLicencias: AlertaLicenciaConductor[]
}
