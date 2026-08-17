import { createCrudMutations } from "@/shared/api"

import { solicitudKeys } from "./solicitud.keys"
import {
  createSolicitud,
  deleteSolicitud,
  updateSolicitud,
  type SolicitudMantenimiento,
  type SolicitudPayload,
} from "./solicitud.service"

const solicitudMutations = createCrudMutations<
  SolicitudMantenimiento,
  SolicitudPayload
>({
  keys: solicitudKeys,
  service: {
    create: createSolicitud,
    update: updateSolicitud,
    remove: deleteSolicitud,
  },
  messages: {
    created: "Solicitud creada correctamente",
    updated: "Solicitud actualizada correctamente",
    deleted: "Solicitud eliminada correctamente",
  },
})

export const useCreateSolicitud = solicitudMutations.useCreate
export const useUpdateSolicitud = solicitudMutations.useUpdate
export const useDeleteSolicitud = solicitudMutations.useDelete
