import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { workflowKeys } from "@/modules/workflow/api/workflow.keys"
import { solicitudVehicularKeys } from "../../solicitud/api/solicitud-vehicular.keys"
import { controlActivoVehicularKeys } from "./control-activo.keys"
import {
  createControlActivoVehicular,
  createControlActivoVehicularDetalle,
  deleteControlActivoVehicular,
  deleteControlActivoVehicularDetalle,
  updateControlActivoVehicular,
  updateControlActivoVehicularDetalle,
  type ControlActivoVehicularDetallePayload,
  type ControlActivoVehicularPayload,
} from "./control-activo.service"

export function useCreateControlActivoVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ControlActivoVehicularPayload) =>
      createControlActivoVehicular(payload),
    onSuccess: (data) => {
      toast.success("Control de activo vehicular creado exitosamente")
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
      if (data.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: controlActivoVehicularKeys.bySolicitud(
            data.solicitudVehicularId
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el control de activo")
    },
  })
}

export function useCreateControlActivoVehicularWithDetalles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      control,
      detalles,
    }: {
      control: ControlActivoVehicularPayload
      detalles: Omit<ControlActivoVehicularDetallePayload, "controlActivoId">[]
    }) => {
      const payload: ControlActivoVehicularPayload = {
        ...control,
        detalles,
      }
      return createControlActivoVehicular(payload)
    },
    onSuccess: (data) => {
      toast.success(
        `Acta de ${data.tipo === "ENTREGA" ? "Entrega" : "Devolución"} guardada exitosamente`
      )
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
      if (data.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: controlActivoVehicularKeys.bySolicitud(
            data.solicitudVehicularId
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el control de activo")
    },
  })
}

export function useUpdateControlActivoVehicularWithDetalles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      control,
      detalles,
    }: {
      id: string
      control: ControlActivoVehicularPayload
      detalles: Omit<ControlActivoVehicularDetallePayload, "controlActivoId">[]
    }) => {
      const payload: ControlActivoVehicularPayload = {
        ...control,
        detalles,
      }
      return updateControlActivoVehicular(id, payload)
    },
    onSuccess: (data) => {
      toast.success("Control de activo actualizado exitosamente")
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
      if (data.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: controlActivoVehicularKeys.bySolicitud(
            data.solicitudVehicularId
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Error al actualizar el control de activo vehicular"
      )
    },
  })
}

export function useUpdateControlActivoVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ControlActivoVehicularPayload
    }) => updateControlActivoVehicular(id, payload),
    onSuccess: (data) => {
      toast.success("Control de activo vehicular actualizado exitosamente")
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
      if (data.solicitudVehicularId) {
        queryClient.invalidateQueries({
          queryKey: controlActivoVehicularKeys.bySolicitud(
            data.solicitudVehicularId
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el control de activo")
    },
  })
}

export function useDeleteControlActivoVehicular() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteControlActivoVehicular(id),
    onSuccess: () => {
      toast.success("Control de activo eliminado exitosamente")
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
      queryClient.invalidateQueries({ queryKey: solicitudVehicularKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el control de activo")
    },
  })
}

export function useCreateControlActivoVehicularDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ControlActivoVehicularDetallePayload) =>
      createControlActivoVehicularDetalle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.detalles.all,
      })
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar accesorio al control")
    },
  })
}

export function useUpdateControlActivoVehicularDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ControlActivoVehicularDetallePayload
    }) => updateControlActivoVehicularDetalle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.detalles.all,
      })
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar accesorio del control")
    },
  })
}

export function useDeleteControlActivoVehicularDetalle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteControlActivoVehicularDetalle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.detalles.all,
      })
      queryClient.invalidateQueries({
        queryKey: controlActivoVehicularKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar accesorio del control")
    },
  })
}
