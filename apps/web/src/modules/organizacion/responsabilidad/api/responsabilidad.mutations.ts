import { createCrudMutations } from "@/shared/api"

import { responsabilidadKeys } from "./responsabilidad.keys"
import {
  createResponsabilidad,
  deleteResponsabilidad,
  updateResponsabilidad,
  type Responsabilidad,
  type ResponsabilidadPayload,
} from "./responsabilidad.service"

const responsabilidadMutations = createCrudMutations<
  Responsabilidad,
  ResponsabilidadPayload
>({
  keys: responsabilidadKeys,
  service: {
    create: createResponsabilidad,
    update: updateResponsabilidad,
    remove: deleteResponsabilidad,
  },
  messages: {
    created: "Responsabilidad creada correctamente",
    updated: "Responsabilidad actualizada correctamente",
    deleted: "Responsabilidad eliminada correctamente",
  },
})

export const useCreateResponsabilidad = responsabilidadMutations.useCreate
export const useUpdateResponsabilidad = responsabilidadMutations.useUpdate
export const useDeleteResponsabilidad = responsabilidadMutations.useDelete
