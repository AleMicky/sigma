import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const tipoMantenimientoKeys = createResourceKeys<"tipos-mantenimiento", PageParams>(
  "tipos-mantenimiento",
)
