import { queryOptions } from "@tanstack/react-query"
import type { PageParams } from "@/shared/types/api.types"

import { salidaVehicularKeys } from "./salida-vehicular.keys"
import {
  getAcciones,
  getHistorialProceso,
  getReporteBitacoras,
  getReporteEmpleados,
  getReporteGeneral,
  getReporteTiempos,
  getReporteVehiculos,
  getSalidaById,
  getTareaActual,
  listBitacoras,
  listEventos,
  listMisSalidas,
  listSalidas,
  listSalidasActivas,
} from "./salida-vehicular.service"
import type { SalidaVehicularFiltros } from "./salida-vehicular.types"

export const salidaVehicularQueries = {
  list: (filters?: SalidaVehicularFiltros) =>
    queryOptions({
      queryKey: salidaVehicularKeys.list(filters),
      queryFn: () => listSalidas(filters),
    }),

  activas: () =>
    queryOptions({
      queryKey: salidaVehicularKeys.activas(),
      queryFn: () => listSalidasActivas(),
    }),

  misSalidas: (params?: PageParams) =>
    queryOptions({
      queryKey: salidaVehicularKeys.misSalidas(params as Record<string, unknown>),
      queryFn: () => listMisSalidas(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.detail(id),
      queryFn: () => getSalidaById(id),
      enabled: Boolean(id),
    }),

  tareaActual: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.tareaActual(id),
      queryFn: () => getTareaActual(id),
      enabled: Boolean(id),
    }),

  acciones: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.acciones(id),
      queryFn: () => getAcciones(id),
      enabled: Boolean(id),
    }),

  historial: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.historial(id),
      queryFn: () => getHistorialProceso(id),
      enabled: Boolean(id),
    }),

  eventos: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.eventos(id),
      queryFn: () => listEventos(id),
      enabled: Boolean(id),
    }),

  bitacoras: (id: string) =>
    queryOptions({
      queryKey: salidaVehicularKeys.bitacoras(id),
      queryFn: () => listBitacoras(id),
      enabled: Boolean(id),
    }),

  // Reportes
  reporteGeneral: (params?: Record<string, unknown>) =>
    queryOptions({
      queryKey: salidaVehicularKeys.reportes.general(params),
      queryFn: () => getReporteGeneral(params),
    }),

  reporteVehiculos: (params?: Record<string, unknown>) =>
    queryOptions({
      queryKey: salidaVehicularKeys.reportes.vehiculos(params),
      queryFn: () => getReporteVehiculos(params),
    }),

  reporteEmpleados: (params?: Record<string, unknown>) =>
    queryOptions({
      queryKey: salidaVehicularKeys.reportes.empleados(params),
      queryFn: () => getReporteEmpleados(params),
    }),

  reporteTiempos: (params?: Record<string, unknown>) =>
    queryOptions({
      queryKey: salidaVehicularKeys.reportes.tiempos(params),
      queryFn: () => getReporteTiempos(params),
    }),

  reporteBitacoras: (params?: Record<string, unknown>) =>
    queryOptions({
      queryKey: salidaVehicularKeys.reportes.bitacoras(params),
      queryFn: () => getReporteBitacoras(params),
    }),
}
