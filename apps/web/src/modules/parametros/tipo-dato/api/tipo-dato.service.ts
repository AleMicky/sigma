import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { tipoDatoEndpoints } from "./tipo-dato.endpoints"

export type TipoDato = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  permiteOpciones: boolean
}

export type TipoDatoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  permiteOpciones: boolean
}

const crud = createCrudService<TipoDato, TipoDatoPayload>(tipoDatoEndpoints)

export const listTiposDato = crud.list
export const getTipoDato = crud.get
export const createTipoDato = crud.create
export const updateTipoDato = crud.update
export const deleteTipoDato = crud.remove
