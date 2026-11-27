import { createCrudMutations } from "@/shared/api"
import { authKeys } from "@/modules/auth/api/auth.keys"

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
    menuKeys.misMenus(),
    authKeys.me(),
  ],
})

export const useCreateMenu = menuMutations.useCreate
export const useUpdateMenu = menuMutations.useUpdate
export const useDeleteMenu = menuMutations.useDelete
