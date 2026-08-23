package com.endecorani.sigma_api.modules.workflow.application.dto.request;

import java.util.Map;

public record CompleteWorkflowTaskRequest(
        Map<String, Object> variables
) {
}