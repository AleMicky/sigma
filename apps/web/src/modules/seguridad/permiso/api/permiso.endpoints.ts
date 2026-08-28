import { createResourceEndpoints } from "@/shared/api"

export const permisoEndpoints = {
  ...createResourceEndpoints("/permisos"),
  todos: "/permisos/todos",
  todosPorMenu: (menuId: string) => `/permisos/todos/menu/${menuId}`,
}
