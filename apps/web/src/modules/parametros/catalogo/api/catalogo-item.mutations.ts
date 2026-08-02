import { createCrudMutations } from "@/shared/api"

import { catalogoItemKeys } from "./catalogo-item.keys"
import {
  createCatalogoItem,
  deleteCatalogoItem,
  updateCatalogoItem,
  type CatalogoItem,
  type CatalogoItemPayload,
} from "./catalogo-item.service"

const catalogoItemMutations = createCrudMutations<
  CatalogoItem,
  CatalogoItemPayload
>({
  keys: catalogoItemKeys,
  service: {
    create: createCatalogoItem,
    update: updateCatalogoItem,
    remove: deleteCatalogoItem,
  },
  messages: {
    created: "Valor creado correctamente",
    updated: "Valor actualizado correctamente",
    deleted: "Valor eliminado correctamente",
  },
})

export const useCreateCatalogoItem = catalogoItemMutations.useCreate
export const useUpdateCatalogoItem = catalogoItemMutations.useUpdate
export const useDeleteCatalogoItem = catalogoItemMutations.useDelete
