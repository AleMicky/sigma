package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import java.util.List;

public record WorkflowTaskActionsResponse(
        String taskId,
        String taskName,
        String taskDefinitionKey,
        String processInstanceId,
        String status,
        List<WorkflowFieldResponse> fields,
        List<WorkflowActionResponse> actions
) {
}