import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { menuEndpoints } from "./menu.endpoints"

export type Menu = AuditableEntity & {
  menuPadreId: string | null
  codigo: string
  nombre: string
  icono: string | null
  ruta: string | null
  orden: number
  activo: boolean
}

export type MenuTreeNode = {
  id: string
  menuPadreId: string | null
  codigo: string
  nombre: string
  icono: string | null
  ruta: string | null
  orden: number
  activo: boolean
  hijos: MenuTreeNode[]
}

export type CreateMenuDto = {
  codigo: string
  nombre: string
  icono?: string | null
  ruta?: string | null
  menuPadreId?: string | null
  orden?: number | null
  activo?: boolean
}

export type UpdateMenuDto = {
  codigo: string
  nombre: string
  icono?: string | null
  ruta?: string | null
  menuPadreId?: string | null
  orden?: number | null
  activo?: boolean
}

export const listMenus = (params?: PageParams) =>
  http.get<PageResponse<Menu>>(menuEndpoints.root, { params })

export const listAllMenus = () =>
  http.get<Menu[]>(menuEndpoints.todos)

export const getMenuArbol = () =>
  http.get<MenuTreeNode[]>(menuEndpoints.arbol)

export const getMenu = (id: string) =>
  http.get<Menu>(menuEndpoints.byId(id))

export const createMenu = (dto: CreateMenuDto) =>
  http.post<Menu>(menuEndpoints.root, dto)

export const updateMenu = (id: string, dto: UpdateMenuDto) =>
  http.put<Menu>(menuEndpoints.byId(id), dto)

export const deleteMenu = (id: string) =>
  http.delete<void>(menuEndpoints.byId(id))
