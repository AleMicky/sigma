package com.endecorani.sigma_api.modules.workflow.application.service;


import java.util.Map;

public interface WorkflowService {

    String iniciarProceso(
            String processDefinitionKey,
            String businessKey,
            Map<String, Object> variables
    );
}