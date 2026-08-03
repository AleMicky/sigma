import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { areaEndpoints } from "./area.endpoints"

export type Area = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type AreaPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<Area, AreaPayload>(areaEndpoints)

export const listAreas = crud.list
export const getArea = crud.get
export const createArea = crud.create
export const updateArea = crud.update
export const deleteArea = crud.remove
