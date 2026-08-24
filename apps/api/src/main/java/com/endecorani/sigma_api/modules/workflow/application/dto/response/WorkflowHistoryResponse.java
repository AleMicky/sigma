package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import java.util.List;

public record WorkflowHistoryResponse(
        String processInstanceId,
        List<WorkflowHistoryItemResponse> items
) {
}
