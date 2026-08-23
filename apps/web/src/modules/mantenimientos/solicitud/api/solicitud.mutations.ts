import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudMutations, getErrorMessage } from "@/shared/api"

import { solicitudKeys } from "./solicitud.keys"
import {
  completeWorkflowTask,
  createAdjunto,
  createSolicitud,
  createSolicitudWithFiles,
  deleteAdjunto,
  deleteSolicitud,
  enviarSolicitud,
  updateSolicitud,
  type CompleteWorkflowTaskPayload,
  type SolicitudMantenimiento,
  type SolicitudPayload,
} from "./solicitud.service"

const solicitudCrudMutations = createCrudMutations<
  SolicitudMantenimiento,
  SolicitudPayload
>({
  keys: solicitudKeys,
  service: {
    create: createSolicitud,
    update: updateSolicitud,
    remove: deleteSolicitud,
  },
  messages: {
    created: "Solicitud creada correctamente",
    updated: "Solicitud actualizada correctamente",
    deleted: "Solicitud eliminada correctamente",
  },
})

export const useCreateSolicitud = solicitudCrudMutations.useCreate
export const useUpdateSolicitud = solicitudCrudMutations.useUpdate
export const useDeleteSolicitud = solicitudCrudMutations.useDelete

export function useCreateSolicitudWithFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      files,
    }: {
      payload: SolicitudPayload
      files?: File[] | null
    }) => createSolicitudWithFiles(payload, files),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success("Solicitud creada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCreateAdjunto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      solicitudId,
      file,
      descripcion,
    }: {
      solicitudId: string
      file: File
      descripcion?: string
    }) => createAdjunto(solicitudId, file, descripcion),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      void queryClient.invalidateQueries({
        queryKey: solicitudKeys.adjuntos(variables.solicitudId),
      })
      toast.success("Archivo adjuntado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteAdjunto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      solicitudId,
      adjuntoId,
    }: {
      solicitudId: string
      adjuntoId: string
    }) => deleteAdjunto(solicitudId, adjuntoId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      void queryClient.invalidateQueries({
        queryKey: solicitudKeys.adjuntos(variables.solicitudId),
      })
      toast.success("Adjunto eliminado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEnviarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => enviarSolicitud(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success("Solicitud enviada correctamente e iniciado el flujo de trabajo")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCompleteWorkflowTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      solicitudId,
      payload,
    }: {
      solicitudId: string
      payload: CompleteWorkflowTaskPayload
    }) => completeWorkflowTask(solicitudId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      void queryClient.invalidateQueries({
        queryKey: solicitudKeys.detail(variables.solicitudId),
      })
      toast.success("Acción de flujo de trabajo completada con éxito")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

