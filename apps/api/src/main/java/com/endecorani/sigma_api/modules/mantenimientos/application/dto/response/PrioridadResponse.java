package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "PrioridadResponse",
        description = "Información de prioridad de mantenimiento"
)
public record PrioridadResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        Integer nivel,
        AuditoriaResponse auditoria) {
}