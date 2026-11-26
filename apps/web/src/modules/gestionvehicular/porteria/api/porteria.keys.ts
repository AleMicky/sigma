import type {
  PorteriaFiltros,
  ReporteBitacoraPorteriaFiltros,
  ReporteBitacoraPorteriaPaginadoParams,
} from "./porteria.types"

export const porteriaKeys = {
  all: ["porteria"] as const,
  lists: () => [...porteriaKeys.all, "list"] as const,
  list: (filters?: PorteriaFiltros) => [...porteriaKeys.lists(), filters] as const,
  afuera: () => [...porteriaKeys.all, "afuera"] as const,
  reportes: () => [...porteriaKeys.all, "reporte"] as const,
  reporte: (filters?: ReporteBitacoraPorteriaFiltros) =>
    [...porteriaKeys.reportes(), filters] as const,
  // Subkey explícito: no colisiona con `reporte(filters)` y hereda las
  // invalidaciones de `porteriaKeys.reportes()` tras mutaciones de portería.
  reportesPaginados: () => [...porteriaKeys.reportes(), "paginado"] as const,
  reportePaginado: (filters?: ReporteBitacoraPorteriaPaginadoParams) =>
    [...porteriaKeys.reportesPaginados(), filters] as const,
  details: () => [...porteriaKeys.all, "detail"] as const,
  detail: (id: string) => [...porteriaKeys.details(), id] as const,
}

