package com.endecorani.sigma_api.modules.workflow.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkflowRequest(

        @NotBlank @Size(max = 80) String codigo,

        @NotBlank @Size(max = 150) String nombre,

        @Size(max = 500) String descripcion,

        @NotBlank @Size(max = 80) String modulo,

        @NotBlank @Size(max = 150) String processDefinitionKey

) {
}