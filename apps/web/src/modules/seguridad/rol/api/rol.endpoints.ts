import { createResourceEndpoints } from "@/shared/api"

export const rolEndpoints = {
  ...createResourceEndpoints("/roles"),
  todos: "/roles/todos",
  sincronizar: "/roles/sincronizar",
}
