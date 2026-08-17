import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { activoAccesorioKeys } from "./activo-accesorio.keys"
import {
  createActivoAccesorio,
  deleteActivoAccesorio,
  updateActivoAccesorio,
  type ActivoAccesorioPayload,
} from "./activo-accesorio.service"

export function useCreateActivoAccesorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ActivoAccesorioPayload) =>
      createActivoAccesorio(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: activoAccesorioKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoAccesorioKeys.byActivo(variables.activoId),
      })
      toast.success("Accesorio asignado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateActivoAccesorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActivoAccesorioPayload
    }) => updateActivoAccesorio(id, payload),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoAccesorioKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoAccesorioKeys.detail(entity.id),
      })
      if (entity.activo?.id) {
        void queryClient.invalidateQueries({
          queryKey: activoAccesorioKeys.byActivo(entity.activo.id),
        })
      }
      toast.success("Asignación de accesorio actualizada")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteActivoAccesorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; activoId?: string }) =>
      deleteActivoAccesorio(id),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: activoAccesorioKeys.all })
      if (variables.activoId) {
        void queryClient.invalidateQueries({
          queryKey: activoAccesorioKeys.byActivo(variables.activoId),
        })
      }
      toast.success("Accesorio desvinculado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
