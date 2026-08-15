package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoMantenimientoResponse",
        description = "Información de tipo de mantenimiento"
)
public record TipoMantenimientoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de tipo de mantenimiento",
                example = "PREVENTIVO"
        )
        String codigo,

        @Schema(
                description = "Nombre de tipo de mantenimiento",
                example = "Mantenimiento preventivo"
        )
        String nombre,

        @Schema(
                description = "Descripción de tipo de mantenimiento",
                example = "Mantenimiento programado para prevenir fallas."
        )
        String descripcion,

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