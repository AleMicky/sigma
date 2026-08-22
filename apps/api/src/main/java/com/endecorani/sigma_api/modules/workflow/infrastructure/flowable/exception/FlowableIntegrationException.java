package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.exception;

public class FlowableIntegrationException extends RuntimeException {

    public FlowableIntegrationException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}