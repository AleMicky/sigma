import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const tipoActivoKeys = createResourceKeys<"tipos-activo", PageParams>(
  "tipos-activo",
)
