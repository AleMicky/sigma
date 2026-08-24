package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "DependienteSelectResponse",
        description = "Información básica de un dependiente para selector"
)
public record DependienteSelectResponse(
        UUID id,
        String nombreCompleto,
        String cargo
) {
}
