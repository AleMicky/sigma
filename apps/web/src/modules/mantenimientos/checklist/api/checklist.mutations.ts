import { createCrudMutations } from "@/shared/api"

import { checklistKeys } from "./checklist.keys"
import {
  createChecklist,
  deleteChecklist,
  updateChecklist,
  type ChecklistMantenimiento,
  type ChecklistMantenimientoPayload,
} from "./checklist.service"

const checklistMutations = createCrudMutations<
  ChecklistMantenimiento,
  ChecklistMantenimientoPayload
>({
  keys: checklistKeys,
  service: {
    create: createChecklist,
    update: updateChecklist,
    remove: deleteChecklist,
  },
  messages: {
    created: "Checklist de mantenimiento creado correctamente",
    updated: "Checklist de mantenimiento actualizado correctamente",
    deleted: "Checklist de mantenimiento eliminado correctamente",
  },
})

export const useCreateChecklist = checklistMutations.useCreate
export const useUpdateChecklist = checklistMutations.useUpdate
export const useDeleteChecklist = checklistMutations.useDelete
