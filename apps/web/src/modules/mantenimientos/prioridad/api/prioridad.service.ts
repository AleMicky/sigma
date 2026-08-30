import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { prioridadEndpoints } from "./prioridad.endpoints"

export type Prioridad = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  nivel: number
  porDefecto: boolean
}

export type PrioridadPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  nivel: number
  porDefecto?: boolean
}

const crud = createCrudService<Prioridad, PrioridadPayload>(prioridadEndpoints)

export const listPrioridades = crud.list
export const getPrioridad = crud.get
export const createPrioridad = crud.create
export const updatePrioridad = crud.update
export const deletePrioridad = crud.remove
