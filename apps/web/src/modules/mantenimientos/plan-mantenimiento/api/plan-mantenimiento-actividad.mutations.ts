import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { planMantenimientoKeys } from "./plan-mantenimiento.keys"
import { planMantenimientoActividadKeys } from "./plan-mantenimiento-actividad.keys"
import {
  createPlanMantenimientoActividad,
  deletePlanMantenimientoActividad,
  type PlanMantenimientoActividadPayload,
  type PlanMantenimientoActividadUpdatePayload,
  updatePlanMantenimientoActividad,
} from "./plan-mantenimiento-actividad.service"

export function useCreatePlanMantenimientoActividad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PlanMantenimientoActividadPayload) =>
      createPlanMantenimientoActividad(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActividadKeys.byPlan(variables.planMantenimientoId),
      })
      queryClient.invalidateQueries({
        queryKey: planMantenimientoKeys.all,
      })
      toast.success("Actividad asignada al plan exitosamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdatePlanMantenimientoActividad(planMantenimientoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: PlanMantenimientoActividadUpdatePayload
    }) => updatePlanMantenimientoActividad(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActividadKeys.byPlan(planMantenimientoId),
      })
      toast.success("Actividad del plan actualizada")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeletePlanMantenimientoActividad(planMantenimientoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePlanMantenimientoActividad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActividadKeys.byPlan(planMantenimientoId),
      })
      queryClient.invalidateQueries({
        queryKey: planMantenimientoKeys.all,
      })
      toast.success("Actividad desvinculada del plan")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
