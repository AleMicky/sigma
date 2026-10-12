import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"

import { cargaCombustibleKeys } from "./carga-combustible.keys"
import {
  createCargaCombustible,
  deleteCargaCombustible,
  updateCargaCombustible,
  type CargaCombustiblePayload,
  type CargaCombustibleUpdatePayload,
} from "./carga-combustible.service"

export function useCreateCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CargaCombustiblePayload) =>
      createCargaCombustible(payload),
    onSuccess: () => {
      toast.success("Carga de combustible registrada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al registrar la carga de combustible"
      )
    },
  })
}

export function useUpdateCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CargaCombustibleUpdatePayload
    }) => updateCargaCombustible(id, payload),
    onSuccess: () => {
      toast.success("Carga de combustible actualizada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al actualizar la carga de combustible"
      )
    },
  })
}

export function useDeleteCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCargaCombustible(id),
    onSuccess: () => {
      toast.success("Carga de combustible eliminada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al eliminar la carga de combustible"
      )
    },
  })
}
