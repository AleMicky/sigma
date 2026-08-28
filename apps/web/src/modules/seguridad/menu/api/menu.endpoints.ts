import { createResourceEndpoints } from "@/shared/api"

export const menuEndpoints = {
  ...createResourceEndpoints("/menus"),
  todos: "/menus/todos",
  arbol: "/menus/arbol",
  misMenus: "/menus/mis-menus",
}
