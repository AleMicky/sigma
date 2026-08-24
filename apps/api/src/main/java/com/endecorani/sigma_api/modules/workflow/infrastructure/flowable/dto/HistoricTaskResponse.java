package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record HistoricTaskResponse(
        String id,
        String name,
        String assignee,
        String taskDefinitionKey,
        String processInstanceId,
        String processDefinitionId,
        String startTime,
        String endTime,
        Long durationInMillis,
        String deleteReason
) {
}
