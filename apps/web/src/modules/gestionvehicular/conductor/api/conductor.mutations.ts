import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"

import { conductorKeys } from "./conductor.keys"
import {
  createConductor,
  deleteConductor,
  updateConductor,
  type ConductorPayload,
  type ConductorUpdatePayload,
} from "./conductor.service"

export function useCreateConductor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ConductorPayload) => createConductor(payload),
    onSuccess: () => {
      toast.success("Conductor registrado correctamente")
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : "Error al registrar conductor"
      )
    },
  })
}

export function useUpdateConductor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConductorUpdatePayload }) =>
      updateConductor(id, payload),
    onSuccess: () => {
      toast.success("Conductor actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : "Error al actualizar conductor"
      )
    },
  })
}

export function useDeleteConductor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteConductor(id),
    onSuccess: () => {
      toast.success("Conductor eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : "Error al eliminar conductor"
      )
    },
  })
}
