import { http } from "@/shared/api/http"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

import { migracionEndpoints } from "./migracion.endpoints"

export type EstadoMigracion =
  | "PENDIENTE"
  | "MIGRADO"
  | "ACTUALIZADO"
  | "OMITIDO"
  | "ERROR"

export type RegistroMigracion = {
  id: string
  sistemaOrigen: string
  entidad: string
  idOrigen: string
  idDestino: string | null
  estado: EstadoMigracion
  mensaje: string | null
  fechaRegistro: string
}

export type MigracionFilters = PageParams & {
  sistemaOrigen?: string
  entidad?: string
  estado?: EstadoMigracion | string
  fechaDesde?: string
  fechaHasta?: string
  q?: string
  sort?: string
}

export async function listRegistrosMigracion(
  params?: MigracionFilters,
): Promise<PageResponse<RegistroMigracion>> {
  return http.get<PageResponse<RegistroMigracion>>(migracionEndpoints.root, {
    params,
  })
}

export async function getRegistroMigracion(
  id: string,
): Promise<RegistroMigracion> {
  return http.get<RegistroMigracion>(migracionEndpoints.byId(id))
}
