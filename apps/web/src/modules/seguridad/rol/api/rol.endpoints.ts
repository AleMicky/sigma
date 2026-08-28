import { createResourceEndpoints } from "@/shared/api"

export const rolEndpoints = {
  ...createResourceEndpoints("/roles"),
  todos: "/roles/todos",
  sincronizar: "/roles/sincronizar",
  menus: (id: string) => `/roles/${id}/menus`,
  menuIds: (id: string) => `/roles/${id}/menus/ids`,
  menuArbol: (id: string) => `/roles/${id}/menus/arbol`,
}
