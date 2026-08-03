import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { personaEndpoints } from "./persona.endpoints"

export type Persona = AuditableEntity & {
  tipoDocumento: string
  numeroDocumento: string
  complemento: string | null
  nombres: string
  primerApellido: string
  segundoApellido: string | null
  fechaNacimiento: string | null
  telefono: string | null
  correo: string | null
}

export type PersonaPayload = {
  tipoDocumento: string
  numeroDocumento: string
  complemento?: string | null
  nombres: string
  primerApellido: string
  segundoApellido?: string | null
  fechaNacimiento?: string | null
  telefono?: string | null
  correo?: string | null
}

const crud = createCrudService<Persona, PersonaPayload>(personaEndpoints)

export const listPersonas = crud.list
export const getPersona = crud.get
export const createPersona = crud.create
export const updatePersona = crud.update
export const deletePersona = crud.remove
