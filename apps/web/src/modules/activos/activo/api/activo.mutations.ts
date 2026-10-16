import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudMutations, getErrorMessage } from "@/shared/api"

import { activoKeys } from "./activo.keys"
import {
  cambiarEstadoOperativoActivo,
  createActivo,
  deleteActivo,
  deleteActivoImagen,
  setActivoActivo,
  updateActivo,
  uploadActivoImagen,
  type Activo,
  type ActivoPayload,
  type CambiarEstadoOperativoPayload,
} from "./activo.service"

const activoMutations = createCrudMutations<Activo, ActivoPayload>({
  keys: activoKeys,
  service: {
    create: createActivo,
    update: updateActivo,
    remove: deleteActivo,
  },
  messages: {
    created: "Activo creado correctamente",
    updated: "Activo actualizado correctamente",
    deleted: "Activo eliminado correctamente",
  },
})

export const useCreateActivo = activoMutations.useCreate
export const useUpdateActivo = activoMutations.useUpdate
export const useDeleteActivo = activoMutations.useDelete

export function useUploadActivoImagen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadActivoImagen(id, file),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: activoKeys.detail(entity.id),
      })
      toast.success("Imagen actualizada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteActivoImagen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteActivoImagen(id),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: activoKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: activoKeys.detail(entity.id),
      })
      toast.success("Imagen eliminada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useSetActivoActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      setActivoActivo(id, activo),
    onSuccess: (_, { activo }) => {
      void queryClient.invalidateQueries({ queryKey: activoKeys.all })
      toast.success(
        activo
          ? "Activo dado de alta correctamente"
          : "Activo dado de baja correctamente",
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCambiarEstadoOperativoActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CambiarEstadoOperativoPayload
    }) => cambiarEstadoOperativoActivo(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: activoKeys.all })
      void queryClient.setQueryData(activoKeys.detail(data.id), data)
      toast.success(
        data.estadoOperativo?.nombre
          ? `Estado operativo cambiado a "${data.estadoOperativo.nombre}"`
          : "Estado operativo actualizado correctamente",
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
