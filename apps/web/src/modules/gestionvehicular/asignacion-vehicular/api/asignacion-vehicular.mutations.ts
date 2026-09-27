import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { asignacionVehicularKeys } from "./asignacion-vehicular.keys"
import {
  createAsignacionVehicular,
  deleteAsignacionVehicular,
  updateAsignacionVehicular,
  type AsignacionVehicularPayload,
  type AsignacionVehicularUpdatePayload,
} from "./asignacion-vehicular.service"
import { solicitudVehicularKeys } from "../../solicitud/api/solicitud-vehicular.keys"

export const useCreateAsignacionVehicular = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AsignacionVehicularPayload) =>
      createAsignacionVehicular(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: asignacionVehicularKeys.all,
      })
      if (variables.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: asignacionVehicularKeys.bySolicitud(variables.solicitudVehicularId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: solicitudVehicularKeys.all,
      })
      toast.success("Asignación vehicular registrada correctamente")
    },
    onError: () => {
      toast.error("Error al registrar la asignación vehicular")
    },
  })
}

export const useUpdateAsignacionVehicular = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AsignacionVehicularUpdatePayload
    }) => updateAsignacionVehicular(id, payload),
    onSuccess: (_, { id, payload }) => {
      queryClient.invalidateQueries({
        queryKey: asignacionVehicularKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: asignacionVehicularKeys.detail(id),
      })
      if (payload.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: asignacionVehicularKeys.bySolicitud(payload.solicitudVehicularId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: solicitudVehicularKeys.all,
      })
      toast.success("Asignación vehicular actualizada correctamente")
    },
    onError: () => {
      toast.error("Error al actualizar la asignación vehicular")
    },
  })
}

export const useDeleteAsignacionVehicular = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAsignacionVehicular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: asignacionVehicularKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: solicitudVehicularKeys.all,
      })
      toast.success("Asignación vehicular eliminada correctamente")
    },
    onError: () => {
      toast.error("Error al eliminar la asignación vehicular")
    },
  })
}
