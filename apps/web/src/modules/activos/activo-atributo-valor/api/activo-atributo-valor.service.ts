import { createCrudService, http } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams } from "@/shared/types/api.types"

import { activoAtributoValorEndpoints } from "./activo-atributo-valor.endpoints"

export type ActivoAtributoValor = AuditableEntity & {
  activoId: string
  activoAtributoId: string
  valor: string | null
}

export type ActivoAtributoValorPayload = {
  activoId: string
  activoAtributoId: string
  valor?: string | null
}

export type ActivoAtributoValorListParams = PageParams & {
  activoId?: string
}

export type ActivoAtributoValorBulkItem = {
  atributoId: string
  valor: string | null
}

export type ReplaceActivoAtributosPayload = {
  valores: ActivoAtributoValorBulkItem[]
}

const crud = createCrudService<
  ActivoAtributoValor,
  ActivoAtributoValorPayload,
  ActivoAtributoValorListParams
>(activoAtributoValorEndpoints)

export const listActivoAtributoValores = crud.list

/**
 * Recupera todos los valores del activo paginando de 100 en 100. El bulk de
 * reemplazo debe recibir los valores ocultos y los que quedan después de la
 * primera página; no basta con `listActivoAtributoValores`.
 */
export async function listAllActivoAtributoValores(
  filters: ActivoAtributoValorListParams = {},
): Promise<ActivoAtributoValor[]> {
  const size = filters.size ?? 100
  const valores: ActivoAtributoValor[] = []
  let page = 0
  let totalPages: number

  do {
    const response = await listActivoAtributoValores({
      ...filters,
      page,
      size,
    })
    valores.push(...response.content)
    totalPages = response.totalPages
    page += 1
  } while (page < totalPages)

  return valores
}

export const getActivoAtributoValor = crud.get
export const createActivoAtributoValor = crud.create
export const updateActivoAtributoValor = crud.update
export const deleteActivoAtributoValor = crud.remove

/** Reemplaza en una sola transacción todos los valores de atributos del activo. */
export async function replaceActivoAtributos(
  activoId: string,
  payload: ReplaceActivoAtributosPayload,
): Promise<void> {
  await http.put<void>(`/activos/${activoId}/atributos`, payload)
}
