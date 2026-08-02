import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const tipoDatoKeys = createResourceKeys<"tipos-dato", PageParams>(
  "tipos-dato",
)
