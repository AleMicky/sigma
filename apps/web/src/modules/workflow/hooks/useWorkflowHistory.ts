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
    select: (data) => {
      if (!data?.items) return data
      const sortedItems = [...data.items].sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0
        if (timeA !== timeB) return timeA - timeB
        const endA = a.endTime ? new Date(a.endTime).getTime() : Number.MAX_SAFE_INTEGER
        const endB = b.endTime ? new Date(b.endTime).getTime() : Number.MAX_SAFE_INTEGER
        return endA - endB
      })
      return {
        ...data,
        items: sortedItems,
      }
    },
  })

  return {
    ...query,
    data: query.data,
    items: query.data?.items ?? [],
    hasHistory: Boolean(query.data?.items && query.data.items.length > 0),
  }
}
