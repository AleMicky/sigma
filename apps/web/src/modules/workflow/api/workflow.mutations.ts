import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { workflowKeys } from "./workflow.keys"
import { completeWorkflowTask } from "./workflow.service"
import type { CompleteWorkflowTaskPayload } from "../types/workflow.types"

export type CompleteWorkflowTaskVariables = {
  processInstanceId: string
  payload: CompleteWorkflowTaskPayload
}

/**
 * Hook de mutación para completar una tarea activa de Camunda pasando variables.
 */
export function useCompleteWorkflowTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ processInstanceId, payload }: CompleteWorkflowTaskVariables) =>
      completeWorkflowTask(processInstanceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: ["solicitudes-mantenimiento"],
      })
      queryClient.invalidateQueries({
        queryKey: ["solicitudes-vehiculares"],
      })
      toast.success("Tarea de workflow completada correctamente")
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err) || "Error al completar la tarea de workflow",
      )
    },
  })
}
