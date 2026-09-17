import { http } from "@/shared/api"

import { WORKFLOW_ENDPOINTS } from "./workflow.endpoints"
import type {
  CompleteWorkflowTaskPayload,
  WorkflowHistoryResponse,
  WorkflowTaskActionsResponse,
  WorkflowTaskResponse,
} from "../types/workflow.types"

/**
 * Obtiene la tarea de usuario actualmente activa en la instancia de proceso de Camunda.
 * Endpoint: GET /api/v1/workflow/instances/{processInstanceId}/current-task
 */
export async function getCurrentTask(
  processInstanceId: string,
): Promise<WorkflowTaskResponse> {
  return http.get<WorkflowTaskResponse>(
    WORKFLOW_ENDPOINTS.currentTask(processInstanceId),
  )
}

/**
 * Obtiene las acciones de transición y campos dinámicos disponibles para la tarea activa.
 * Endpoint: GET /api/v1/workflow/instances/{processInstanceId}/actions
 */
export async function getWorkflowActions(
  processInstanceId: string,
): Promise<WorkflowTaskActionsResponse> {
  return http.get<WorkflowTaskActionsResponse>(
    WORKFLOW_ENDPOINTS.actions(processInstanceId),
  )
}

/**
 * Obtiene el historial y trazabilidad cronológica de tareas del proceso.
 * Endpoint: GET /api/v1/workflow/instances/{processInstanceId}/history
 */
export async function getWorkflowHistory(
  processInstanceId: string,
): Promise<WorkflowHistoryResponse> {
  return http.get<WorkflowHistoryResponse>(
    WORKFLOW_ENDPOINTS.history(processInstanceId),
  )
}

/**
 * Completa la tarea actual del workflow pasando las variables requeridas por el formulario/decisión.
 * Endpoint: POST /api/v1/workflow/instances/{processInstanceId}/complete
 */
export async function completeWorkflowTask(
  processInstanceId: string,
  payload: CompleteWorkflowTaskPayload,
): Promise<WorkflowTaskActionsResponse> {
  return http.post<WorkflowTaskActionsResponse>(
    WORKFLOW_ENDPOINTS.complete(processInstanceId),
    payload,
  )
}
