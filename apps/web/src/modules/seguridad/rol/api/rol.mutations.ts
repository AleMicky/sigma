import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys"

import { rolKeys } from "./rol.keys"
import { asignarMenusRol, sincronizarRoles } from "./rol.service"

export function useSincronizarRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sincronizarRoles,
    onSuccess: (total) => {
      void queryClient.invalidateQueries({ queryKey: rolKeys.all })
      void queryClient.invalidateQueries({ queryKey: menuKeys.misMenus() })
      toast.success(
        `Sincronización completada: ${total} ${total === 1 ? "rol procesado" : "roles procesados"}`,
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useAsignarMenusRol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, menuIds }: { id: string; menuIds: string[] }) =>
      asignarMenusRol(id, menuIds),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rolKeys.menus(variables.id) })
      void queryClient.invalidateQueries({ queryKey: rolKeys.menuIds(variables.id) })
      void queryClient.invalidateQueries({ queryKey: rolKeys.menuArbol(variables.id) })
      void queryClient.invalidateQueries({ queryKey: menuKeys.misMenus() })
      toast.success("Menús y permisos del rol actualizados correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
