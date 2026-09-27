import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"
import { workflowKeys } from "@/modules/workflow/api/workflow.keys"

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
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
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
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
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
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
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
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
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

export function useEnviarSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: import("./solicitud-vehicular.service").EnviarSolicitudVehicularPayload
    }) =>
      import("./solicitud-vehicular.service").then((m) =>
        m.enviarSolicitudVehicular(id, payload)
      ),
    onSuccess: () => {
      toast.success("Solicitud vehicular enviada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al enviar la solicitud vehicular"
      )
    },
  })
}

export function useCompletarWorkflowSolicitudVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: import("./solicitud-vehicular.service").CompleteWorkflowTaskPayload
    }) =>
      import("./solicitud-vehicular.service").then((m) =>
        m.completarWorkflowSolicitudVehicular(id, payload)
      ),
    onSuccess: () => {
      toast.success("Tarea de flujo completada correctamente")
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al procesar la acción del flujo"
      )
    },
  })
}
