import { createCrudMutations } from "@/shared/api"

import { activoAtributoValorKeys } from "./activo-atributo-valor.keys"
import {
  createActivoAtributoValor,
  deleteActivoAtributoValor,
  updateActivoAtributoValor,
  type ActivoAtributoValor,
  type ActivoAtributoValorPayload,
} from "./activo-atributo-valor.service"

const activoAtributoValorMutations = createCrudMutations<
  ActivoAtributoValor,
  ActivoAtributoValorPayload
>({
  keys: activoAtributoValorKeys,
  service: {
    create: createActivoAtributoValor,
    update: updateActivoAtributoValor,
    remove: deleteActivoAtributoValor,
  },
  messages: {
    created: "Valor de atributo guardado correctamente",
    updated: "Valor de atributo actualizado correctamente",
    deleted: "Valor de atributo eliminado correctamente",
  },
})

export const useCreateActivoAtributoValor =
  activoAtributoValorMutations.useCreate
export const useUpdateActivoAtributoValor =
  activoAtributoValorMutations.useUpdate
export const useDeleteActivoAtributoValor =
  activoAtributoValorMutations.useDelete
