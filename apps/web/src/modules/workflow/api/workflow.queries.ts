import { queryOptions } from "@tanstack/react-query"

import { workflowKeys } from "./workflow.keys"
import {
  getCurrentTask,
  getWorkflowActions,
  getWorkflowHistory,
} from "./workflow.service"

export const workflowQueries = {
  currentTask: (processInstanceId?: string | null) =>
    queryOptions({
      queryKey: workflowKeys.currentTask(processInstanceId ?? ""),
      queryFn: () => getCurrentTask(processInstanceId!),
      enabled: Boolean(processInstanceId),
      staleTime: 10_000,
    }),

  actions: (processInstanceId?: string | null) =>
    queryOptions({
      queryKey: workflowKeys.actions(processInstanceId ?? ""),
      queryFn: () => getWorkflowActions(processInstanceId!),
      enabled: Boolean(processInstanceId),
      staleTime: 10_000,
    }),

  history: (processInstanceId?: string | null) =>
    queryOptions({
      queryKey: workflowKeys.history(processInstanceId ?? ""),
      queryFn: () => getWorkflowHistory(processInstanceId!),
      enabled: Boolean(processInstanceId),
      staleTime: 15_000,
    }),
}
