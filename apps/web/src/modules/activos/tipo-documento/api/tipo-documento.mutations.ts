import { createCrudMutations } from "@/shared/api"

import { tipoDocumentoKeys } from "./tipo-documento.keys"
import {
  createTipoDocumento,
  deleteTipoDocumento,
  updateTipoDocumento,
  type TipoDocumento,
  type TipoDocumentoPayload,
} from "./tipo-documento.service"

const tipoDocumentoMutations = createCrudMutations<TipoDocumento, TipoDocumentoPayload>({
  keys: tipoDocumentoKeys,
  service: {
    create: createTipoDocumento,
    update: updateTipoDocumento,
    remove: deleteTipoDocumento,
  },
  messages: {
    created: "Tipo de documento creado correctamente",
    updated: "Tipo de documento actualizado correctamente",
    deleted: "Tipo de documento eliminado correctamente",
  },
})

export const useCreateTipoDocumento = tipoDocumentoMutations.useCreate
export const useUpdateTipoDocumento = tipoDocumentoMutations.useUpdate
export const useDeleteTipoDocumento = tipoDocumentoMutations.useDelete
