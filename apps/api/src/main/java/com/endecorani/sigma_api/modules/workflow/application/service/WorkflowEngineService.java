package com.endecorani.sigma_api.modules.workflow.application.service;


import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.WorkflowTaskResponse;

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
}