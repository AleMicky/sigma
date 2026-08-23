package com.endecorani.sigma_api.modules.workflow.application.dto.request;

import java.util.List;

public record CompleteTaskRequest(
        String action,
        List<FlowableVariableRequest> variables
) {
}