import { useQuery } from "@tanstack/react-query"

import { workflowQueries } from "../api/workflow.queries"

export type UseWorkflowActionsOptions = {
  enabled?: boolean
}

/**
 * Hook reactivo para consultar las decisiones/acciones y formulario dinámico
 * asociados a la tarea activa de una instancia de workflow.
 */
export function useWorkflowActions(
  processInstanceId?: string | null,
  options?: UseWorkflowActionsOptions,
) {
  const query = useQuery({
    ...workflowQueries.actions(processInstanceId),
    enabled: Boolean(processInstanceId) && (options?.enabled ?? true),
  })

  return {
    ...query,
    data: query.data,
    actions: query.data?.actions ?? [],
    fields: query.data?.fields ?? [],
    taskName: query.data?.taskName ?? "",
    taskDefinitionKey: query.data?.taskDefinitionKey,
    taskId: query.data?.taskId,
    status: query.data?.status,
    hasActions: Boolean(query.data?.actions && query.data.actions.length > 0),
  }
}
