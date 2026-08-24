import { createCrudMutations } from "@/shared/api"

import { actividadAplicacionKeys } from "./actividad-aplicacion.keys"
import {
  createActividadAplicacion,
  deleteActividadAplicacion,
  updateActividadAplicacion,
  type ActividadAplicacion,
  type ActividadAplicacionPayload,
} from "./actividad-aplicacion.service"

const actividadAplicacionMutations = createCrudMutations<
  ActividadAplicacion,
  ActividadAplicacionPayload
>({
  keys: actividadAplicacionKeys,
  service: {
    create: createActividadAplicacion,
    update: updateActividadAplicacion,
    remove: deleteActividadAplicacion,
  },
  messages: {
    created: "Aplicación registrada correctamente",
    updated: "Aplicación actualizada correctamente",
    deleted: "Aplicación eliminada correctamente",
  },
  invalidateKeys: [actividadAplicacionKeys.all],
})

export const useCreateActividadAplicacion =
  actividadAplicacionMutations.useCreate
export const useUpdateActividadAplicacion =
  actividadAplicacionMutations.useUpdate
export const useDeleteActividadAplicacion =
  actividadAplicacionMutations.useDelete
