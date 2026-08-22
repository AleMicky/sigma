package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record TaskResponse(
        String id,
        String name,
        String taskDefinitionKey,
        String assignee,
        String processInstanceId,
        String processDefinitionId,
        String createTime
) {
}