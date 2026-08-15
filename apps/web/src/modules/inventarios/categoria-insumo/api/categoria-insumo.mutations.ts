import { createCrudMutations } from "@/shared/api"

import { categoriaInsumoKeys } from "./categoria-insumo.keys"
import {
  createCategoriaInsumo,
  deleteCategoriaInsumo,
  updateCategoriaInsumo,
  type CategoriaInsumo,
  type CategoriaInsumoPayload,
} from "./categoria-insumo.service"

const mutations = createCrudMutations<CategoriaInsumo, CategoriaInsumoPayload>({
  keys: categoriaInsumoKeys,
  service: {
    create: createCategoriaInsumo,
    update: updateCategoriaInsumo,
    remove: deleteCategoriaInsumo,
  },
  messages: {
    created: "Categoría de insumo creada exitosamente",
    updated: "Categoría de insumo actualizada exitosamente",
    deleted: "Categoría de insumo eliminada exitosamente",
  },
})

export const useCreateCategoriaInsumo = mutations.useCreate
export const useUpdateCategoriaInsumo = mutations.useUpdate
export const useDeleteCategoriaInsumo = mutations.useDelete
