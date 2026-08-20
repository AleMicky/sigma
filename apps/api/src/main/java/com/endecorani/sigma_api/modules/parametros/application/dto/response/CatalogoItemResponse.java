package com.endecorani.sigma_api.modules.parametros.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "CatalogoItemResponse",
        description = "Información de un ítem de catálogo"
)
public record CatalogoItemResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del catálogo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID catalogoId,

        @Schema(
                description = "Nombre del ítem",
                example = "Cédula de identidad"
        )
        String nombre,

        @Schema(
                description = "Valor del ítem",
                example = "CI"
        )
        String valor,

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
