package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowFieldResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

        Workflow workflow =
                workflowConfigService.findDomainByCodigo(
                        workflowCodigo
                );

        Map<String, Object> safeVariables =
                variables != null
                        ? variables
                        : Collections.emptyMap();

        return workflowEngineService.iniciarProceso(
                workflow.getProcessDefinitionKey(),
                businessKey,
                safeVariables
        );
    }

    public WorkflowTaskResponse obtenerTareaActual(
            String processInstanceId
    ) {
        return workflowEngineService
                .obtenerTareaActual(processInstanceId);
    }

    public WorkflowTaskActionsResponse obtenerAccionesDisponibles(
            String processInstanceId
    ) {
        return workflowEngineService
                .obtenerAccionesDisponibles(processInstanceId);
    }

    public WorkflowHistoryResponse obtenerHistorial(
            String processInstanceId
    ) {
        return workflowEngineService
                .obtenerHistorial(
                        processInstanceId
                );
    }

    public WorkflowTaskActionsResponse completarTarea(
            String processInstanceId,
            CompleteWorkflowTaskRequest request
    ) {

        WorkflowTaskActionsResponse tareaActual =
                workflowEngineService
                        .obtenerAccionesDisponibles(
                                processInstanceId
                        );

        validarTareaActiva(tareaActual);

        Map<String, Object> variables =
                request != null && request.variables() != null
                        ? request.variables()
                        : Collections.emptyMap();

        validarVariables(
                variables,
                tareaActual
        );

        workflowEngineService.completarTarea(
                tareaActual.taskId(),
                variables
        );

        return workflowEngineService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }

    private void validarTareaActiva(
            WorkflowTaskActionsResponse tarea
    ) {

        if (tarea == null || tarea.taskId() == null) {
            throw new IllegalStateException(
                    "El proceso no tiene una tarea activa"
            );
        }
    }

    private void validarVariables(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse tarea
    ) {

        validarCamposRequeridos(
                variables,
                tarea
        );

        validarVariablesPermitidas(
                variables,
                tarea
        );

        validarAccion(
                variables,
                tarea
        );
    }

    private void validarCamposRequeridos(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse tarea
    ) {

        if (tarea.fields() == null) {
            return;
        }

        boolean esObservacionORechazo = esAccionObservacionORechazo(variables, tarea);

        for (WorkflowFieldResponse field : tarea.fields()) {

            if (!field.required()) {
                continue;
            }

            // En acciones de observación, rechazo o cancelación, no se exigen campos de selección o asignación técnica
            if (esObservacionORechazo && esCampoOmitibleEnRechazo(field)) {
                continue;
            }

            Object value =
                    variables.get(field.id());

            if (value == null
                    || value.toString().isBlank()) {

                throw new IllegalArgumentException(
                        "El campo '%s' es obligatorio"
                                .formatted(field.name())
                );
            }
        }
    }

    private boolean esAccionObservacionORechazo(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse tarea
    ) {
        if (tarea.actions() == null || tarea.actions().isEmpty()) {
            return false;
        }

        return tarea.actions().stream().anyMatch(action -> {
            Object val = variables.get(action.variable());
            if (val == null) {
                return false;
            }
            String actionVal = val.toString().toUpperCase();
            String actionName = action.name() != null ? action.name().toUpperCase() : "";
            return actionVal.contains("OBSERV") || actionVal.contains("RECHAZ") || actionVal.contains("CANCEL") || actionVal.contains("CORREG") || actionVal.contains("DEVUELV")
                    || actionName.contains("OBSERV") || actionName.contains("RECHAZ") || actionName.contains("CANCEL") || actionName.contains("CORREG") || actionName.contains("DEVUELV");
        });
    }

    private boolean esCampoOmitibleEnRechazo(WorkflowFieldResponse field) {
        if (field == null || field.id() == null) {
            return false;
        }
        String id = field.id().toLowerCase();
        boolean esCampoTextoExplicativo = id.contains("comentario")
                || id.contains("observacion")
                || id.contains("motivo")
                || id.contains("razon")
                || id.contains("justificacion")
                || id.contains("detalle");

        return !esCampoTextoExplicativo;
    }

    private void validarVariablesPermitidas(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse tarea
    ) {

        if (variables.isEmpty()) {
            return;
        }

        Set<String> variablesPermitidas =
                construirVariablesPermitidas(tarea);

        for (String variable : variables.keySet()) {

            if (!variablesPermitidas.contains(variable)) {

                throw new IllegalArgumentException(
                        "La variable '%s' no está permitida para la tarea actual"
                                .formatted(variable)
                );
            }
        }
    }

    private Set<String> construirVariablesPermitidas(
            WorkflowTaskActionsResponse tarea
    ) {

        Set<String> variables =
                tarea.fields() == null
                        ? new java.util.HashSet<>()
                        : tarea.fields()
                        .stream()
                        .filter(WorkflowFieldResponse::writable)
                        .map(WorkflowFieldResponse::id)
                        .collect(Collectors.toSet());

        if (tarea.actions() != null) {
            tarea.actions()
                    .stream()
                    .map(WorkflowActionResponse::variable)
                    .forEach(variables::add);
        }

        // Permitir variables estándar de auditoría, control, comentarios y razones comunes a cualquier flujo BPMN
        variables.add("action");
        variables.add("comentario");
        variables.add("observacion");
        variables.add("motivo");
        variables.add("razon");
        variables.add("justificacion");
        variables.add("nota");
        variables.add("detalle");

        // Compatibilidad con variables estándar de asignación e ids comunes
        variables.add("responsableId");
        variables.add("responsableAsignacionId");
        variables.add("conductorAsignadoId");
        variables.add("conductorId");
        variables.add("activoId");
        variables.add("vehiculoId");
        variables.add("supervisorId");
        variables.add("aprobadorId");
        variables.add("solicitanteId");
        variables.add("usuarioId");
        variables.add("empleadoId");
        variables.add("observacionAprobacion");
        variables.add("observacionValidacion");
        variables.add("observacionCierre");
        variables.add("fechaEstimadaOt");

        return variables;
    }

    private void validarAccion(
            Map<String, Object> variables,
            WorkflowTaskActionsResponse tarea
    ) {

        if (tarea.actions() == null
                || tarea.actions().isEmpty()) {
            return;
        }

        boolean accionValida =
                tarea.actions()
                        .stream()
                        .anyMatch(action -> {

                            Object value =
                                    variables.get(
                                            action.variable()
                                    );

                            if (value == null) {
                                return false;
                            }

                            return action.value()
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