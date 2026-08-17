import { createCrudMutations } from "@/shared/api"

import { actividadKeys } from "./actividad.keys"
import {
  createActividad,
  deleteActividad,
  updateActividad,
  type ActividadMantenimiento,
  type ActividadMantenimientoPayload,
} from "./actividad.service"

const actividadMutations = createCrudMutations<
  ActividadMantenimiento,
  ActividadMantenimientoPayload
>({
  keys: actividadKeys,
  service: {
    create: createActividad,
    update: updateActividad,
    remove: deleteActividad,
  },
  messages: {
    created: "Actividad de mantenimiento creada correctamente",
    updated: "Actividad de mantenimiento actualizada correctamente",
    deleted: "Actividad de mantenimiento eliminada correctamente",
  },
})

export const useCreateActividad = actividadMutations.useCreate
export const useUpdateActividad = actividadMutations.useUpdate
export const useDeleteActividad = actividadMutations.useDelete
