package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

import java.util.List;

public record WorkflowTaskActionsResponse(
        String taskId,
        String taskName,
        String taskDefinitionKey,
        String processInstanceId,
        List<WorkflowActionResponse> actions
) {
}
