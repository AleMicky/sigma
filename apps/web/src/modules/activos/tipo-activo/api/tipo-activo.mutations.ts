import { createCrudMutations } from "@/shared/api"

import { tipoActivoKeys } from "./tipo-activo.keys"
import {
  createTipoActivo,
  deleteTipoActivo,
  updateTipoActivo,
  type TipoActivo,
  type TipoActivoPayload,
} from "./tipo-activo.service"

const tipoActivoMutations = createCrudMutations<TipoActivo, TipoActivoPayload>(
  {
    keys: tipoActivoKeys,
    service: {
      create: createTipoActivo,
      update: updateTipoActivo,
      remove: deleteTipoActivo,
    },
    messages: {
      created: "Tipo de activo creado correctamente",
      updated: "Tipo de activo actualizado correctamente",
      deleted: "Tipo de activo eliminado correctamente",
    },
  },
)

export const useCreateTipoActivo = tipoActivoMutations.useCreate
export const useUpdateTipoActivo = tipoActivoMutations.useUpdate
export const useDeleteTipoActivo = tipoActivoMutations.useDelete
