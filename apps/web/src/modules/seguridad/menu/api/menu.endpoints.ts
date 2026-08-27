import { createResourceEndpoints } from "@/shared/api"

export const menuEndpoints = {
  ...createResourceEndpoints("/menus"),
  todos: "/menus/todos",
  raices: "/menus/raices",
  arbol: "/menus/arbol",
  hijos: (id: string) => `/menus/${id}/hijos`,
  arbolById: (id: string) => `/menus/${id}/arbol`,
}
