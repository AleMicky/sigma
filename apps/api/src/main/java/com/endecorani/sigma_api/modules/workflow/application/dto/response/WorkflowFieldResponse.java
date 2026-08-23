package com.endecorani.sigma_api.modules.workflow.application.dto.response;
import java.util.List;

public record WorkflowFieldResponse(
        String id,
        String name,
        String type,
        boolean required,
        boolean readable,
        boolean writable,
        List<WorkflowFieldOptionResponse> options
) {
}