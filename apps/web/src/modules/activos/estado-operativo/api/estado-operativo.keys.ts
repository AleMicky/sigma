import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const estadoOperativoKeys = createResourceKeys<"estados-operativos", PageParams>(
  "estados-operativos",
)
