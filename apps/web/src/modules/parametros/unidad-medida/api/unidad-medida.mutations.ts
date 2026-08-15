import { createCrudMutations } from "@/shared/api"

import { unidadMedidaKeys } from "./unidad-medida.keys"
import {
  createUnidadMedida,
  deleteUnidadMedida,
  updateUnidadMedida,
  type UnidadMedida,
  type UnidadMedidaPayload,
} from "./unidad-medida.service"

const unidadMedidaMutations = createCrudMutations<
  UnidadMedida,
  UnidadMedidaPayload
>({
  keys: unidadMedidaKeys,
  service: {
    create: createUnidadMedida,
    update: updateUnidadMedida,
    remove: deleteUnidadMedida,
  },
  messages: {
    created: "Unidad de medida creada correctamente",
    updated: "Unidad de medida actualizada correctamente",
    deleted: "Unidad de medida eliminada correctamente",
  },
})

export const useCreateUnidadMedida = unidadMedidaMutations.useCreate
export const useUpdateUnidadMedida = unidadMedidaMutations.useUpdate
export const useDeleteUnidadMedida = unidadMedidaMutations.useDelete
