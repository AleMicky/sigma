package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "EmpleadoResumenResponse",
        description = "Información de un empleado con datos enriquecidos de persona"
)
public record EmpleadoResumenResponse(
        UUID id,
        String codigo,
        String nombreCompleto
) {
}
