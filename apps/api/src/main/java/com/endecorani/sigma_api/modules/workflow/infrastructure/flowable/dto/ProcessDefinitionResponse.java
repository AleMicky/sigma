package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto;

public record ProcessDefinitionResponse(
        String id,
        String url,
        String key,
        Integer version,
        String name,
        String description,
        String deploymentId,
        String deploymentUrl,
        String resource,
        String diagramResource,
        String category,
        Boolean suspended,
        Boolean graphicalNotationDefined,
        Boolean startFormDefined
) {
}