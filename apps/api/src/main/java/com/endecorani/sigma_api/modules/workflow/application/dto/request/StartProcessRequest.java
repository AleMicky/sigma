package com.endecorani.sigma_api.modules.workflow.application.dto.request;

import java.util.List;

public record StartProcessRequest(
        String processDefinitionKey,
        String businessKey,
        List<FlowableVariableRequest> variables
) {
}