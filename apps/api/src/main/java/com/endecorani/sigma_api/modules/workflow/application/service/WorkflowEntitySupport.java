package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowExecutionResult;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowVariablesCustomizerContext;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
 * Servicio centralizado de soporte para entidades de negocio vinculadas a flujos Flowable BPMN.
 * Unifica las consultas de tareas, acciones e historial, así como la resolución y ejecución de acciones.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowEntitySupport {

    private final WorkflowApplicationService workflowApplicationService;

    /**
     * Valida que la entidad tenga un proceso BPMN asociado.
     */
    public void validarProcesoAsociado(String processInstanceId, String entidadConArticulo) {
        if (processInstanceId == null || processInstanceId.isBlank()) {
            throw new BusinessException(entidadConArticulo + " no tiene un proceso Flowable asociado");
        }
    }

    /**
     * Valida que la entidad tenga un proceso BPMN activo antes de ejecutar una acción.
     */
    public void validarProcesoActivo(String processInstanceId, String entidadConArticulo) {
        if (processInstanceId == null || processInstanceId.isBlank()) {
            throw new BusinessException(entidadConArticulo + " no tiene un proceso Flowable activo");
        }
    }

    /**
     * Obtiene la tarea actual pendiente del proceso.
     */
    public WorkflowTaskResponse obtenerTareaActual(String processInstanceId, String entidadConArticulo) {
        validarProcesoAsociado(processInstanceId, entidadConArticulo);
        return workflowApplicationService.obtenerTareaActual(processInstanceId);
    }

    /**
     * Obtiene las acciones disponibles en la tarea activa.
     */
    public WorkflowTaskActionsResponse obtenerAcciones(String processInstanceId, String entidadConArticulo) {
        validarProcesoAsociado(processInstanceId, entidadConArticulo);
        return workflowApplicationService.obtenerAccionesDisponibles(processInstanceId);
    }

    /**
     * Obtiene el historial de ejecución BPMN del proceso.
     */
    public WorkflowHistoryResponse obtenerHistorial(String processInstanceId, String entidadConArticulo) {
        validarProcesoAsociado(processInstanceId, entidadConArticulo);
        return workflowApplicationService.obtenerHistorial(processInstanceId);
    }

    /**
     * Resuelve de forma estricta la acción coincidente configurada en la tarea BPMN actual.
     * Lanza {@link BusinessException} si {@code accionId} no coincide con ninguna acción disponible.
     */
    public WorkflowActionResponse resolverAccionCoincidente(WorkflowTaskActionsResponse tareaActual, String accionId) {
        if (tareaActual == null || tareaActual.actions() == null || tareaActual.actions().isEmpty()) {
            return null;
        }

        if (accionId == null || accionId.isBlank()) {
            if (tareaActual.actions().size() == 1) {
                return tareaActual.actions().getFirst();
            }
            throw new BusinessException(
                    "INVALID_WORKFLOW_ACTION",
                    "Debe especificar una acción válida para la tarea actual. Acciones disponibles: [%s]"
                            .formatted(formatAvailableActions(tareaActual))
            );
        }

        String normalizedAccionId = accionId.trim();
        return tareaActual.actions().stream()
                .filter(a -> matchesAction(a, normalizedAccionId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "INVALID_WORKFLOW_ACTION",
                        "La acción '%s' no es válida para la tarea actual. Acciones disponibles: [%s]"
                                .formatted(normalizedAccionId, formatAvailableActions(tareaActual))
                ));
    }

    private boolean matchesAction(WorkflowActionResponse action, String normalizedAccionId) {
        if (action == null) {
            return false;
        }
        if (action.value() != null) {
            if (action.value().equalsIgnoreCase(normalizedAccionId)
                    || normalizedAccionId.equalsIgnoreCase(action.value().replaceAll("[^A-Za-z0-9]", "_"))
                    || normalizedAccionId.equalsIgnoreCase(action.value().replaceAll("_", "-"))) {
                return true;
            }
        }
        return action.name() != null && action.name().equalsIgnoreCase(normalizedAccionId);
    }

    private String formatAvailableActions(WorkflowTaskActionsResponse tareaActual) {
        return tareaActual.actions().stream()
                .filter(Objects::nonNull)
                .map(a -> a.value() != null && !a.value().isBlank() ? a.value() : a.name())
                .filter(Objects::nonNull)
                .collect(Collectors.joining(", "));
    }

    /**
     * Ejecuta una acción sobre la tarea activa del proceso BPMN, preparando variables y completando la tarea.
     *
     * @param processInstanceId      ID de la instancia del proceso Flowable.
     * @param entidadConArticulo     Nombre legible de la entidad con artículo (ej: "El incidente", "La salida vehicular").
     * @param accionId               Identificador o valor de la acción a ejecutar.
     * @param variablesEntrada       Mapa de variables iniciales provistas en el request.
     * @param variableCustomizer     Consumidor opcional para inyectar variables de negocio específicas del dominio.
     * @return WorkflowExecutionResult con información del estado antes y después del avance del flujo.
     */
    public WorkflowExecutionResult ejecutarAccion(
            String processInstanceId,
            String entidadConArticulo,
            String accionId,
            Map<String, Object> variablesEntrada,
            Consumer<WorkflowVariablesCustomizerContext> variableCustomizer
    ) {
        validarProcesoActivo(processInstanceId, entidadConArticulo);

        WorkflowTaskActionsResponse tareaActual = workflowApplicationService.obtenerAccionesDisponibles(processInstanceId);
        if (tareaActual == null || tareaActual.taskId() == null) {
            throw new BusinessException("El proceso Flowable no tiene una tarea activa pendiente para ejecutar acciones");
        }

        WorkflowActionResponse matchingAction = resolverAccionCoincidente(tareaActual, accionId);

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (variablesEntrada != null) {
            effectiveVariables.putAll(variablesEntrada);
        }

        String actionValue = matchingAction != null && matchingAction.value() != null
                ? matchingAction.value()
                : (accionId != null ? accionId.toUpperCase() : "");
        String actionVar = matchingAction != null && matchingAction.variable() != null
                ? matchingAction.variable()
                : "action";

        effectiveVariables.put(actionVar, actionValue);
        effectiveVariables.put("action", actionValue);
        effectiveVariables.put("accion", actionValue);

        if (variableCustomizer != null) {
            variableCustomizer.accept(new WorkflowVariablesCustomizerContext(
                    tareaActual,
                    matchingAction,
                    actionValue,
                    effectiveVariables
            ));
        }

        CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(effectiveVariables);
        WorkflowTaskActionsResponse siguienteTarea = workflowApplicationService.completarTarea(
                processInstanceId,
                taskRequest,
                true // REQ-MANT-029: llamada interna de un módulo gestionado
        );

        return new WorkflowExecutionResult(
                tareaActual,
                matchingAction,
                actionValue,
                effectiveVariables,
                siguienteTarea
        );
    }
}

