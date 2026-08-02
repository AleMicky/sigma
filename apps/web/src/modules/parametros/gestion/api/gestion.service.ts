import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { gestionEndpoints } from "./gestion.endpoints"

export type Gestion = AuditableEntity & {
  gestion: number
  fechaInicio: string
  fechaFin: string
}

export type GestionPayload = {
  gestion: number
  fechaInicio: string
  fechaFin: string
}

const crud = createCrudService<Gestion, GestionPayload>(gestionEndpoints)

export const listGestiones = crud.list
export const getGestion = crud.get
export const createGestion = crud.create
export const updateGestion = crud.update
export const deleteGestion = crud.remove
