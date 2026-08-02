import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"
import type { PageParams } from "@/shared/types/api.types"

import { periodoEndpoints } from "./periodo.endpoints"

export type Periodo = AuditableEntity & {
  gestionId: string
  periodo: number
  literal: string
  fechaInicio: string
  fechaFin: string
}

export type PeriodoPayload = {
  gestionId: string
  periodo: number
  literal: string
  fechaInicio: string
  fechaFin: string
}

export type PeriodoListParams = PageParams & {
  gestionId?: string
}

const crud = createCrudService<Periodo, PeriodoPayload, PeriodoListParams>(
  periodoEndpoints,
)

export const listPeriodos = crud.list
export const getPeriodo = crud.get
export const updatePeriodo = crud.update
