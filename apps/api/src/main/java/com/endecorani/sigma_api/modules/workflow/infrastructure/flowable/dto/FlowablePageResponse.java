package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import java.util.List;

public record FlowablePageResponse<T>(
        List<T> data,
        Integer total,
        Integer start,
        String sort,
        String order,
        Integer size
) {
}