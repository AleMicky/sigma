import { useQuery } from "@tanstack/react-query"

import { workflowQueries } from "../api/workflow.queries"

export type UseWorkflowHistoryOptions = {
  enabled?: boolean
}

/**
 * Hook reactivo para consultar el historial y la trazabilidad de tareas de una instancia de workflow.
 */
export function useWorkflowHistory(
  processInstanceId?: string | null,
  options?: UseWorkflowHistoryOptions,
) {
  const query = useQuery({
    ...workflowQueries.history(processInstanceId),
    enabled: Boolean(processInstanceId) && (options?.enabled ?? true),
  })

  return {
    ...query,
    data: query.data,
    items: query.data?.items ?? [],
    hasHistory: Boolean(query.data?.items && query.data.items.length > 0),
  }
}
