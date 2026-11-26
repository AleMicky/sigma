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
