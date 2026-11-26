import { useMutation, useQueryClient } from "@tanstack/react-query"
import { gestionVehicularDashboardKeys } from "../../dashboard/api/gestion-vehicular-dashboard.queries"
import { gestionVehicularTotalesKeys } from "../../totales/api/gestion-vehicular-totales.queries"
import { toast } from "sonner"

import { isApiError } from "@/shared/api"
import { salidaVehicularKeys } from "../../salida-vehicular/api/salida-vehicular.keys"

import { cargaCombustibleKeys } from "./carga-combustible.keys"
import {
  createCargaCombustible,
  deleteCargaCombustible,
  updateCargaCombustible,
  type CargaCombustiblePayload,
  type CargaCombustibleUpdatePayload,
} from "./carga-combustible.service"

export function useCreateCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CargaCombustiblePayload) =>
      createCargaCombustible(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gestionVehicularDashboardKeys.all })
      void queryClient.invalidateQueries({ queryKey: gestionVehicularTotalesKeys.all })
      toast.success("Carga de combustible registrada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
      queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al registrar la carga de combustible"
      )
    },
  })
}

export function useUpdateCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CargaCombustibleUpdatePayload
    }) => updateCargaCombustible(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gestionVehicularDashboardKeys.all })
      void queryClient.invalidateQueries({ queryKey: gestionVehicularTotalesKeys.all })
      toast.success("Carga de combustible actualizada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
      queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al actualizar la carga de combustible"
      )
    },
  })
}

export function useDeleteCargaCombustible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCargaCombustible(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gestionVehicularDashboardKeys.all })
      void queryClient.invalidateQueries({ queryKey: gestionVehicularTotalesKeys.all })
      toast.success("Carga de combustible eliminada correctamente")
      queryClient.invalidateQueries({ queryKey: cargaCombustibleKeys.all })
      queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.all })
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al eliminar la carga de combustible"
      )
    },
  })
}
