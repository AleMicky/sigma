package com.endecorani.sigma_api.modules.parametros.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "UnidadMedidaResponse",
        description = "Información de una unidad de medida"
)
public record UnidadMedidaResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de la unidad de medida",
                example = "KG"
        )
        String codigo,

        @Schema(
                description = "Nombre de la unidad de medida",
                example = "Kilogramo"
        )
        String nombre,

        @Schema(
                description = "Símbolo de la unidad de medida",
                example = "kg"
        )
        String simbolo,

        @Schema(
                description = "Indica si la unidad de medida admite valores decimales",
                example = "true"
        )
        Boolean permiteDecimal,

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
