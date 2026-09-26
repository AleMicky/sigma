import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"

import { solicitudVehicularKeys } from "./solicitud-vehicular.keys"
import {
  createSolicitudVehicular,
  createSolicitudVehicularWithFiles,
  deleteSolicitudVehicular,
  updateSolicitudVehicular,
  type SolicitudVehicularPayload,
  type SolicitudVehicularUpdatePayload,
} from "./solicitud-vehicular.service"

export function useCreateSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SolicitudVehicularPayload) =>
      createSolicitudVehicular(payload),
    onSuccess: () => {
      toast.success("Solicitud vehicular creada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al crear solicitud vehicular"
      )
    },
  })
}

export function useCreateSolicitudVehicularWithFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      files,
    }: {
      payload: SolicitudVehicularPayload
      files?: File[]
    }) => createSolicitudVehicularWithFiles(payload, files),
    onSuccess: () => {
      toast.success("Solicitud vehicular creada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al crear solicitud vehicular con adjuntos"
      )
    },
  })
}

export function useUpdateSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: SolicitudVehicularUpdatePayload
    }) => updateSolicitudVehicular(id, payload),
    onSuccess: () => {
      toast.success("Solicitud vehicular actualizada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al actualizar solicitud vehicular"
      )
    },
  })
}

export function useDeleteSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSolicitudVehicular(id),
    onSuccess: () => {
      toast.success("Solicitud vehicular eliminada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al eliminar solicitud vehicular"
      )
    },
  })
}
