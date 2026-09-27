import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { conductorKeys } from "./conductor.keys"
import { conductorLicenciaKeys } from "./conductor-licencia.queries"
import {
  createLicencia,
  deleteLicencia,
  updateLicencia,
} from "./conductor-licencia.service"
import type { ConductorLicenciaPayload } from "./conductor.service"

export const useCreateLicencia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conductorId,
      payload,
      file,
    }: {
      conductorId: string
      payload: ConductorLicenciaPayload
      file?: File | null
    }) => createLicencia(conductorId, payload, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conductorLicenciaKeys.byConductor(variables.conductorId),
      })
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
      toast.success("Licencia de conducir registrada correctamente")
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar la licencia de conducir")
    },
  })
}

export const useUpdateLicencia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      file,
    }: {
      id: string
      conductorId: string
      payload: ConductorLicenciaPayload
      file?: File | null
    }) => updateLicencia(id, payload, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conductorLicenciaKeys.byConductor(variables.conductorId),
      })
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
      toast.success("Licencia de conducir actualizada correctamente")
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar la licencia de conducir")
    },
  })
}

export const useDeleteLicencia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; conductorId: string }) =>
      deleteLicencia(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conductorLicenciaKeys.byConductor(variables.conductorId),
      })
      queryClient.invalidateQueries({ queryKey: conductorKeys.all })
      toast.success("Licencia de conducir eliminada correctamente")
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar la licencia de conducir")
    },
  })
}
