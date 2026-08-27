import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { rolEndpoints } from "./rol.endpoints"

export type Rol = AuditableEntity & {
  keycloakRoleId: string
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
}

export const listRoles = (params?: PageParams) =>
  http.get<PageResponse<Rol>>(rolEndpoints.root, { params })

export const listAllRoles = () =>
  http.get<Rol[]>(rolEndpoints.todos)

export const getRol = (id: string) =>
  http.get<Rol>(rolEndpoints.byId(id))

export const sincronizarRoles = () =>
  http.post<number>(rolEndpoints.sincronizar)
