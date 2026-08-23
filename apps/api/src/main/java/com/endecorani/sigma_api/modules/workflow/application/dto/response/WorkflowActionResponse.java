package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record WorkflowActionResponse(
        String name,
        String variable,
        String value
) {
}
