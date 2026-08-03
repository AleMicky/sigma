import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { cargoEndpoints } from "./cargo.endpoints"

export type Cargo = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
}

export type CargoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}

const crud = createCrudService<Cargo, CargoPayload>(cargoEndpoints)

export const listCargos = crud.list
export const getCargo = crud.get
export const createCargo = crud.create
export const updateCargo = crud.update
export const deleteCargo = crud.remove
