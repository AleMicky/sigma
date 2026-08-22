import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { responsabilidadEndpoints } from "./responsabilidad.endpoints"

export type Responsabilidad = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type ResponsabilidadPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<Responsabilidad, ResponsabilidadPayload>(
  responsabilidadEndpoints,
)

export const listResponsabilidades = crud.list
export const getResponsabilidad = crud.get
export const createResponsabilidad = crud.create
export const updateResponsabilidad = crud.update
export const deleteResponsabilidad = crud.remove
