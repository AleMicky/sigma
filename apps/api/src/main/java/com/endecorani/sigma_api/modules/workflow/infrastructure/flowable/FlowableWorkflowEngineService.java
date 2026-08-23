package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.FlowableVariableRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.ProcessInstanceResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEngineService;

import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.FlowablePageResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.ProcessDefinitionResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.TaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlowableWorkflowEngineService implements WorkflowEngineService {

    private final FlowableClient flowableClient;
    private final BpmnDefinitionParser bpmnDefinitionParser;
    @Override
    public String iniciarProceso(String processDefinitionKey, String businessKey, Map<String, Object> variables) {

        List<FlowableVariableRequest> flowableVariables = variables.entrySet()
                        .stream()
                        .map(entry -> new FlowableVariableRequest(
                                        entry.getKey(),
                                        entry.getValue()))
                        .toList();

        StartProcessRequest request = new StartProcessRequest(
                        processDefinitionKey,
                        businessKey,
                        flowableVariables
                );

        ProcessInstanceResponse response = flowableClient.iniciarProceso(request);

        if (response == null || response.id() == null) {
            throw new IllegalStateException(
                    "Flowable no devolvió el identificador de la instancia"
            );
        }

        return response.id();
    }

    @Override
    public WorkflowTaskResponse obtenerTareaActual(String processInstanceId) {

        FlowablePageResponse<TaskResponse> response = flowableClient.obtenerTareasPorProceso(processInstanceId);

        if (response == null
                || response.data() == null
                || response.data().isEmpty()) {
            return null;
        }

        TaskResponse task = response.data().getFirst();

        return new WorkflowTaskResponse(
                task.id(),
                task.name(),
                task.taskDefinitionKey(),
                task.assignee(),
                task.processInstanceId(),
                task.processDefinitionId()
        );
    }

    @Override
    public WorkflowTaskActionsResponse obtenerAccionesDisponibles(String processInstanceId) {

        WorkflowTaskResponse task = obtenerTareaActual(processInstanceId);

        if (task == null) {
            return new WorkflowTaskActionsResponse(
                    null,
                    null,
                    null,
                    processInstanceId,
                    List.of()
            );
        }

        ProcessDefinitionResponse processDefinition = flowableClient.obtenerProcessDefinition(task.processDefinitionId());

        if (processDefinition == null) {
            throw new IllegalStateException(
                    "No se encontró la definición del proceso"
            );
        }

        String bpmnXml = flowableClient.obtenerBpmn(
                        processDefinition.deploymentId(),
                        processDefinition.resource()
                );

        List<WorkflowActionResponse> actions =
                bpmnDefinitionParser.obtenerAcciones(
                        bpmnXml,
                        task.taskDefinitionKey()
                );

        return new WorkflowTaskActionsResponse(
                task.id(),
                task.name(),
                task.taskDefinitionKey(),
                task.processInstanceId(),
                actions
        );
    }
    @Override
    public void completarTarea(
            String taskId,
            Map<String, Object> variables
    ) {

        var flowableVariables =
                variables.entrySet()
                        .stream()
                        .map(entry ->
                                new FlowableVariableRequest(
                                        entry.getKey(),
                                        entry.getValue()
                                )
                        )
                        .toList();

        CompleteTaskRequest request =
                new CompleteTaskRequest(
                        "complete",
                        flowableVariables
                );

        flowableClient.completarTarea(
                taskId,
                request
        );
    }
}