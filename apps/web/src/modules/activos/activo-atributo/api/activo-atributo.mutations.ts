import { createCrudMutations } from "@/shared/api"

import { activoAtributoKeys } from "./activo-atributo.keys"
import {
  createActivoAtributo,
  deleteActivoAtributo,
  updateActivoAtributo,
  type ActivoAtributo,
  type ActivoAtributoPayload,
} from "./activo-atributo.service"

const activoAtributoMutations = createCrudMutations<
  ActivoAtributo,
  ActivoAtributoPayload
>({
  keys: activoAtributoKeys,
  service: {
    create: createActivoAtributo,
    update: updateActivoAtributo,
    remove: deleteActivoAtributo,
  },
  messages: {
    created: "Atributo creado correctamente",
    updated: "Atributo actualizado correctamente",
    deleted: "Atributo eliminado correctamente",
  },
})

export const useCreateActivoAtributo = activoAtributoMutations.useCreate
export const useUpdateActivoAtributo = activoAtributoMutations.useUpdate
export const useDeleteActivoAtributo = activoAtributoMutations.useDelete
