import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { createCrudService, http, uploadImage } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { activoEndpoints } from "./activo.endpoints"
import type { ActivoResumenFilters } from "./activo.keys"

export type ActivoTipoActivoInfo = {
  id: string
  categoriaId: string
  nombre: string
  descripcion?: string | null
  color?: string | null
  icono?: string | null
}

export type ActivoUbicacionInfo = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  tipo?: string | null
}

export type ActivoEstadoOperativoInfo = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  color?: string | null
}

export type Activo = AuditableEntity & {
  codigo: string
  codigoAlternativo: string | null
  nombre: string
  descripcion: string | null
  tipoActivoId?: string
  tipoActivo?: (TipoActivo & ActivoTipoActivoInfo) | null
  ubicacionId?: string | null
  ubicacion?: (Ubicacion & ActivoUbicacionInfo) | null
  estadoOperativoId?: string | null
  estadoOperativo?: ActivoEstadoOperativoInfo | null
  fechaAdquisicion: string | null
  urlImagen: string | null
  activo: boolean
  enProcesoMantenimiento?: boolean | null
  solicitudActivaNumero?: string | null
  solicitudActivaEstado?: string | null
}

export type ActivoPayload = {
  codigo: string
  codigoAlternativo?: string | null
  nombre: string
  descripcion?: string | null
  tipoActivoId: string
  ubicacionId?: string | null
  estadoOperativoId?: string | null
  fechaAdquisicion?: string | null
  activo?: boolean
}

export type ActivoListParams = PageParams & {
  tipoActivoId?: string
  ubicacionId?: string
  q?: string
  activo?: boolean
}

/** Agregados calculados por el backend con los mismos filtros que el listado. */
export type ActivoResumen = {
  total: number
  deBaja: number
  enMantenimiento: number
  operativos: number
  operativo: number
  reserva: number
  enViaje: number
  fueraServicio: number
  disponibles: number
  /** Porcentaje ya calculado por el servidor (no volver a multiplicar por 100). */
  tasaDisponibilidad: number
}

export const EMPTY_ACTIVO_RESUMEN: ActivoResumen = {
  total: 0,
  deBaja: 0,
  enMantenimiento: 0,
  operativos: 0,
  operativo: 0,
  reserva: 0,
  enViaje: 0,
  fueraServicio: 0,
  disponibles: 0,
  tasaDisponibilidad: 0,
}

const crud = createCrudService<Activo, ActivoPayload, ActivoListParams>(
  activoEndpoints,
)

export const listActivos = crud.list
export const getActivo = crud.get
export const createActivo = crud.create
export const updateActivo = crud.update
export const deleteActivo = crud.remove

export async function getActivoResumen(
  filters?: ActivoResumenFilters,
): Promise<ActivoResumen> {
  return http.get<ActivoResumen>(`${activoEndpoints.root}/resumen`, {
    params: filters,
  })
}

export function uploadActivoImagen(id: string, file: File) {
  return uploadImage<Activo>(`${activoEndpoints.byId(id)}/imagen`, file)
}

export function deleteActivoImagen(id: string) {
  return http.delete<Activo>(`${activoEndpoints.byId(id)}/imagen`)
}

export async function setActivoActivo(
  id: string,
  activo: boolean,
): Promise<Activo> {
  return http.patch<Activo>(`${activoEndpoints.byId(id)}/activo`, {
    activo,
  })
}

export type CambiarEstadoOperativoPayload = {
  estadoOperativoId?: string
  codigoEstado?: string
  observacion?: string
}

export async function cambiarEstadoOperativoActivo(
  id: string,
  payload: CambiarEstadoOperativoPayload,
): Promise<Activo> {
  return http.patch<Activo>(
    `${activoEndpoints.byId(id)}/estado-operativo`,
    payload,
  )
}

export type ActivoDisponibilidadParams = PageParams & {
  q?: string
  estadoOperativoId?: string
  tipoActivoId?: string
  categoriaId?: string
  ubicacionId?: string
  activo?: boolean
}

export type ActivoParaSolicitudParams = PageParams & {
  q?: string
  tipoActivoId?: string
  solicitudIdExcluir?: string
}

export function listActivosParaSolicitud(
  params?: ActivoParaSolicitudParams,
): Promise<import("@/shared/types/api.types").PageResponse<Activo>> {
  return http.get<import("@/shared/types/api.types").PageResponse<Activo>>(
    "/solicitudes-mantenimiento/activos",
    { params },
  )
}

export function listActivosDisponibilidad(
  params?: ActivoDisponibilidadParams,
): Promise<import("@/shared/types/api.types").PageResponse<Activo>> {
  return http.get<import("@/shared/types/api.types").PageResponse<Activo>>("/activos/disponibilidad", {
    params,
  })
}

export async function exportarActivosDisponibilidadExcel(
  filtros?: Omit<ActivoDisponibilidadParams, "page" | "size" | "sort">,
): Promise<void> {
  const params: Record<string, string> = {}
  if (filtros?.q) params.q = filtros.q
  if (filtros?.estadoOperativoId) params.estadoOperativoId = filtros.estadoOperativoId
  if (filtros?.tipoActivoId) params.tipoActivoId = filtros.tipoActivoId
  if (filtros?.categoriaId) params.categoriaId = filtros.categoriaId
  if (filtros?.ubicacionId) params.ubicacionId = filtros.ubicacionId
  if (filtros?.activo !== undefined) params.activo = String(filtros.activo)

  const blob = await http.get<Blob>("/activos/disponibilidad/exportar-excel", {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const fechaHoy = new Date().toISOString().split("T")[0]
  a.download = `disponibilidad-activos-${fechaHoy}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

