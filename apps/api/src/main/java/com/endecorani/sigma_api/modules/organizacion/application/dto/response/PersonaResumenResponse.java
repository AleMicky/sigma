package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "PersonaResumenResponse",
        description = "Información resumida de una persona"
)
public record PersonaResumenResponse(
        UUID id,
        String nombreCompleto,
        String tipoDocumento,
        String numeroDocumento
) {
}