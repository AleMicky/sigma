import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { rolKeys } from "./rol.keys"
import { sincronizarRoles } from "./rol.service"

export function useSincronizarRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sincronizarRoles,
    onSuccess: (total) => {
      void queryClient.invalidateQueries({ queryKey: rolKeys.all })
      toast.success(
        `Sincronización completada: ${total} ${total === 1 ? "rol procesado" : "roles procesados"}`,
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
