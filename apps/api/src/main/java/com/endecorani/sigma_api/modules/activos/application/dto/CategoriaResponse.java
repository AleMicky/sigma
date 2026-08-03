package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "CategoriaResponse",
        description = "Información de una categoría de activos"
)
public record CategoriaResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código de la categoría",
                example = "INFRAESTRUCTURA"
        )
        String codigo,

        @Schema(
                description = "Nombre de la categoría",
                example = "Infraestructura"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Activos de infraestructura institucional"
        )
        String descripcion,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        Integer orden,

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
