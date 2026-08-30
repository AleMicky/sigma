package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.ProcessInstanceResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.FlowablePageResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.ProcessDefinitionResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.HistoricTaskResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.TaskResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.exception.FlowableIntegrationException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.function.Supplier;

@Component
public class FlowableClient {

    private static final ParameterizedTypeReference<FlowablePageResponse<ProcessDefinitionResponse>> PROCESS_DEF_PAGE_TYPE =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<FlowablePageResponse<TaskResponse>> TASK_PAGE_TYPE =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<FlowablePageResponse<HistoricTaskResponse>> HISTORIC_TASK_PAGE_TYPE =
            new ParameterizedTypeReference<>() {};

    private final RestClient restClient;

    public FlowableClient(@Qualifier("flowableRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public FlowablePageResponse<ProcessDefinitionResponse> obtenerProcesos() {
        return execute(
                () -> restClient.get()
                        .uri("/repository/process-definitions")
                        .retrieve()
                        .body(PROCESS_DEF_PAGE_TYPE),
                "Error consultando definiciones de procesos en Flowable"
        );
    }

    public ProcessInstanceResponse iniciarProceso(StartProcessRequest request) {
        return execute(
                () -> restClient.post()
                        .uri("/runtime/process-instances")
                        .body(request)
                        .retrieve()
                        .body(ProcessInstanceResponse.class),
                "Error iniciando instancia de proceso en Flowable"
        );
    }

    public FlowablePageResponse<TaskResponse> obtenerTareasPorProceso(String processInstanceId) {
        return execute(
                () -> restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/runtime/tasks")
                                .queryParam("processInstanceId", processInstanceId)
                                .build())
                        .retrieve()
                        .body(TASK_PAGE_TYPE),
                "Error consultando tareas del proceso %s en Flowable".formatted(processInstanceId)
        );
    }

    public java.util.List<java.util.Map<String, Object>> obtenerVariablesProceso(String processInstanceId) {
        try {
            return restClient.get()
                    .uri("/runtime/process-instances/{id}/variables", processInstanceId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<java.util.List<java.util.Map<String, Object>>>() {});
        } catch (Exception ex) {
            return java.util.List.of();
        }
    }

    public FlowablePageResponse<HistoricTaskResponse> obtenerHistorialTareas(
            String processInstanceId
    ) {
        return execute(
                () -> restClient
                        .get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/history/historic-task-instances")
                                .queryParam(
                                        "processInstanceId",
                                        processInstanceId
                                )
                                .queryParam(
                                        "order",
                                        "asc"
                                )
                                .build()
                        )
                        .retrieve()
                        .body(HISTORIC_TASK_PAGE_TYPE),
                "Error obteniendo historial del proceso %s"
                        .formatted(processInstanceId)
        );
    }

    public ProcessDefinitionResponse obtenerProcessDefinition(String processDefinitionId) {
        return execute(
                () -> restClient.get()
                        .uri("/repository/process-definitions/{id}", processDefinitionId)
                        .retrieve()
                        .body(ProcessDefinitionResponse.class),
                "Error consultando la definición de proceso %s en Flowable".formatted(processDefinitionId)
        );
    }

    public String obtenerBpmn(String deploymentId, String resourceName) {
        return execute(
                () -> restClient.get()
                        .uri(
                                "/repository/deployments/{deploymentId}/resourcedata/{resourceName}",
                                deploymentId,
                                resourceName
                        )
                        .retrieve()
                        .body(String.class),
                "Error obteniendo recurso BPMN '%s' del deployment %s en Flowable"
                        .formatted(resourceName, deploymentId)
        );
    }

    public void completarTarea(String taskId, CompleteTaskRequest request) {
        executeVoid(
                () -> restClient.post()
                        .uri("/runtime/tasks/{taskId}", taskId)
                        .body(request)
                        .retrieve()
                        .toBodilessEntity(),
                "Error completando la tarea %s en Flowable".formatted(taskId)
        );
    }

    private <T> T execute(Supplier<T> action, String errorMessage) {
        try {
            return action.get();
        } catch (RestClientException ex) {
            throw new FlowableIntegrationException(errorMessage, ex);
        }
    }

    private void executeVoid(Runnable action, String errorMessage) {
        try {
            action.run();
        } catch (RestClientException ex) {
            throw new FlowableIntegrationException(errorMessage, ex);
        }
    }
}