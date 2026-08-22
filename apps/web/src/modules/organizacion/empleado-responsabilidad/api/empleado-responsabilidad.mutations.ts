import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { empleadoResponsabilidadKeys } from "./empleado-responsabilidad.keys"
import {
  createEmpleadoResponsabilidad,
  deleteEmpleadoResponsabilidad,
  updateEmpleadoResponsabilidad,
  type EmpleadoResponsabilidad,
  type EmpleadoResponsabilidadPayload,
} from "./empleado-responsabilidad.service"

export function useCreateEmpleadoResponsabilidad() {
  const queryClient = useQueryClient()

  return useMutation<
    EmpleadoResponsabilidad,
    Error,
    EmpleadoResponsabilidadPayload
  >({
    mutationFn: (payload) => createEmpleadoResponsabilidad(payload),
    onSuccess: () => {
      toast.success("Empleado asignado a la responsabilidad correctamente")
      queryClient.invalidateQueries({
        queryKey: empleadoResponsabilidadKeys.all,
      })
    },
  })
}

export function useUpdateEmpleadoResponsabilidad() {
  const queryClient = useQueryClient()

  return useMutation<
    EmpleadoResponsabilidad,
    Error,
    { id: string; payload: EmpleadoResponsabilidadPayload }
  >({
    mutationFn: ({ id, payload }) =>
      updateEmpleadoResponsabilidad(id, payload),
    onSuccess: () => {
      toast.success("Asignación de responsabilidad actualizada correctamente")
      queryClient.invalidateQueries({
        queryKey: empleadoResponsabilidadKeys.all,
      })
    },
  })
}

export function useDeleteEmpleadoResponsabilidad() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteEmpleadoResponsabilidad(id),
    onSuccess: () => {
      toast.success("Asignación de responsabilidad eliminada correctamente")
      queryClient.invalidateQueries({
        queryKey: empleadoResponsabilidadKeys.all,
      })
    },
  })
}
