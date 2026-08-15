import { createCrudMutations } from "@/shared/api"

import { insumoAtributoValorKeys } from "./insumo-atributo-valor.keys"
import {
  createInsumoAtributoValor,
  deleteInsumoAtributoValor,
  updateInsumoAtributoValor,
  type InsumoAtributoValor,
  type InsumoAtributoValorPayload,
} from "./insumo-atributo-valor.service"

const mutations = createCrudMutations<
  InsumoAtributoValor,
  InsumoAtributoValorPayload
>({
  keys: insumoAtributoValorKeys,
  service: {
    create: createInsumoAtributoValor,
    update: updateInsumoAtributoValor,
    remove: deleteInsumoAtributoValor,
  },
  messages: {
    created: "Valor de atributo guardado exitosamente",
    updated: "Valor de atributo actualizado exitosamente",
    deleted: "Valor de atributo eliminado exitosamente",
  },
})

export const useCreateInsumoAtributoValor = mutations.useCreate
export const useUpdateInsumoAtributoValor = mutations.useUpdate
export const useDeleteInsumoAtributoValor = mutations.useDelete
