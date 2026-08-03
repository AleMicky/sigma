import { createCrudMutations } from "@/shared/api"

import { personaKeys } from "./persona.keys"
import {
  createPersona,
  deletePersona,
  updatePersona,
  type Persona,
  type PersonaPayload,
} from "./persona.service"

const personaMutations = createCrudMutations<Persona, PersonaPayload>({
  keys: personaKeys,
  service: {
    create: createPersona,
    update: updatePersona,
    remove: deletePersona,
  },
  messages: {
    created: "Persona registrada correctamente",
    updated: "Persona actualizada correctamente",
    deleted: "Persona eliminada correctamente",
  },
})

export const useCreatePersona = personaMutations.useCreate
export const useUpdatePersona = personaMutations.useUpdate
export const useDeletePersona = personaMutations.useDelete
