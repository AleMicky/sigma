package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.FlowableVariableRequest;

import java.util.List;

public record CompleteTaskRequest(
        String action,
        List<FlowableVariableRequest> variables
) {
}