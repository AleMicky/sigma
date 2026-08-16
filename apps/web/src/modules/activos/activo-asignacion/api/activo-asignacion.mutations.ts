import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { activoAsignacionKeys } from "./activo-asignacion.keys"
import {
  createActivoAsignacion,
  deleteActivoAsignacion,
  updateActivoAsignacion,
  type ActivoAsignacionPayload,
} from "./activo-asignacion.service"

export function useCreateActivoAsignacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ActivoAsignacionPayload) =>
      createActivoAsignacion(payload),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoAsignacionKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoAsignacionKeys.byActivo(entity.activoId),
      })
      toast.success("Asignación registrada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateActivoAsignacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActivoAsignacionPayload
    }) => updateActivoAsignacion(id, payload),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoAsignacionKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoAsignacionKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: activoAsignacionKeys.byActivo(entity.activoId),
      })
      toast.success("Asignación actualizada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteActivoAsignacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; activoId?: string }) =>
      deleteActivoAsignacion(id),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: activoAsignacionKeys.all })
      if (variables.activoId) {
        void queryClient.invalidateQueries({
          queryKey: activoAsignacionKeys.byActivo(variables.activoId),
        })
      }
      toast.success("Asignación eliminada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
