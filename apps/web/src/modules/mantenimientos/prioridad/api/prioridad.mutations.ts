import { createCrudMutations } from "@/shared/api"

import { prioridadKeys } from "./prioridad.keys"
import {
  createPrioridad,
  deletePrioridad,
  updatePrioridad,
  type Prioridad,
  type PrioridadPayload,
} from "./prioridad.service"

const prioridadMutations = createCrudMutations<Prioridad, PrioridadPayload>({
  keys: prioridadKeys,
  service: {
    create: createPrioridad,
    update: updatePrioridad,
    remove: deletePrioridad,
  },
  messages: {
    created: "Prioridad creada correctamente",
    updated: "Prioridad actualizada correctamente",
    deleted: "Prioridad eliminada correctamente",
  },
})

export const useCreatePrioridad = prioridadMutations.useCreate
export const useUpdatePrioridad = prioridadMutations.useUpdate
export const useDeletePrioridad = prioridadMutations.useDelete
