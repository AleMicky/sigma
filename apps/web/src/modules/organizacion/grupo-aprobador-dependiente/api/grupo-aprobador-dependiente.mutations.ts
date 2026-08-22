import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"

import { grupoAprobadorDependienteKeys } from "./grupo-aprobador-dependiente.keys"
import {
  createGrupoAprobadorDependiente,
  deleteGrupoAprobadorDependiente,
  type GrupoAprobadorDependientePayload,
  updateGrupoAprobadorDependiente,
} from "./grupo-aprobador-dependiente.service"

export function useCreateGrupoAprobadorDependiente(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GrupoAprobadorDependientePayload) =>
      createGrupoAprobadorDependiente(grupoAprobadorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDependienteKeys.lists(),
      })
      toast.success("Dependiente agregado correctamente")
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al agregar dependiente al grupo",
      )
    },
  })
}

export function useUpdateGrupoAprobadorDependiente(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: GrupoAprobadorDependientePayload
    }) => updateGrupoAprobadorDependiente(grupoAprobadorId, id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDependienteKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDependienteKeys.detail(
          grupoAprobadorId,
          variables.id,
        ),
      })
      toast.success("Dependiente actualizado correctamente")
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al actualizar dependiente del grupo",
      )
    },
  })
}

export function useDeleteGrupoAprobadorDependiente(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      deleteGrupoAprobadorDependiente(grupoAprobadorId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDependienteKeys.lists(),
      })
      toast.success("Dependiente eliminado del grupo")
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al eliminar dependiente del grupo",
      )
    },
  })
}
