import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { Menu, MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import type { Usuario } from "@/modules/seguridad/usuario/api/usuario.service"

import { rolEndpoints } from "./rol.endpoints"

export type Rol = AuditableEntity & {
  keycloakRoleId: string
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
}

export type AsignarMenusRolDto = {
  menuIds: string[]
}

export const listRoles = (params?: PageParams) =>
  http.get<PageResponse<Rol>>(rolEndpoints.root, { params })

export const listAllRoles = () =>
  http.get<Rol[]>(rolEndpoints.todos)

export const getRol = (id: string) =>
  http.get<Rol>(rolEndpoints.byId(id))

export const sincronizarRoles = () =>
  http.post<number>(rolEndpoints.sincronizar)

export const getRolMenus = (id: string) =>
  http.get<Menu[]>(rolEndpoints.menus(id))

export const getRolMenuIds = (id: string) =>
  http.get<string[]>(rolEndpoints.menuIds(id))

export const getRolMenuArbol = (id: string) =>
  http.get<MenuTreeNode[]>(rolEndpoints.menuArbol(id))

export const asignarMenusRol = (id: string, menuIds: string[]) =>
  http.put<string[]>(rolEndpoints.menus(id), { menuIds })

export const getRolUsuarios = (id: string) =>
  http.get<Usuario[]>(rolEndpoints.usuarios(id))

