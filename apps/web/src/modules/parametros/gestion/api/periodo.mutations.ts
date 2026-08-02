import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { periodoKeys } from "./periodo.keys"
import {
  updatePeriodo,
  type PeriodoPayload,
} from "./periodo.service"

export function useUpdatePeriodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: PeriodoPayload
    }) => updatePeriodo(id, payload),
    onSuccess: (periodo) => {
      void queryClient.invalidateQueries({ queryKey: periodoKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: periodoKeys.detail(periodo.id),
      })
      toast.success("Período actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
