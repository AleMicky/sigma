package com.endecorani.sigma_api.modules.workflow.application.dto.response;

public record WorkflowTaskResponse(
        String id,
        String name,
        String taskDefinitionKey,
        String assignee,
        String processInstanceId,
        String processDefinitionId
) {
}
