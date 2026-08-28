import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { permisoEndpoints } from "./permiso.endpoints"

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"

export type Permiso = AuditableEntity & {
  menuId: string
  codigo: string
  nombre: string
  descripcion: string | null
  metodoHttp: string
  ruta: string
  activo: boolean
}

export type CreatePermisoDto = {
  menuId: string
  codigo: string
  nombre: string
  descripcion?: string | null
  metodoHttp: string
  ruta: string
  activo?: boolean
}

export type UpdatePermisoDto = {
  menuId: string
  codigo: string
  nombre: string
  descripcion?: string | null
  metodoHttp: string
  ruta: string
  activo?: boolean
}

export type PermisoFilters = PageParams & {
  menuId?: string
}

export const listPermisos = (params?: PermisoFilters) =>
  http.get<PageResponse<Permiso>>(permisoEndpoints.root, { params })

export const listAllPermisos = () =>
  http.get<Permiso[]>(permisoEndpoints.todos)

export const listPermisosByMenu = (menuId: string) =>
  http.get<Permiso[]>(permisoEndpoints.todosPorMenu(menuId))

export const getPermiso = (id: string) =>
  http.get<Permiso>(permisoEndpoints.byId(id))

export const createPermiso = (dto: CreatePermisoDto) =>
  http.post<Permiso>(permisoEndpoints.root, dto)

export const updatePermiso = (id: string, dto: UpdatePermisoDto) =>
  http.put<Permiso>(permisoEndpoints.byId(id), dto)

export const deletePermiso = (id: string) =>
  http.delete<void>(permisoEndpoints.byId(id))
