import { createResourceKeys } from "@/shared/api"

const baseKeys = createResourceKeys("activo-documentos")

export const activoDocumentoKeys = {
  ...baseKeys,
  byActivo: (activoId: string, params?: unknown) =>
    [...baseKeys.all, "by-activo", activoId, params] as const,
}
