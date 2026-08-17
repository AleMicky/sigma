import { createCrudMutations } from "@/shared/api"

import { checklistItemKeys } from "./checklist-item.keys"
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
  type ChecklistItem,
  type ChecklistItemPayload,
} from "./checklist-item.service"

const checklistItemMutations = createCrudMutations<
  ChecklistItem,
  ChecklistItemPayload
>({
  keys: checklistItemKeys,
  service: {
    create: createChecklistItem,
    update: updateChecklistItem,
    remove: deleteChecklistItem,
  },
  messages: {
    created: "Ítem de checklist creado correctamente",
    updated: "Ítem de checklist actualizado correctamente",
    deleted: "Ítem de checklist eliminado correctamente",
  },
})

export const useCreateChecklistItem = checklistItemMutations.useCreate
export const useUpdateChecklistItem = checklistItemMutations.useUpdate
export const useDeleteChecklistItem = checklistItemMutations.useDelete
