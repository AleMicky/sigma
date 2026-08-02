import { createCrudMutations } from "@/shared/api"

import { tipoDatoKeys } from "./tipo-dato.keys"
import {
  createTipoDato,
  deleteTipoDato,
  updateTipoDato,
  type TipoDato,
  type TipoDatoPayload,
} from "./tipo-dato.service"

const tipoDatoMutations = createCrudMutations<TipoDato, TipoDatoPayload>({
  keys: tipoDatoKeys,
  service: {
    create: createTipoDato,
    update: updateTipoDato,
    remove: deleteTipoDato,
  },
  messages: {
    created: "Tipo de dato creado correctamente",
    updated: "Tipo de dato actualizado correctamente",
    deleted: "Tipo de dato eliminado correctamente",
  },
})

export const useCreateTipoDato = tipoDatoMutations.useCreate
export const useUpdateTipoDato = tipoDatoMutations.useUpdate
export const useDeleteTipoDato = tipoDatoMutations.useDelete
