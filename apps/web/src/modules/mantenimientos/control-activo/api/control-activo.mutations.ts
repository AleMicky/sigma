import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { controlActivoKeys } from "./control-activo.keys"
import {
  type ControlActivo,
  type ControlActivoDetallePayload,
  type ControlActivoPayload,
  createControlActivo,
  createControlActivoDetalle,
  deleteControlActivo,
  deleteControlActivoDetalle,
  listControlActivoDetalles,
  updateControlActivo,
  updateControlActivoDetalle,
} from "./control-activo.service"

export type CreateControlActivoWithDetallesPayload = {
  control: ControlActivoPayload
  detalles: Omit<ControlActivoDetallePayload, "controlActivoId">[]
}

export function useCreateControlActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createControlActivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.lists() })
      toast.success("Control de activo registrado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCreateControlActivoWithDetalles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      control,
      detalles,
    }: CreateControlActivoWithDetallesPayload): Promise<ControlActivo> => {
      // 1. Crear cabecera de ControlActivo
      const nuevoControl = await createControlActivo(control)

      // 2. Si hay detalles/accesorios, crearlos en paralelo asociados al nuevo control
      if (detalles && detalles.length > 0) {
        await Promise.all(
          detalles.map((det) =>
            createControlActivoDetalle({
              ...det,
              controlActivoId: nuevoControl.id,
            }),
          ),
        )
      }

      return nuevoControl
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.lists(),
      })
      toast.success(
        `Acta de ${data.tipo === "ENTREGA" ? "Entrega" : "Devolución"} guardada exitosamente`,
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export type UpdateControlActivoWithDetallesPayload = {
  id: string
  control: ControlActivoPayload
  detalles: Omit<ControlActivoDetallePayload, "controlActivoId">[]
}

export function useUpdateControlActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ControlActivoPayload
    }) => updateControlActivo(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.detail(id) })
      toast.success("Control de activo actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateControlActivoWithDetalles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      control,
      detalles,
    }: UpdateControlActivoWithDetallesPayload): Promise<ControlActivo> => {
      // 1. Actualizar cabecera de ControlActivo
      const updatedControl = await updateControlActivo(id, control)

      // 2. Obtener detalles existentes y reemplazarlos con los nuevos
      try {
        const existingResponse = await listControlActivoDetalles({
          controlActivoId: id,
          size: 100,
        })
        const existingList = existingResponse.content ?? []
        if (existingList.length > 0) {
          await Promise.all(
            existingList.map((d) => deleteControlActivoDetalle(d.id)),
          )
        }
      } catch {
        // En caso de error al listar anteriores, continuar con la creación
      }

      // 3. Crear los nuevos detalles asociados
      if (detalles && detalles.length > 0) {
        await Promise.all(
          detalles.map((det) =>
            createControlActivoDetalle({
              ...det,
              controlActivoId: id,
            }),
          ),
        )
      }

      return updatedControl
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.detail(id) })
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.lists(),
      })
      toast.success(
        `Acta de ${data.tipo === "ENTREGA" ? "Entrega" : "Devolución"} actualizada exitosamente`,
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteControlActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteControlActivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlActivoKeys.lists() })
      toast.success("Control de activo eliminado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCreateControlActivoDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createControlActivoDetalle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.lists(),
      })
      toast.success("Detalle agregado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateControlActivoDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ControlActivoDetallePayload
    }) => updateControlActivoDetalle(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.detail(id),
      })
      toast.success("Detalle actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteControlActivoDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteControlActivoDetalle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controlActivoKeys.detalles.lists(),
      })
      toast.success("Detalle eliminado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
