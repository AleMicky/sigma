import { createCrudMutations } from "@/shared/api"

import { menuKeys } from "./menu.keys"
import {
  createMenu,
  deleteMenu,
  updateMenu,
  type CreateMenuDto,
  type Menu,
} from "./menu.service"

const menuMutations = createCrudMutations<Menu, CreateMenuDto>({
  keys: menuKeys,
  service: {
    create: createMenu,
    update: updateMenu,
    remove: deleteMenu,
  },
  messages: {
    created: "Menú creado correctamente",
    updated: "Menú actualizado correctamente",
    deleted: "Menú eliminado correctamente",
  },
  invalidateKeys: [
    menuKeys.all,
    menuKeys.arbol(),
    menuKeys.allList(),
  ],
})

export const useCreateMenu = menuMutations.useCreate
export const useUpdateMenu = menuMutations.useUpdate
export const useDeleteMenu = menuMutations.useDelete
