import { queryOptions } from "@tanstack/react-query"

import { porteriaKeys } from "./porteria.keys"
import {
  getRegistroPorteriaById,
  getReporteBitacoraPorteria,
  getReporteBitacoraPorteriaPaginado,
  listRegistrosAfuera,
  listRegistrosPorteria,
} from "./porteria.service"
import type {
  PorteriaFiltros,
  ReporteBitacoraPorteriaFiltros,
  ReporteBitacoraPorteriaPaginadoParams,
} from "./porteria.types"

export const porteriaQueries = {
  list: (filters?: PorteriaFiltros) =>
    queryOptions({
      queryKey: porteriaKeys.list(filters),
      queryFn: () => listRegistrosPorteria(filters),
    }),

  afuera: () =>
    queryOptions({
      queryKey: porteriaKeys.afuera(),
      queryFn: () => listRegistrosAfuera(),
    }),

  reporte: (filters?: ReporteBitacoraPorteriaFiltros) =>
    queryOptions({
      queryKey: porteriaKeys.reporte(filters),
      queryFn: () => getReporteBitacoraPorteria(filters),
    }),

  reportePaginado: (filters?: ReporteBitacoraPorteriaPaginadoParams) =>
    queryOptions({
      queryKey: porteriaKeys.reportePaginado(filters),
      queryFn: () => getReporteBitacoraPorteriaPaginado(filters),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: porteriaKeys.detail(id),
      queryFn: () => getRegistroPorteriaById(id),
      enabled: Boolean(id),
    }),
}

