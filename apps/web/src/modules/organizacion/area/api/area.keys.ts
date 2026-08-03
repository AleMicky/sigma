import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export const areaKeys = createResourceKeys<"areas", PageParams>("areas")
