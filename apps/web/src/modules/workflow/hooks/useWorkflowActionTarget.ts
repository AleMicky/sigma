import { useState, useCallback } from "react"

import type { WorkflowAction, WorkflowField } from "../types/workflow.types"

export type WorkflowActionTargetState<T> = {
  item: T
  action: WorkflowAction
  taskName?: string
  fields?: WorkflowField[]
}

export function useWorkflowActionTarget<T = unknown>() {
  const [target, setTarget] = useState<WorkflowActionTargetState<T> | null>(null)

  const openAction = useCallback(
    (
      item: T,
      action: WorkflowAction,
      taskName?: string,
      fields?: WorkflowField[],
    ) => {
      setTarget({
        item,
        action,
        taskName,
        fields,
      })
    },
    [],
  )

  const closeAction = useCallback(() => {
    setTarget(null)
  }, [])

  return {
    target,
    isOpen: Boolean(target),
    openAction,
    closeAction,
    setTarget,
  }
}
