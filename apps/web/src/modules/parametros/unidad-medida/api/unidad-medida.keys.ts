import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const unidadMedidaKeys = createResourceKeys<"unidades-medida", PageParams>(
  "unidades-medida",
)
