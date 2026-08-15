import { createCrudMutations } from "@/shared/api"

import { tipoInsumoAtributoKeys } from "./tipo-insumo-atributo.keys"
import {
  createTipoInsumoAtributo,
  deleteTipoInsumoAtributo,
  updateTipoInsumoAtributo,
  type TipoInsumoAtributo,
  type TipoInsumoAtributoPayload,
} from "./tipo-insumo-atributo.service"

const mutations = createCrudMutations<
  TipoInsumoAtributo,
  TipoInsumoAtributoPayload
>({
  keys: tipoInsumoAtributoKeys,
  service: {
    create: createTipoInsumoAtributo,
    update: updateTipoInsumoAtributo,
    remove: deleteTipoInsumoAtributo,
  },
  messages: {
    created: "Atributo de tipo de insumo creado exitosamente",
    updated: "Atributo de tipo de insumo actualizado exitosamente",
    deleted: "Atributo de tipo de insumo eliminado exitosamente",
  },
})

export const useCreateTipoInsumoAtributo = mutations.useCreate
export const useUpdateTipoInsumoAtributo = mutations.useUpdate
export const useDeleteTipoInsumoAtributo = mutations.useDelete
