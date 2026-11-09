package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import java.util.Map;

/**
 * Contexto de enriquecimiento de variables específicas del dominio antes de enviar la tarea a Flowable.
 */
public record WorkflowVariablesCustomizerContext(
        WorkflowTaskActionsResponse tareaActual,
        WorkflowActionResponse matchingAction,
        String actionValue,
        Map<String, Object> effectiveVariables
) {
    /**
     * Retorna la clave de la tarea actual en minúsculas (ej: "revision", "atencion", "validacion", "cierre").
     */
    public String taskDefinitionKey() {
        return tareaActual != null && tareaActual.taskDefinitionKey() != null
                ? tareaActual.taskDefinitionKey().toLowerCase()
                : "";
    }

    /**
     * Helper para agregar una variable solo si el valor no es nulo.
     */
    public void putIfNotNull(String key, Object value) {
        if (value != null && effectiveVariables != null) {
            effectiveVariables.put(key, value);
        }
    }
}

