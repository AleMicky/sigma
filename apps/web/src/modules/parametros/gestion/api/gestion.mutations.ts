import { createCrudMutations } from "@/shared/api"

import { gestionKeys } from "./gestion.keys"
import {
  createGestion,
  deleteGestion,
  updateGestion,
  type Gestion,
  type GestionPayload,
} from "./gestion.service"
import { periodoKeys } from "./periodo.keys"

const gestionMutations = createCrudMutations<Gestion, GestionPayload>({
  keys: gestionKeys,
  service: {
    create: createGestion,
    update: updateGestion,
    remove: deleteGestion,
  },
  messages: {
    created: "Gestión creada correctamente",
    updated: "Gestión actualizada correctamente",
    deleted: "Gestión eliminada correctamente",
  },
  invalidateKeys: [periodoKeys.all],
})

export const useCreateGestion = gestionMutations.useCreate
export const useUpdateGestion = gestionMutations.useUpdate
export const useDeleteGestion = gestionMutations.useDelete
