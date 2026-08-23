package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record WorkflowTask(
        String id,
        String name,
        String taskDefinitionKey,
        String assignee,
        String processInstanceId,
        String processDefinitionId
) {
}
