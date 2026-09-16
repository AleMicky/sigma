export const WORKFLOW_ENDPOINTS = {
  root: "/workflow",
  instance: (processInstanceId: string) =>
    `/workflow/instances/${encodeURIComponent(processInstanceId)}`,
  currentTask: (processInstanceId: string) =>
    `/workflow/instances/${encodeURIComponent(processInstanceId)}/current-task`,
  actions: (processInstanceId: string) =>
    `/workflow/instances/${encodeURIComponent(processInstanceId)}/actions`,
  history: (processInstanceId: string) =>
    `/workflow/instances/${encodeURIComponent(processInstanceId)}/history`,
  complete: (processInstanceId: string) =>
    `/workflow/instances/${encodeURIComponent(processInstanceId)}/complete`,
} as const

export const workflowEndpoints = WORKFLOW_ENDPOINTS
