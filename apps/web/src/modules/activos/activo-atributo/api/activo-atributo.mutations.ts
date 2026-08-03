import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudMutations, getErrorMessage } from "@/shared/api"

import { activoAtributoKeys } from "./activo-atributo.keys"
import {
  createActivoAtributo,
  deleteActivoAtributo,
  deleteActivoAtributoImagen,
  updateActivoAtributo,
  uploadActivoAtributoImagen,
  type ActivoAtributo,
  type ActivoAtributoPayload,
} from "./activo-atributo.service"

const activoAtributoMutations = createCrudMutations<
  ActivoAtributo,
  ActivoAtributoPayload
>({
  keys: activoAtributoKeys,
  service: {
    create: createActivoAtributo,
    update: updateActivoAtributo,
    remove: deleteActivoAtributo,
  },
  messages: {
    created: "Atributo creado correctamente",
    updated: "Atributo actualizado correctamente",
    deleted: "Atributo eliminado correctamente",
  },
})

export const useCreateActivoAtributo = activoAtributoMutations.useCreate
export const useUpdateActivoAtributo = activoAtributoMutations.useUpdate
export const useDeleteActivoAtributo = activoAtributoMutations.useDelete

export function useUploadActivoAtributoImagen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadActivoAtributoImagen(id, file),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({
        queryKey: activoAtributoKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: activoAtributoKeys.detail(entity.id),
      })
      toast.success("Imagen actualizada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteActivoAtributoImagen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteActivoAtributoImagen(id),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({
        queryKey: activoAtributoKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: activoAtributoKeys.detail(entity.id),
      })
      toast.success("Imagen eliminada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
