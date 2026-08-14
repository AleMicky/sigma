import { createCrudMutations } from "@/shared/api"

import { ubicacionKeys } from "./ubicacion.keys"
import {
  createUbicacion,
  deleteUbicacion,
  updateUbicacion,
  type Ubicacion,
  type UbicacionPayload,
} from "./ubicacion.service"

const ubicacionMutations = createCrudMutations<Ubicacion, UbicacionPayload>({
  keys: ubicacionKeys,
  service: {
    create: createUbicacion,
    update: updateUbicacion,
    remove: deleteUbicacion,
  },
  messages: {
    created: "Ubicación creada correctamente",
    updated: "Ubicación actualizada correctamente",
    deleted: "Ubicación eliminada correctamente",
  },
})

export const useCreateUbicacion = ubicacionMutations.useCreate
export const useUpdateUbicacion = ubicacionMutations.useUpdate
export const useDeleteUbicacion = ubicacionMutations.useDelete
