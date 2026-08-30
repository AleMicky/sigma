export type WorkflowFieldOption = {
  value?: string
  label?: string
  id?: string
  name?: string
}

export type WorkflowField = {
  id: string
  name: string
  label?: string
  type: string
  required: boolean
  readable?: boolean
  writable?: boolean
  defaultValue?: string | null
  description?: string | null
  placeholder?: string | null
  options?: WorkflowFieldOption[]
  component?: string
  source?: string
  url?: string
  params?: Record<string, string>
}

export type WorkflowAction = {
  name: string
  value: string
  variable: string
  fields?: WorkflowField[]
}

export type WorkflowTaskActionsResponse = {
  taskId: string
  taskName: string
  taskDefinitionKey?: string
  processInstanceId: string
  status?: string
  fields?: WorkflowField[]
  actions: WorkflowAction[]
}

export type CompleteWorkflowTaskPayload = {
  variables: Record<string, unknown>
}

export type WorkflowActionTarget<T = unknown> = {
  item: T
  action: WorkflowAction
  taskName?: string
  fields?: WorkflowField[]
}
