package com.endecorani.sigma_api.modules.workflow.application.dto.request;

public record ExecuteWorkflowActionRequest(
        String variable,
        String value
) {
}