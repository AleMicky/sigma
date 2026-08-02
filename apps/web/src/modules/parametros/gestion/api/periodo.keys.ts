import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type PeriodoListFilters = PageParams & {
  gestionId?: string
}

export const periodoKeys = createResourceKeys<
  "periodos",
  PeriodoListFilters
>("periodos")
