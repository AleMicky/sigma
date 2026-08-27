import { http } from "@/shared/api"
import type { PageParams, PageResponse } from "@/shared/types/api.types"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { usuarioEndpoints } from "./usuario.endpoints"

export type Usuario = AuditableEntity & {
  keycloakUserId: string
  username: string
  nombre: string
  email: string
  activo: boolean
  roles?: string[]
}

export const listUsuarios = (params?: PageParams) =>
  http.get<PageResponse<Usuario>>(usuarioEndpoints.root, { params })

export const getUsuario = (id: string) =>
  http.get<Usuario>(usuarioEndpoints.byId(id))

export const sincronizarUsuarios = () =>
  http.post<number>(usuarioEndpoints.sincronizar)
