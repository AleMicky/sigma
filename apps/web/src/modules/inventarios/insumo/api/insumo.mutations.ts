import { createCrudMutations } from "@/shared/api"

import { insumoKeys } from "./insumo.keys"
import {
  createInsumo,
  deleteInsumo,
  updateInsumo,
  type Insumo,
  type InsumoPayload,
} from "./insumo.service"

const mutations = createCrudMutations<Insumo, InsumoPayload>({
  keys: insumoKeys,
  service: {
    create: createInsumo,
    update: updateInsumo,
    remove: deleteInsumo,
  },
  messages: {
    created: "Insumo creado exitosamente",
    updated: "Insumo actualizado exitosamente",
    deleted: "Insumo eliminado exitosamente",
  },
})

export const useCreateInsumo = mutations.useCreate
export const useUpdateInsumo = mutations.useUpdate
export const useDeleteInsumo = mutations.useDelete
