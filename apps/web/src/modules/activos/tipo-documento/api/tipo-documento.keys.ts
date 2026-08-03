import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const tipoDocumentoKeys = createResourceKeys<"tipos-documento", PageParams>(
  "tipos-documento",
)
