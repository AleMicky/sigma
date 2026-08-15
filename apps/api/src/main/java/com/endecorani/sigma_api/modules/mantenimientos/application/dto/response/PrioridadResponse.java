package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "PrioridadResponse",
        description = "Información de prioridad de mantenimiento"
)
public record PrioridadResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de prioridad",
                example = "ALTA"
        )
        String codigo,

        @Schema(
                description = "Nombre de la prioridad",
                example = "Alta"
        )
        String nombre,

        @Schema(
                description = "Descripción de la prioridad",
                example = "Atención inmediata para evitar fallas críticas."
        )
        String descripcion,

        @Schema(
                description = "Nivel de prioridad",
                example = "1"
        )
        Integer nivel,

        @Schema(description = "Fecha de creación")
        Instant createdAt,

        @Schema(description = "Fecha de última actualización")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que actualizó el registro")
        String updatedBy
) {
}