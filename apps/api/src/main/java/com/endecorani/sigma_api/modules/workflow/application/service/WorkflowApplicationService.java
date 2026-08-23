package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.ExecuteWorkflowActionRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowFieldResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkflowApplicationService {

    private final WorkflowConfigService workflowConfigService;
    private final WorkflowEngineService workflowEngineService;

    public String iniciar(
            String workflowCodigo,
            String businessKey,
            Map<String, Object> variables
    ) {

        Workflow workflow = workflowConfigService.findDomainByCodigo(workflowCodigo);

        return workflowEngineService.iniciarProceso(
                workflow.getProcessDefinitionKey(),
                businessKey,
                variables
        );
    }

    public WorkflowTaskResponse obtenerTareaActual(
            String processInstanceId
    ) {

        return workflowEngineService
                .obtenerTareaActual(
                        processInstanceId
                );
    }

    public WorkflowTaskActionsResponse obtenerAccionesDisponibles(
            String processInstanceId
    ) {
        return workflowEngineService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }

    public WorkflowTaskActionsResponse ejecutarAccion(
            String processInstanceId,
            ExecuteWorkflowActionRequest request
    ) {

        // 1. Consultar tarea + acciones válidas directamente del BPMN
        WorkflowTaskActionsResponse current =
                workflowEngineService
                        .obtenerAccionesDisponibles(
                                processInstanceId
                        );

        if (current.taskId() == null) {
            throw new IllegalStateException(
                    "El proceso no tiene una tarea activa"
            );
        }

        // 2. Verificar que variable + valor realmente existan en el BPMN actual
        WorkflowActionResponse action =
                current.actions()
                        .stream()
                        .filter(a ->
                                a.variable().equals(request.variable())
                                        &&
                                        a.value().equals(request.value())
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "La acción no es válida para la tarea actual"
                                )
                        );

        // 3. Completar la tarea
        workflowEngineService.completarTarea(
                current.taskId(),
                Map.of(
                        action.variable(),
                        action.value()
                )
        );

        // 4. Flowable ya decidió el camino.
        // Consultamos nuevamente la tarea resultante.
        return workflowEngineService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }

    public WorkflowTaskActionsResponse completarTarea(
            String processInstanceId,
            CompleteWorkflowTaskRequest request
    ) {

        WorkflowTaskActionsResponse actual =
                workflowEngineService.obtenerAccionesDisponibles(
                        processInstanceId
                );

        if (actual.taskId() == null) {
            throw new IllegalStateException(
                    "El proceso no tiene una tarea activa"
            );
        }

        Map<String, Object> variables =
                request.variables() != null
                        ? request.variables()
                        : Map.of();

        validarVariables(
                variables,
                actual
        );

        workflowEngineService.completarTarea(
                actual.taskId(),
                variables
        );

        return workflowEngineService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }

    private void validarVariables(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse task
    ) {

        // Validar campos requeridos del formProperty
        for (WorkflowFieldResponse field : task.fields()) {

            if (field.required()
                    && !variables.containsKey(field.id())) {

                throw new IllegalArgumentException(
                        "La variable '%s' es obligatoria"
                                .formatted(field.id())
                );
            }
        }

        // Validar acciones provenientes del gateway
        if (!task.actions().isEmpty()) {

            boolean accionValida =
                    task.actions()
                            .stream()
                            .anyMatch(action -> {

                                Object value =
                                        variables.get(
                                                action.variable()
                                        );

                                return value != null
                                        && action.value()
                                        .equals(
                                                value.toString()
                                        );
                            });

            if (!accionValida) {
                throw new IllegalArgumentException(
                        "La acción enviada no es válida para la tarea actual"
                );
            }
        }
    }
}