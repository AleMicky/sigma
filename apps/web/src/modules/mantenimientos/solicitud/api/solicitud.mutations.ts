import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { workflowKeys, type CompleteWorkflowTaskPayload } from "@/modules/workflow"
import { getErrorMessage } from "@/shared/api"
import { solicitudKeys } from "./solicitud.keys"
import {
  completarWorkflowSolicitud,
  createSolicitud,
  deleteSolicitud,
  updateSolicitud,
  type SolicitudMantenimientoPayload,
} from "./solicitud.service"

/**
 * Mutation hook para crear una nueva solicitud de mantenimiento sin archivos o con payload directo.
 */
export function useCreateSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      args:
        | SolicitudMantenimientoPayload
        | { payload: SolicitudMantenimientoPayload; files?: File[] },
    ) => {
      if ("payload" in args) {
        return createSolicitud(args.payload, args.files)
      }
      return createSolicitud(args)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success(
        data.numero
          ? `Solicitud ${data.numero} registrada correctamente`
          : "Solicitud registrada correctamente",
      )
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al registrar la solicitud de mantenimiento")
    },
  })
}

/**
 * Mutation hook para crear una nueva solicitud de mantenimiento con archivos adjuntos.
 */
export function useCreateSolicitudWithFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      files,
    }: {
      payload: SolicitudMantenimientoPayload
      files?: File[]
    }) => createSolicitud(payload, files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success(
        data.numero
          ? `Solicitud ${data.numero} registrada correctamente`
          : "Solicitud registrada correctamente",
      )
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al registrar la solicitud de mantenimiento")
    },
  })
}

/**
 * Mutation hook para actualizar una solicitud de mantenimiento existente.
 */
export function useUpdateSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: SolicitudMantenimientoPayload
    }) => updateSolicitud(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success(
        data.numero
          ? `Solicitud ${data.numero} actualizada correctamente`
          : "Solicitud actualizada correctamente",
      )
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al actualizar la solicitud de mantenimiento")
    },
  })
}

/**
 * Mutation hook para eliminar una solicitud de mantenimiento.
 */
export function useDeleteSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSolicitud(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      toast.success("Solicitud eliminada correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al eliminar la solicitud")
    },
  })
}

export type CompletarWorkflowSolicitudVariables = {
  id: string
  payload: CompleteWorkflowTaskPayload
}

/**
 * Mutation hook para completar una tarea de workflow sobre una solicitud de mantenimiento.
 */
export function useCompletarWorkflowSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: CompletarWorkflowSolicitudVariables) =>
      completarWorkflowSolicitud(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: solicitudKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
      toast.success(
        data.numero
          ? `Acción completada para solicitud ${data.numero}`
          : "Acción de workflow completada correctamente",
      )
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err) || "Error al completar la acción de workflow de la solicitud",
      )
    },
  })
}

