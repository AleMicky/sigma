import { createCrudMutations } from "@/shared/api"

import { categoriaKeys } from "./categoria.keys"
import {
  createCategoria,
  deleteCategoria,
  updateCategoria,
  type Categoria,
  type CategoriaPayload,
} from "./categoria.service"

const categoriaMutations = createCrudMutations<Categoria, CategoriaPayload>({
  keys: categoriaKeys,
  service: {
    create: createCategoria,
    update: updateCategoria,
    remove: deleteCategoria,
  },
  messages: {
    created: "Categoría creada correctamente",
    updated: "Categoría actualizada correctamente",
    deleted: "Categoría eliminada correctamente",
  },
})

export const useCreateCategoria = categoriaMutations.useCreate
export const useUpdateCategoria = categoriaMutations.useUpdate
export const useDeleteCategoria = categoriaMutations.useDelete
