package com.endecorani.sigma_api.modules.workflow.application.service;


import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;

import java.util.Map;

public interface WorkflowEngineService {

    String iniciarProceso(
            String processDefinitionKey,
            String businessKey,
            Map<String, Object> variables
    );

    WorkflowTaskResponse obtenerTareaActual(
            String processInstanceId
    );

    /** REQ-MANT-027: permite resolver el dominio del proceso antes de completar una tarea. */
    String obtenerDefinitionKey(
            String processInstanceId
    );

    WorkflowTaskActionsResponse obtenerAccionesDisponibles(
            String processInstanceId
    );

    WorkflowHistoryResponse obtenerHistorial(
            String processInstanceId
    );

    void completarTarea(
            String taskId,
            Map<String, Object> variables
    );

    void cancelarProceso(
            String processInstanceId,
            String motivo
    );
}