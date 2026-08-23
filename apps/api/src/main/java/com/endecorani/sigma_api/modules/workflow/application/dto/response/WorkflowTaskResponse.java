package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record WorkflowTaskResponse(
        String id,
        String name,
        String taskDefinitionKey,
        String assignee,
        String processInstanceId,
        String processDefinitionId
) {
}
