package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import java.util.Map;

/**
 * Resultado estandarizado tras la ejecución o avance de una acción en Flowable BPMN.
 */
public record WorkflowExecutionResult(
        WorkflowTaskActionsResponse tareaPrevia,
        WorkflowActionResponse matchingAction,
        String actionValue,
        Map<String, Object> effectiveVariables,
        WorkflowTaskActionsResponse siguienteTarea
) {
    /**
     * Indica si el proceso BPMN finalizó tras ejecutar la acción.
     */
    public boolean procesoFinalizado() {
        return siguienteTarea == null || siguienteTarea.taskId() == null;
    }

    /**
     * Retorna la clave de definición de la siguiente tarea, o null si finalizó.
     */
    public String siguienteTaskDefinitionKey() {
        return siguienteTarea != null ? siguienteTarea.taskDefinitionKey() : null;
    }
}

