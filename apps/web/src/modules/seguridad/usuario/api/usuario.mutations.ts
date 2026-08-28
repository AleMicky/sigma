import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys"

import { usuarioKeys } from "./usuario.keys"
import { actualizarPersonaUsuario, sincronizarUsuarios } from "./usuario.service"

export function useSincronizarUsuarios() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sincronizarUsuarios,
    onSuccess: (total) => {
      void queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
      void queryClient.invalidateQueries({ queryKey: menuKeys.misMenus() })
      toast.success(
        `Sincronización completada: ${total} ${total === 1 ? "usuario procesado" : "usuarios procesados"}`,
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useActualizarPersonaUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, personaId }: { id: string; personaId: string | null }) =>
      actualizarPersonaUsuario(id, { personaId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
      toast.success("Persona asociada al usuario actualizada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
