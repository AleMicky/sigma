import { createCrudMutations } from "@/shared/api"

import { tipoActivoEstadoKeys } from "./tipo-activo-estado.keys"
import {
  createTipoActivoEstado,
  deleteTipoActivoEstado,
  updateTipoActivoEstado,
  type TipoActivoEstado,
  type TipoActivoEstadoPayload,
} from "./tipo-activo-estado.service"

const tipoActivoEstadoMutations = createCrudMutations<
  TipoActivoEstado,
  TipoActivoEstadoPayload
>({
  keys: tipoActivoEstadoKeys,
  service: {
    create: createTipoActivoEstado,
    update: updateTipoActivoEstado,
    remove: deleteTipoActivoEstado,
  },
  messages: {
    created: "Estado asignado al tipo de activo correctamente",
    updated: "Asignación de estado actualizada correctamente",
    deleted: "Estado desasignado del tipo de activo correctamente",
  },
})

export const useCreateTipoActivoEstado = tipoActivoEstadoMutations.useCreate
export const useUpdateTipoActivoEstado = tipoActivoEstadoMutations.useUpdate
export const useDeleteTipoActivoEstado = tipoActivoEstadoMutations.useDelete
