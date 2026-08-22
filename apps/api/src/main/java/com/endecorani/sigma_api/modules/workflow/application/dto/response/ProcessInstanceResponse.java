package com.endecorani.sigma_api.modules.workflow.application.dto.response;

public record ProcessInstanceResponse(
        String id,
        String businessKey,
        String processDefinitionId,
        String activityId,
        Boolean suspended
) {
}