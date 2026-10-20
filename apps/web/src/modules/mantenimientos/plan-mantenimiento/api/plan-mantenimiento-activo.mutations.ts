import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { planMantenimientoKeys } from "./plan-mantenimiento.keys"
import { planMantenimientoActivoKeys } from "./plan-mantenimiento-activo.keys"
import {
  activarPlanMantenimientoActivo,
  createPlanMantenimientoActivo,
  deletePlanMantenimientoActivo,
  desactivarPlanMantenimientoActivo,
  type PlanMantenimientoActivoPayload,
  type PlanMantenimientoActivoUpdatePayload,
  updatePlanMantenimientoActivo,
} from "./plan-mantenimiento-activo.service"

export function useCreatePlanMantenimientoActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PlanMantenimientoActivoPayload) =>
      createPlanMantenimientoActivo(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.byPlan(variables.planMantenimientoId),
      })
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: planMantenimientoKeys.all,
      })
      toast.success("Activo asignado al plan de mantenimiento correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdatePlanMantenimientoActivo(planMantenimientoId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: PlanMantenimientoActivoUpdatePayload
    }) => updatePlanMantenimientoActivo(id, payload),
    onSuccess: () => {
      if (planMantenimientoId) {
        queryClient.invalidateQueries({
          queryKey: planMantenimientoActivoKeys.byPlan(planMantenimientoId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.all,
      })
      toast.success("Asignación de activo actualizada")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDesactivarPlanMantenimientoActivo(planMantenimientoId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => desactivarPlanMantenimientoActivo(id),
    onSuccess: () => {
      if (planMantenimientoId) {
        queryClient.invalidateQueries({
          queryKey: planMantenimientoActivoKeys.byPlan(planMantenimientoId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.all,
      })
      toast.success("Asignación desactivada. No generará nuevas solicitudes automáticas.")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useActivarPlanMantenimientoActivo(planMantenimientoId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activarPlanMantenimientoActivo(id),
    onSuccess: () => {
      if (planMantenimientoId) {
        queryClient.invalidateQueries({
          queryKey: planMantenimientoActivoKeys.byPlan(planMantenimientoId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.all,
      })
      toast.success("Asignación reactivada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeletePlanMantenimientoActivo(planMantenimientoId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePlanMantenimientoActivo(id),
    onSuccess: () => {
      if (planMantenimientoId) {
        queryClient.invalidateQueries({
          queryKey: planMantenimientoActivoKeys.byPlan(planMantenimientoId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: planMantenimientoActivoKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: planMantenimientoKeys.all,
      })
      toast.success("Asignación eliminada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
