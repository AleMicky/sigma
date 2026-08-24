package com.endecorani.sigma_api.modules.workflow.application.dto.response;

public record WorkflowHistoryItemResponse(
        String taskId,
        String taskDefinitionKey,
        String taskName,
        String assignee,
        String startTime,
        String endTime,
        String status
) {
}
