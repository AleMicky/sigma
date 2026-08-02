import { createCrudMutations } from "@/shared/api"

import { catalogoKeys } from "./catalogo.keys"
import {
  createCatalogo,
  deleteCatalogo,
  updateCatalogo,
  type Catalogo,
  type CatalogoPayload,
} from "./catalogo.service"

const catalogoMutations = createCrudMutations<Catalogo, CatalogoPayload>({
  keys: catalogoKeys,
  service: {
    create: createCatalogo,
    update: updateCatalogo,
    remove: deleteCatalogo,
  },
  messages: {
    created: "Catálogo creado correctamente",
    updated: "Catálogo actualizado correctamente",
    deleted: "Catálogo eliminado correctamente",
  },
})

export const useCreateCatalogo = catalogoMutations.useCreate
export const useUpdateCatalogo = catalogoMutations.useUpdate
export const useDeleteCatalogo = catalogoMutations.useDelete
