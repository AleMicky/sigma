import { createCrudMutations } from "@/shared/api"

import { componenteKeys } from "./componente.keys"
import {
  createComponente,
  deleteComponente,
  updateComponente,
  type Componente,
  type ComponentePayload,
} from "./componente.service"

const componenteMutations = createCrudMutations<
  Componente,
  ComponentePayload
>({
  keys: componenteKeys,
  service: {
    create: createComponente,
    update: updateComponente,
    remove: deleteComponente,
  },
  messages: {
    created: "Componente creado correctamente",
    updated: "Componente actualizado correctamente",
    deleted: "Componente eliminado correctamente",
  },
})

export const useCreateComponente = componenteMutations.useCreate
export const useUpdateComponente = componenteMutations.useUpdate
export const useDeleteComponente = componenteMutations.useDelete
