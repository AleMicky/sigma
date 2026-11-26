import { createResourceKeys } from "@/shared/api"

import type { ActivoDocumentoResumenFilters } from "./activo-documento.service"

const baseKeys = createResourceKeys("activo-documentos")

export const activoDocumentoKeys = {
  ...baseKeys,
  byActivo: (activoId: string, params?: unknown) =>
    [...baseKeys.all, "by-activo", activoId, params] as const,
  resumen: (filters?: ActivoDocumentoResumenFilters) =>
    [...baseKeys.all, "resumen", filters] as const,
}
