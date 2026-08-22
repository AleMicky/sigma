import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { grupoAprobadorDetalleKeys } from "./grupo-aprobador-detalle.keys"
import {
  createGrupoAprobadorDetalle,
  deleteGrupoAprobadorDetalle,
  updateGrupoAprobadorDetalle,
  type GrupoAprobadorDetalle,
  type GrupoAprobadorDetallePayload,
} from "./grupo-aprobador-detalle.service"

export function useCreateGrupoAprobadorDetalle(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    GrupoAprobadorDetalle,
    Error,
    GrupoAprobadorDetallePayload
  >({
    mutationFn: (payload) =>
      createGrupoAprobadorDetalle(grupoAprobadorId, payload),
    onSuccess: () => {
      toast.success("Aprobador agregado al grupo correctamente")
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDetalleKeys.all,
      })
    },
  })
}

export function useUpdateGrupoAprobadorDetalle(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    GrupoAprobadorDetalle,
    Error,
    { id: string; payload: GrupoAprobadorDetallePayload }
  >({
    mutationFn: ({ id, payload }) =>
      updateGrupoAprobadorDetalle(grupoAprobadorId, id, payload),
    onSuccess: () => {
      toast.success("Aprobador actualizado correctamente")
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDetalleKeys.all,
      })
    },
  })
}

export function useDeleteGrupoAprobadorDetalle(grupoAprobadorId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteGrupoAprobadorDetalle(grupoAprobadorId, id),
    onSuccess: () => {
      toast.success("Aprobador eliminado del grupo correctamente")
      queryClient.invalidateQueries({
        queryKey: grupoAprobadorDetalleKeys.all,
      })
    },
  })
}
