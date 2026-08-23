package com.endecorani.sigma_api.modules.workflow.application.dto.response;

public record WorkflowActionResponse(
        String name,
        String variable,
        String value
) {
}
