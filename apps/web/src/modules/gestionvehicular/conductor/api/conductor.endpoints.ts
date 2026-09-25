import { createResourceEndpoints } from "@/shared/api"

export const conductorEndpoints = {
  ...createResourceEndpoints("/conductores"),
}
