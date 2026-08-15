import { createCrudMutations } from "@/shared/api"

import { tipoInsumoKeys } from "./tipo-insumo.keys"
import {
  createTipoInsumo,
  deleteTipoInsumo,
  updateTipoInsumo,
  type TipoInsumo,
  type TipoInsumoPayload,
} from "./tipo-insumo.service"

const mutations = createCrudMutations<TipoInsumo, TipoInsumoPayload>({
  keys: tipoInsumoKeys,
  service: {
    create: createTipoInsumo,
    update: updateTipoInsumo,
    remove: deleteTipoInsumo,
  },
  messages: {
    created: "Tipo de insumo creado exitosamente",
    updated: "Tipo de insumo actualizado exitosamente",
    deleted: "Tipo de insumo eliminado exitosamente",
  },
})

export const useCreateTipoInsumo = mutations.useCreate
export const useUpdateTipoInsumo = mutations.useUpdate
export const useDeleteTipoInsumo = mutations.useDelete
