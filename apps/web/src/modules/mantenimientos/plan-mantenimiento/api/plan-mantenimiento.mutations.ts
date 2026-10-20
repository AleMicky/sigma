import { createCrudMutations } from "@/shared/api"

import { planMantenimientoKeys } from "./plan-mantenimiento.keys"
import {
  createPlanMantenimiento,
  deletePlanMantenimiento,
  updatePlanMantenimiento,
  type PlanMantenimiento,
  type PlanMantenimientoPayload,
} from "./plan-mantenimiento.service"

const planMantenimientoMutations = createCrudMutations<PlanMantenimiento, PlanMantenimientoPayload>({
  keys: planMantenimientoKeys,
  service: {
    create: createPlanMantenimiento,
    update: updatePlanMantenimiento,
    remove: deletePlanMantenimiento,
  },
  messages: {
    created: "Plan de mantenimiento creado correctamente",
    updated: "Plan de mantenimiento actualizado correctamente",
    deleted: "Plan de mantenimiento eliminado correctamente",
  },
})

export const useCreatePlanMantenimiento = planMantenimientoMutations.useCreate
export const useUpdatePlanMantenimiento = planMantenimientoMutations.useUpdate
export const useDeletePlanMantenimiento = planMantenimientoMutations.useDelete
