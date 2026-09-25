import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"

import { tipoSolicitudVehicularKeys } from "./tipo-solicitud.keys"
import {
  createTipoSolicitudVehicular,
  deleteTipoSolicitudVehicular,
  updateTipoSolicitudVehicular,
  type TipoSolicitudVehicularPayload,
  type TipoSolicitudVehicularUpdatePayload,
} from "./tipo-solicitud.service"

export function useCreateTipoSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TipoSolicitudVehicularPayload) =>
      createTipoSolicitudVehicular(payload),
    onSuccess: () => {
      toast.success("Tipo de solicitud vehicular creado correctamente")
      queryClient.invalidateQueries({ queryKey: tipoSolicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al crear tipo de solicitud vehicular"
      )
    },
  })
}

export function useUpdateTipoSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: TipoSolicitudVehicularUpdatePayload
    }) => updateTipoSolicitudVehicular(id, payload),
    onSuccess: () => {
      toast.success("Tipo de solicitud vehicular actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: tipoSolicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al actualizar tipo de solicitud vehicular"
      )
    },
  })
}

export function useDeleteTipoSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTipoSolicitudVehicular(id),
    onSuccess: () => {
      toast.success("Tipo de solicitud vehicular eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: tipoSolicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al eliminar tipo de solicitud vehicular"
      )
    },
  })
}
