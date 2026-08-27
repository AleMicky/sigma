import { createResourceKeys } from "@/shared/api"

export const usuarioKeys = {
  ...createResourceKeys("usuarios"),
  sync: () => ["usuarios", "sync"] as const,
}
