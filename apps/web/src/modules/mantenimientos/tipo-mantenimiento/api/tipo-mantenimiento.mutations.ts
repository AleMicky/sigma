import { createCrudMutations } from "@/shared/api"

import { tipoMantenimientoKeys } from "./tipo-mantenimiento.keys"
import {
  createTipoMantenimiento,
  deleteTipoMantenimiento,
  updateTipoMantenimiento,
  type TipoMantenimiento,
  type TipoMantenimientoPayload,
} from "./tipo-mantenimiento.service"

const tipoMantenimientoMutations = createCrudMutations<TipoMantenimiento, TipoMantenimientoPayload>({
  keys: tipoMantenimientoKeys,
  service: {
    create: createTipoMantenimiento,
    update: updateTipoMantenimiento,
    remove: deleteTipoMantenimiento,
  },
  messages: {
    created: "Tipo de mantenimiento creado correctamente",
    updated: "Tipo de mantenimiento actualizado correctamente",
    deleted: "Tipo de mantenimiento eliminado correctamente",
  },
})

export const useCreateTipoMantenimiento = tipoMantenimientoMutations.useCreate
export const useUpdateTipoMantenimiento = tipoMantenimientoMutations.useUpdate
export const useDeleteTipoMantenimiento = tipoMantenimientoMutations.useDelete
