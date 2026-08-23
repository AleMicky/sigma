package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record WorkflowResponse(

        UUID id,

        String codigo,

        String nombre,

        String descripcion,

        String modulo,

        String processDefinitionKey,

        AuditoriaResponse auditoria

) {
}