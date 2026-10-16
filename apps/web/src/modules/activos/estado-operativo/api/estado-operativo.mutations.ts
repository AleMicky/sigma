import { createCrudMutations } from "@/shared/api"

import { estadoOperativoKeys } from "./estado-operativo.keys"
import {
  createEstadoOperativo,
  deleteEstadoOperativo,
  updateEstadoOperativo,
  type EstadoOperativo,
  type EstadoOperativoPayload,
} from "./estado-operativo.service"

const estadoOperativoMutations = createCrudMutations<
  EstadoOperativo,
  EstadoOperativoPayload
>({
  keys: estadoOperativoKeys,
  service: {
    create: createEstadoOperativo,
    update: updateEstadoOperativo,
    remove: deleteEstadoOperativo,
  },
  messages: {
    created: "Estado operativo creado correctamente",
    updated: "Estado operativo actualizado correctamente",
    deleted: "Estado operativo eliminado correctamente",
  },
})

export const useCreateEstadoOperativo = estadoOperativoMutations.useCreate
export const useUpdateEstadoOperativo = estadoOperativoMutations.useUpdate
export const useDeleteEstadoOperativo = estadoOperativoMutations.useDelete
