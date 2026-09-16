export const workflowKeys = {
  all: ["workflow"] as const,
  instances: () => [...workflowKeys.all, "instances"] as const,
  instance: (processInstanceId: string) =>
    [...workflowKeys.instances(), processInstanceId] as const,
  currentTask: (processInstanceId: string) =>
    [...workflowKeys.instance(processInstanceId), "current-task"] as const,
  actions: (processInstanceId: string) =>
    [...workflowKeys.instance(processInstanceId), "actions"] as const,
  history: (processInstanceId: string) =>
    [...workflowKeys.instance(processInstanceId), "history"] as const,
}
