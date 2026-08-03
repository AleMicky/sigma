import { createCrudMutations } from "@/shared/api"

import { areaKeys } from "./area.keys"
import {
  createArea,
  deleteArea,
  updateArea,
  type Area,
  type AreaPayload,
} from "./area.service"

const areaMutations = createCrudMutations<Area, AreaPayload>({
  keys: areaKeys,
  service: {
    create: createArea,
    update: updateArea,
    remove: deleteArea,
  },
  messages: {
    created: "Área creada correctamente",
    updated: "Área actualizada correctamente",
    deleted: "Área eliminada correctamente",
  },
})

export const useCreateArea = areaMutations.useCreate
export const useUpdateArea = areaMutations.useUpdate
export const useDeleteArea = areaMutations.useDelete
