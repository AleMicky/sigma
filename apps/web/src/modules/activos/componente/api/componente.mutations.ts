import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudMutations, getErrorMessage } from "@/shared/api"

import { componenteKeys } from "./componente.keys"
import {
  createComponente,
  deleteComponente,
  setActivoComponente,
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

export function useSetActivoComponente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      setActivoComponente(id, activo),
    onSuccess: (_, { activo }) => {
      void queryClient.invalidateQueries({ queryKey: componenteKeys.all })
      toast.success(
        activo
          ? "Componente activado correctamente"
          : "Componente desactivado correctamente",
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

