import { queryOptions } from "@tanstack/react-query"
import {
  getConfiguracionPreventiva,
  listPreventivoHistorico,
  type PreventivoHistorialParams,
} from "./preventivo.service"

export const preventivoKeys = {
  all: ["mantenimientos-preventivo"] as const,
  configuracion: () => [...preventivoKeys.all, "configuracion"] as const,
  historico: (params: PreventivoHistorialParams) =>
    [...preventivoKeys.all, "historico", params] as const,
}

export const preventivoQueries = {
  configuracion: () =>
    queryOptions({
      queryKey: preventivoKeys.configuracion(),
      queryFn: getConfiguracionPreventiva,
    }),
  historico: (params: PreventivoHistorialParams = {}) =>
    queryOptions({
      queryKey: preventivoKeys.historico(params),
      queryFn: () => listPreventivoHistorico(params),
    }),
}
