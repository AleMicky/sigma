import { createCrudMutations } from "@/shared/api"

import { accesorioKeys } from "./accesorio.keys"
import {
  createAccesorio,
  deleteAccesorio,
  updateAccesorio,
  type Accesorio,
  type AccesorioPayload,
} from "./accesorio.service"

const accesorioMutations = createCrudMutations<
  Accesorio,
  AccesorioPayload
>({
  keys: accesorioKeys,
  service: {
    create: createAccesorio,
    update: updateAccesorio,
    remove: deleteAccesorio,
  },
  messages: {
    created: "Accesorio creado correctamente",
    updated: "Accesorio actualizado correctamente",
    deleted: "Accesorio eliminado correctamente",
  },
})

export const useCreateAccesorio = accesorioMutations.useCreate
export const useUpdateAccesorio = accesorioMutations.useUpdate
export const useDeleteAccesorio = accesorioMutations.useDelete
