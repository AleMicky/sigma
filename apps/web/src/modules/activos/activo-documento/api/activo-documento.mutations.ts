import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { activoDocumentoKeys } from "./activo-documento.keys"
import {
  createActivoDocumentoWithFile,
  deleteActivoDocumento,
  replaceActivoDocumentoFile,
  updateActivoDocumento,
  type ActivoDocumentoPayload,
} from "./activo-documento.service"

export function useCreateActivoDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      file,
    }: {
      payload: ActivoDocumentoPayload
      file: File
    }) => createActivoDocumentoWithFile(payload, file),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: activoDocumentoKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoDocumentoKeys.byActivo(variables.payload.activoId),
      })
      toast.success("Documento adjuntado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateActivoDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActivoDocumentoPayload
    }) => updateActivoDocumento(id, payload),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoDocumentoKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoDocumentoKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: activoDocumentoKeys.byActivo(entity.activoId),
      })
      toast.success("Documento actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useReplaceActivoDocumentoFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      replaceActivoDocumentoFile(id, file),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoDocumentoKeys.all })
      void queryClient.invalidateQueries({
        queryKey: activoDocumentoKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: activoDocumentoKeys.byActivo(entity.activoId),
      })
      toast.success("Archivo del documento actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteActivoDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteActivoDocumento(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: activoDocumentoKeys.all })
      toast.success("Documento eliminado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
